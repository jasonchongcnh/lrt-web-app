import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from './language';
import { ImageContext } from './image';

const imageLabels = {
  en: { close: 'Close image', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset zoom' },
  zh: { close: '關閉圖片', zoomIn: '放大', zoomOut: '縮小', reset: '重設縮放' },
  'zh-CN': { close: '关闭图片', zoomIn: '放大', zoomOut: '缩小', reset: '重置缩放' },
  pt: { close: 'Fechar imagem', zoomIn: 'Ampliar', zoomOut: 'Reduzir', reset: 'Repor ampliação' },
};
const initialTransform = { scale: 1, x: 0, y: 0 };
const clampScale = (scale) => Math.min(5, Math.max(1, scale));
const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const zoomBy = (transform, factor) => {
  const scale = clampScale(transform.scale * factor);
  return scale === 1 ? initialTransform : { ...transform, scale };
};

function ZoomableImage({ src, alt, labels, onClose }) {
  const [transform, setTransform] = useState(initialTransform);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const pointersRef = useRef(new Map());
  const pinchDistanceRef = useRef(0);
  const gestureRef = useRef(null);
  const lastTapRef = useRef(0);

  const resetZoom = () => setTransform(initialTransform);

  // React's delegated wheel handler may be passive. Register on the viewer so
  // preventing page zoom/scroll works consistently on trackpads and mice.
  useEffect(() => {
    const container = containerRef.current;
    const onWheel = (event) => {
      event.preventDefault();
      setTransform((previous) => zoomBy(previous, event.deltaY > 0 ? 0.9 : 1.1));
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointersRef.current.size === 1) {
      gestureRef.current = { start: point, moved: false, multiple: false, startedAt: Date.now() };
    } else {
      gestureRef.current.multiple = true;
      lastTapRef.current = 0;
      const [first, second] = [...pointersRef.current.values()];
      pinchDistanceRef.current = distanceBetween(first, second);
    }
  };

  const handlePointerMove = (event) => {
    const previousPoint = pointersRef.current.get(event.pointerId);
    if (!previousPoint) return;
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    if (distanceBetween(gestureRef.current.start, point) > 5) gestureRef.current.moved = true;

    if (pointersRef.current.size >= 2) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = distanceBetween(first, second);
      // Two fingers can initially occupy the same pixel. Wait for a positive
      // distance rather than allowing a zero division to poison the transform.
      if (distance > 0 && pinchDistanceRef.current > 0) {
        const ratio = distance / pinchDistanceRef.current;
        setTransform((previous) => zoomBy(previous, ratio));
      }
      pinchDistanceRef.current = distance;
    } else {
      const dx = point.x - previousPoint.x;
      const dy = point.y - previousPoint.y;
      setTransform((previous) => previous.scale > 1
        ? { ...previous, x: previous.x + dx, y: previous.y + dy }
        : previous);
    }
  };

  const finishPointer = (event, cancelled = false) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const gesture = gestureRef.current;
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (pointersRef.current.size < 2) pinchDistanceRef.current = 0;
    if (pointersRef.current.size !== 0) return;

    if (!cancelled && !gesture.multiple && !gesture.moved && Date.now() - gesture.startedAt < 350) {
      const bounds = imageRef.current.getBoundingClientRect();
      const outsideImage = event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outsideImage) {
        onClose();
      } else {
        const now = Date.now();
        if (lastTapRef.current > 0 && now - lastTapRef.current < 300) {
          setTransform((previous) => previous.scale > 1 ? initialTransform : { scale: 2.5, x: 0, y: 0 });
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }
    } else {
      lastTapRef.current = 0;
    }
    gestureRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden touch-none ${transform.scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        draggable={false}
        className="max-w-full max-h-full object-contain select-none pointer-events-none shadow-2xl"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[10001]" onPointerDown={(event) => event.stopPropagation()}>
        <Button
          type="button"
          size="icon"
          aria-label={labels.zoomIn}
          className="bg-black/50 text-white border-none rounded-full h-10 w-10 backdrop-blur-md"
          onClick={(event) => {
            event.stopPropagation();
            setTransform((previous) => ({ ...previous, scale: clampScale(previous.scale + 0.5) }));
          }}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          aria-label={labels.zoomOut}
          className="bg-black/50 text-white border-none rounded-full h-10 w-10 backdrop-blur-md"
          onClick={(event) => {
            event.stopPropagation();
            setTransform((previous) => previous.scale <= 1.5 ? initialTransform : { ...previous, scale: previous.scale - 0.5 });
          }}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          aria-label={labels.reset}
          className="bg-black/50 text-white border-none rounded-full h-10 w-10 backdrop-blur-md"
          onClick={(event) => { event.stopPropagation(); resetZoom(); }}
        >
          <Maximize className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

export const ImageProvider = ({ children }) => {
  const [activeImage, setActiveImage] = useState(null);
  const sequenceRef = useRef(0);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = useId();
  const { t, language } = useLanguage();
  const labels = imageLabels[language] ?? imageLabels.en;

  const showImage = useCallback((url, title) => {
    sequenceRef.current += 1;
    setActiveImage({ url, title, id: sequenceRef.current });
  }, []);
  const closeImage = useCallback(() => setActiveImage(null), []);
  const value = useMemo(() => ({ showImage }), [showImage]);

  useEffect(() => {
    if (!activeImage) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeImage();
      }
      if (event.key === 'Tab') {
        const controls = [...dialogRef.current.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')]
          .filter((control) => !control.disabled);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
    };
  }, [activeImage, closeImage]);

  return (
    <ImageContext.Provider value={value}>
      {children}
      {activeImage && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
          onClick={closeImage}
        >
          <div className="p-4 pt-10 flex justify-between items-center z-[10000]" onClick={(event) => event.stopPropagation()}>
            <div className="flex-1 px-4 min-w-0">
              <h3 id={titleId} className="text-white font-bold text-lg truncate drop-shadow-md">{activeImage.title}</h3>
            </div>
            <Button
              ref={closeButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={labels.close}
              className="text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={closeImage}
            >
              <X className="w-8 h-8" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 w-full relative" onClick={(event) => event.stopPropagation()}>
            <ZoomableImage key={activeImage.id} src={activeImage.url} alt={activeImage.title} labels={labels} onClose={closeImage} />
          </div>
          <div className="p-6 text-center text-white/70 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-sm">{t('station_zoom_instructions')}</p>
            <p className="text-[10px] mt-2 opacity-50">{t('station_click_bg_close')}</p>
          </div>
        </div>
      )}
    </ImageContext.Provider>
  );
};
