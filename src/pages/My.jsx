import React from 'react';
import { Settings, Bell, Star, FileText, Globe, Moon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';

const My = () => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const menuItems = [
    { icon: Star, label: t('my_favorites') },
    { icon: Bell, label: t('my_reminders') },
    { icon: Settings, label: t('my_settings') },
    { 
      icon: Globe, 
      label: t('my_language'), 
      action: toggleLanguage,
      value: language === 'en' ? 'English' : '中文'
    },
    { icon: Moon, label: t('my_dark_mode') },
    { icon: FileText, label: t('my_terms') },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-slate-900 text-white p-6 pt-10">
        <h1 className="text-2xl font-bold">{t('my_title')}</h1>
        <p className="text-slate-400">{t('my_guest')}</p>
      </div>

      <div className="p-4 space-y-4 -mt-4">
         <Card className="shadow-md border-0">
            <CardContent className="p-0">
               {menuItems.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={item.action}
                    className="flex items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                  >
                     <item.icon className="w-5 h-5 text-slate-500 mr-3" />
                     <span className="flex-1 font-medium text-slate-700">{item.label}</span>
                     {item.value && (
                       <span className="text-sm text-slate-400 font-medium">{item.value}</span>
                     )}
                  </div>
               ))}
            </CardContent>
         </Card>

         <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
            {t('my_logout')}
         </Button>
      </div>
    </div>
  );
};

export default My;