import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';

const FareQuery = () => {
  const { t, language } = useLanguage();
  const [fareType, setFareType] = useState('single');

  const bands = [
    { max: 3, single: 6, stored: 3, student: 1.5 },
    { max: 6, single: 8, stored: 4, student: 2 },
    { max: 9, single: 10, stored: 5, student: 2.5 },
    { max: 12, single: 12, stored: 6, student: 3 },
  ];
  const priceFor = (band) => {
    if (fareType === 'free') return 0;
    if (fareType === 'single') return band.single;
    if (fareType === 'stored') return band.stored;
    if (fareType === 'student') return band.student;
    return band.single;
  };

  const rules = [
    { 
      zh: '長者/殘疾人士電子卡：全程免費', 
      en: 'Elderly/Disabled Electronic Card: Free of charge for the entire journey' 
    },
    { 
      zh: '殘疾人士/長者個人澳門通卡：等同於長者/和殘疾人士電子卡', 
      en: 'Personalized Macau Pass for Disabled/Elderly: Equivalent to Elderly/Disabled Electronic Card' 
    },
    { 
      zh: '一般澳門通卡：享一般輕軌通之優惠', 
      en: 'General Macau Pass: Enjoys the same discounts as the general LRT Card' 
    },
    { 
      zh: '學生個人澳門通卡：等同於學生電子預付卡', 
      en: 'Personalized Macau Pass for Students: Equivalent to Student Electronic Prepaid Card' 
    },
    { 
      zh: '身高一米以下的小童無需購票，但須由一名成人隨行', 
      en: 'Children under one meter in height do not need a ticket but must be accompanied by an adult' 
    }
  ];

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white p-6 pb-4 shadow-sm rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('nav_fare')}</h1>
        <Tabs defaultValue="query" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl h-12">
            <TabsTrigger value="query" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium">{t('fare_query_title')}</TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-medium">{t('fare_rules_title')}</TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="mt-6 space-y-6">
             <div className="space-y-3">
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{t('route_fare_type')}</label>
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { id:'single', label: t('fare_type_single') },
                   { id:'stored', label: t('fare_type_stored') },
                   { id:'student', label: t('fare_type_student') },
                   { id:'free', label: t('fare_type_free') },
                 ].map(type => (
                   <button key={type.id} onClick={()=>setFareType(type.id)} className={`p-3 rounded-xl text-left border ${fareType===type.id?'border-blue-500 bg-blue-50':'border-slate-200 bg-white'}`}>
                     <div className="flex items-center justify-between">
                       <span className="font-medium text-slate-900 text-sm">{type.label}</span>
                       {fareType===type.id && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                     </div>
                   </button>
                 ))}
               </div>
             </div>

             <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl mt-2">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-slate-400 text-sm">{t('fare_tiered_fares')}</span>
               </div>
               <div className="space-y-4">
                  {bands.map((b, idx)=>(
                    <div className="flex justify-between text-sm" key={idx}>
                      <span className="text-slate-300">{t('fare_stops_count').replace('{max}', b.max)}</span>
                      <span className="font-semibold">{`MOP ${priceFor(b).toFixed((priceFor(b)%1)?1:0)}`}</span>
                    </div>
                  ))}
               </div>
               <div className="mt-4 text-xs text-slate-400">
                 {t('route_fare_rules')}
              </div>
             </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6 px-1">
            <div className="space-y-4 pb-20">
              {rules.map((rule, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
                  <p className="text-slate-600 text-sm leading-relaxed">{language === 'zh' ? rule.zh : rule.en}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FareQuery;
