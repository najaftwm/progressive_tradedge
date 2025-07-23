import { createContext, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const colors = {
    background: '#fff',
    text: '#000',
    vgreen: '#4CAF50',
    success: '#388E3C',
    card: '#fff',
    border: '#ddd',
    shadowColor: '#000',
  };
  return ThemeContext.Provider({ value: { colors }, children });
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};