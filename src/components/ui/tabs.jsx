import * as React from 'react';
import { cn } from '../../lib/utils';

const TabsContext = React.createContext(null);
const tabId = (baseId, value) => `${baseId}-tab-${encodeURIComponent(value)}`;
const panelId = (baseId, value) => `${baseId}-panel-${encodeURIComponent(value)}`;

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const baseId = React.useId();
  const activeTab = value ?? internalValue;
  const setActiveTab = React.useCallback((next) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }, [value, onValueChange]);
  const context = React.useMemo(() => ({ activeTab, setActiveTab, baseId }), [activeTab, setActiveTab, baseId]);

  return (
    <TabsContext.Provider value={context}>
      <div ref={ref} className={cn('w-full', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef(({ className, onKeyDown, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    aria-orientation="horizontal"
    className={cn('inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500', className)}
    onKeyDown={(event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')].filter((tab) => !tab.disabled);
      const index = tabs.indexOf(document.activeElement);
      if (index === -1) return;
      event.preventDefault();
      let next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    }}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, onClick, disabled, ...props }, ref) => {
  const { activeTab, setActiveTab, baseId } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-controls={panelId(baseId, value)}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setActiveTab(value);
      }}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const { activeTab, baseId } = React.useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={0}
      className={cn('mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2', className)}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
