const messages = {
  en: {
    reminder_scope: 'Keep this app open for reminders. Browser notifications depend on your browser permissions.',
    reminder_direction: 'Direction', reminder_enabled: 'Reminder enabled', reminder_removed: 'Reminder removed',
    reminder_saved: 'Reminder saved', reminder_no_train: 'No upcoming train is available for this direction.',
    reminder_weekdays_trains: 'Each train on weekdays', reminder_weekends_trains: 'Each train on weekends',
    reminder_due: '{station}: train to {direction} in {minutes} min',
    reminder_cancel_action: 'Cancel reminder', reminder_set_action: 'Set reminder', close: 'Close',
    favorite_add: 'Save station', favorite_remove: 'Remove saved station', settings: 'Settings',
    calendar_unknown: 'Public-holiday dates are unavailable for this year. Check the operator’s timetable on holidays.',
    map_unavailable: 'The map is unavailable. You can select a station below.',
  },
  zh: {
    reminder_scope: '提醒需要保持此應用程式開啟。瀏覽器通知取決於您的瀏覽器權限。',
    reminder_direction: '方向', reminder_enabled: '已啟用提醒', reminder_removed: '已取消提醒',
    reminder_saved: '已儲存提醒', reminder_no_train: '此方向目前沒有即將開出的列車。',
    reminder_weekdays_trains: '工作日每班列車', reminder_weekends_trains: '週末每班列車',
    reminder_due: '{station}：往{direction}列車將於 {minutes} 分鐘後到站',
    reminder_cancel_action: '取消提醒', reminder_set_action: '設定提醒', close: '關閉',
    favorite_add: '收藏車站', favorite_remove: '取消收藏', settings: '設定',
    calendar_unknown: '尚未提供本年度公眾假期日期。假日請查閱營運商時間表。',
    map_unavailable: '地圖暫時無法載入，您仍可在下方選擇車站。',
  },
  'zh-CN': {
    reminder_scope: '提醒需要保持此应用程序开启。浏览器通知取决于您的浏览器权限。',
    reminder_direction: '方向', reminder_enabled: '已启用提醒', reminder_removed: '已取消提醒',
    reminder_saved: '已保存提醒', reminder_no_train: '此方向目前没有即将开出的列车。',
    reminder_weekdays_trains: '工作日每班列车', reminder_weekends_trains: '周末每班列车',
    reminder_due: '{station}：往{direction}列车将于 {minutes} 分钟后到站',
    reminder_cancel_action: '取消提醒', reminder_set_action: '设定提醒', close: '关闭',
    favorite_add: '收藏车站', favorite_remove: '取消收藏', settings: '设置',
    calendar_unknown: '尚未提供本年度公众假期日期。假日请查阅运营商时间表。',
    map_unavailable: '地图暂时无法加载，您仍可在下方选择车站。',
  },
  pt: {
    reminder_scope: 'Mantenha a aplicação aberta para receber lembretes. As notificações dependem das permissões do navegador.',
    reminder_direction: 'Direção', reminder_enabled: 'Lembrete ativado', reminder_removed: 'Lembrete removido',
    reminder_saved: 'Lembrete guardado', reminder_no_train: 'Não há comboio próximo nesta direção.',
    reminder_weekdays_trains: 'Cada comboio nos dias úteis', reminder_weekends_trains: 'Cada comboio nos fins de semana',
    reminder_due: '{station}: comboio para {direction} dentro de {minutes} min',
    reminder_cancel_action: 'Cancelar lembrete', reminder_set_action: 'Definir lembrete', close: 'Fechar',
    favorite_add: 'Guardar estação', favorite_remove: 'Remover estação guardada', settings: 'Definições',
    calendar_unknown: 'Os feriados deste ano não estão disponíveis. Consulte o horário da operadora nos feriados.',
    map_unavailable: 'O mapa não está disponível. Pode selecionar uma estação abaixo.',
  },
};

export function extraText(language, key, values = {}) {
  let message = messages[language]?.[key] ?? messages.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) message = message.replaceAll(`{${name}}`, String(value));
  return message;
}
