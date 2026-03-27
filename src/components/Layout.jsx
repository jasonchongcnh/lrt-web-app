import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Map, Ticket, MapPin, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

const Layout = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [timeStr, setTimeStr] = useState('00:00');

  useEffect(() => {
    const fmt = (n) => (n < 10 ? `0${n}` : `${n}`);
    const update = () => {
      const now = new Date();
      const gmt8 = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
      setTimeStr(`${fmt(gmt8.getHours())}:${fmt(gmt8.getMinutes())}`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { path: '/', label: t('nav_home'), icon: Home },
    { path: '/route', label: t('nav_route'), icon: Map },
    { path: '/fare', label: t('nav_fare'), icon: Ticket },
    { path: '/station', label: t('nav_station'), icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 w-full mx-auto p-0">
        <div className="bg-white min-h-full overflow-hidden relative pb-24">
          <Outlet />
        </div>
      </main>
      
      {/* Fixed Bottom Navigation - Shown on all screens */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-3 pb-8 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                  isActive ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn(
                  "p-1 rounded-xl transition-colors",
                  isActive ? "bg-blue-50" : "bg-transparent"
                )}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
