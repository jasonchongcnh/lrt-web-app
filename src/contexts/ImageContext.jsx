import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from './LanguageContext';

const ImageContext = createContext();

const ZoomableImage = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const lastDistanceRef = useRef(0);
  const isDraggingRef = useRef(false);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 1), 5);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastDistanceRef.current = distance;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDraggingRef.current && scale > 1) {
      const deltaX = e.touches[0].clientX - lastTouchRef.current.x;
      const deltaY = e.touches[0].clientY - lastTouchRef.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const delta = distance / lastDistanceRef.current;
      const newScale = Math.min(Math.max(scale * delta, 1), 5);
      
      setScale(newScale);
      lastDistanceRef.current = distance;
      
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    lastDistanceRef.current = 0;
  };

  const handleDoubleTap = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Prevent default gestures
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    container.addEventListener('touchstart', preventDefault, { passive: false });
    return () => container.removeEventListener('touchstart', preventDefault);
  }, []);

  let lastTap = 0;
  const onTouchEndWrapper = (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleDoubleTap();
    }
    lastTap = now;
    handleTouchEnd();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={onTouchEndWrapper}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out select-none pointer-events-none shadow-2xl"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      />
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[10001]">
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-black/50 text-white border-none rounded-full h-10 w-10 backdrop-blur-md"
          onClick={(e) => { e.stopPropagation(); setScale(prev => Math.min(prev + 0.5, 5)); }}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-black/50 text-white border-none rounded-full h-10 w-10 backdrop-blur-md"
          onClick={(e) => { e.stopPropagation(); setScale(prev => Math.max(prev - 0.5, 1)); if (scale <= 1.5) resetZoom(); }}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-black/50 text-white border-none rounded-full h-10 w-10 backdrop-blur-md"
          onClick={(e) => { e.stopPropagation(); resetZoom(); }}
        >
          <Maximize className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export const ImageProvider = ({ children }) => {
  const [activeImage, setActiveImage] = useState(null);
  const { t } = useLanguage();

  const showImage = (url, title) => {
    setActiveImage({ url, title });
  };

  return (
    <ImageContext.Provider value={{ showImage }}>
      {children}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col transition-all duration-300 animate-in fade-in"
          onClick={() => setActiveImage(null)}
        >
          {/* Header */}
          <div className="p-4 pt-10 flex justify-between items-center z-[10000]">
            <div className="flex-1 px-4">
              <h3 className="text-white font-bold text-lg truncate drop-shadow-md">
                {activeImage.title}
              </h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(null);
              }}
            >
              <X className="w-8 h-8" />
            </Button>
          </div>
          
          {/* Main Zoomable Content */}
          <div className="flex-1 w-full relative" onClick={(e) => e.stopPropagation()}>
            <ZoomableImage src={activeImage.url} alt={activeImage.title} />
          </div>
          
          {/* Footer Info */}
          <div className="p-6 text-center text-white/70 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-sm">
              {t('station_zoom_instructions')}
            </p>
            <p className="text-[10px] mt-2 opacity-50">
              {t('station_click_bg_close')}
            </p>
          </div>
        </div>
      )}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};
