'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme color presets
export const themePresets = {
  teal: {
    name: 'Teal',
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#059669',
    gradient: 'from-teal-500 to-teal-600',
  },
  emerald: {
    name: 'Emerald',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#047857',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  green: {
    name: 'Green',
    primary: '#16a34a',
    secondary: '#22c55e',
    accent: '#15803d',
    gradient: 'from-green-500 to-green-600',
  },
  cyan: {
    name: 'Cyan',
    primary: '#0891b2',
    secondary: '#06b6d4',
    accent: '#0e7490',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  stone: {
    name: 'Stone',
    primary: '#78716c',
    secondary: '#a8a29e',
    accent: '#57534e',
    gradient: 'from-stone-500 to-stone-600',
  },
};

// Font size presets
export const fontSizePresets = {
  small: { name: 'Small', size: '14px', label: 'Petit' },
  medium: { name: 'Medium', size: '16px', label: 'Moyen' },
  large: { name: 'Large', size: '18px', label: 'Grand' },
  xlarge: { name: 'Extra Large', size: '20px', label: 'Très grand' },
};

// Font family presets
export const fontFamilyPresets = {
  sans: { name: 'Sans Serif', family: 'ui-sans-serif, system-ui, sans-serif', label: 'Sans Serif' },
  serif: { name: 'Serif', family: 'ui-serif, Georgia, serif', label: 'Serif' },
  mono: { name: 'Monospace', family: 'ui-monospace, monospace', label: 'Monospace' },
};

// Chart color schemes
export const chartColorSchemes = {
  default: {
    name: 'Default',
    available: '#10b981',
    sold: '#f97316',
  },
  ocean: {
    name: 'Ocean',
    available: '#0891b2',
    sold: '#6366f1',
  },
  forest: {
    name: 'Forest',
    available: '#059669',
    sold: '#84cc16',
  },
  sunset: {
    name: 'Sunset',
    available: '#f59e0b',
    sold: '#ef4444',
  },
  purple: {
    name: 'Purple',
    available: '#8b5cf6',
    sold: '#ec4899',
  },
};

interface AppSettings {
  theme: keyof typeof themePresets;
  fontSize: keyof typeof fontSizePresets;
  fontFamily: keyof typeof fontFamilyPresets;
  chartColors: keyof typeof chartColorSchemes;
  customPrimaryColor: string;
  animationsEnabled: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  themeColors: typeof themePresets.teal;
  chartColorsConfig: typeof chartColorSchemes.default;
  fontConfig: { size: string; family: string };
}

const defaultSettings: AppSettings = {
  theme: 'teal',
  fontSize: 'medium',
  fontFamily: 'sans',
  chartColors: 'default',
  customPrimaryColor: '#0d9488',
  animationsEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);

  useEffect(() => {
    // Apply font settings to document
    const root = document.documentElement;
    const fontSize = fontSizePresets[settings.fontSize].size;
    const fontFamily = fontFamilyPresets[settings.fontFamily].family;
    
    root.style.fontSize = fontSize;
    root.style.fontFamily = fontFamily;
    
    // Apply CSS variables for theme
    const theme = themePresets[settings.theme];
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('appSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    setSettings(defaultSettings);
  };

  const themeColors = themePresets[settings.theme];
  const chartColorsConfig = chartColorSchemes[settings.chartColors];
  const fontConfig = {
    size: fontSizePresets[settings.fontSize].size,
    family: fontFamilyPresets[settings.fontFamily].family,
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        themeColors,
        chartColorsConfig,
        fontConfig,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
