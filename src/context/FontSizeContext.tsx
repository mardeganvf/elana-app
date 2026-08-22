import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeLevel = 'sm' | 'md' | 'lg';

interface FontSizeContextType {
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(() => {
    const saved = localStorage.getItem('elana-font-size') as FontSizeLevel;
    return saved === 'sm' || saved === 'lg' ? saved : 'md';
  });

  const setFontSize = (size: FontSizeLevel) => {
    setFontSizeState(size);
    localStorage.setItem('elana-font-size', size);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'sm') {
      root.style.fontSize = '14.5px';
    } else if (fontSize === 'lg') {
      root.style.fontSize = '17.5px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
