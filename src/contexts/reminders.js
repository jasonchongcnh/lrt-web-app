import { createContext, useContext } from 'react';

export const ReminderContext = createContext(null);
export function useReminders() {
  const context = useContext(ReminderContext);
  if (!context) throw new Error('useReminders requires ReminderProvider');
  return context;
}
