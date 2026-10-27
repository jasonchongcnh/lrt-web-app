const messages = {
  en: {
    back: 'Back to home', local: 'Preferences saved in this browser', appearance: 'Appearance',
    light: 'Light', dark: 'Dark', noFavorites: 'No saved stations yet. Save a station from its details page.',
    noReminders: 'No active reminders. Set one from the home or station page.',
    before: '{minutes} min before departure',
    info: 'About this app & privacy', source: 'Operator timetables',
    about: 'This independent guide calculates estimates from published timetables. Check the operator for service changes.',
    privacy: 'Language, appearance, saved stations and reminders are kept in this browser. Maps and images may load from external providers. Location access is optional and helps find nearby stations.',
  },
  zh: {
    back: '返回首頁', local: '偏好設定儲存在此瀏覽器', appearance: '外觀',
    light: '淺色', dark: '深色', noFavorites: '尚未收藏車站。您可在車站詳情頁收藏車站。',
    noReminders: '目前沒有提醒。您可在首頁或車站頁設定提醒。',
    before: '列車開出前 {minutes} 分鐘',
    info: '關於此應用程式及私隱', source: '營運商時間表',
    about: '此獨立指南根據已公布的時間表計算預計時間。服務變更請查閱營運商公告。',
    privacy: '語言、外觀、收藏車站及提醒儲存在此瀏覽器。地圖及圖片可能從外部服務載入。位置權限為選用，用於尋找附近車站。',
  },
  'zh-CN': {
    back: '返回首页', local: '偏好设置保存在此浏览器', appearance: '外观',
    light: '浅色', dark: '深色', noFavorites: '尚未收藏车站。您可在车站详情页收藏车站。',
    noReminders: '目前没有提醒。您可在首页或车站页设置提醒。',
    before: '列车开出前 {minutes} 分钟',
    info: '关于此应用程序及隐私', source: '运营商时刻表',
    about: '此独立指南根据已公布的时刻表计算预计时间。服务变更请查看运营商公告。',
    privacy: '语言、外观、收藏车站及提醒保存在此浏览器。地图及图片可能从外部服务加载。位置权限为可选，用于寻找附近车站。',
  },
  pt: {
    back: 'Voltar ao início', local: 'Preferências guardadas neste navegador', appearance: 'Aspeto',
    light: 'Claro', dark: 'Escuro', noFavorites: 'Ainda não há estações guardadas. Guarde uma na página da estação.',
    noReminders: 'Não há lembretes ativos. Defina um no início ou na página da estação.',
    before: '{minutes} min antes da partida',
    info: 'Sobre a aplicação e privacidade', source: 'Horários da operadora',
    about: 'Este guia independente calcula estimativas com os horários publicados. Consulte a operadora sobre alterações ao serviço.',
    privacy: 'O idioma, aspeto, estações guardadas e lembretes ficam neste navegador. Os mapas e imagens podem ser carregados de serviços externos. A localização é opcional e ajuda a encontrar estações próximas.',
  },
};

export function settingsText(language, key, values = {}) {
  let text = messages[language]?.[key] ?? messages.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}
