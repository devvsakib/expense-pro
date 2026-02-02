'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themes, type Theme } from '@/lib/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [themeName, setThemeName] = useState('Default');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedTheme = localStorage.getItem('xpns-theme') || 'Default';
        setThemeName(storedTheme);
    }, []);

    useEffect(() => {
        if (isMounted) {
            const currentTheme = themes.find(t => t.name === themeName) || themes[0];
            const root = document.documentElement;

            root.classList.remove('light', 'dark');
            root.classList.add(currentTheme.mode);

            Object.entries(currentTheme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
            });
            
            localStorage.setItem('xpns-theme', themeName);
        }
    }, [themeName, isMounted]);

    const setTheme = (name: string) => {
        setThemeName(name);
    };

    const theme = themes.find(t => t.name === themeName) || themes[0];

    // Prevents flash of unstyled content
    if (!isMounted) {
        return (
            <div style={{ visibility: 'hidden' }}>
                {children}
            </div>
        );
    }
  
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
