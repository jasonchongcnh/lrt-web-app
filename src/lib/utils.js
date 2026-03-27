import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getName(obj, language = 'en') {
  if (!obj) return '';
  return obj[language] || obj['en'] || '';
}
