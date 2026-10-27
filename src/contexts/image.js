import { createContext, useContext } from 'react';

export const ImageContext = createContext(null);

export function useImage() {
  const context = useContext(ImageContext);
  if (!context) throw new Error('useImage must be used within an ImageProvider');
  return context;
}
