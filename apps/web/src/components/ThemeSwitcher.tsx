'use client';

import { useState } from 'react';

const themes = {
  viridian: {
    name: 'Viridian Green',
    colors: {
      '--color-primary-50': '240 253 248',
      '--color-primary-100': '220 252 233',
      '--color-primary-200': '187 247 211',
      '--color-primary-300': '134 239 172',
      '--color-primary-400': '64 130 109',
      '--color-primary-500': '0 150 136',
      '--color-primary-600': '0 121 107',
      '--color-primary-700': '0 105 92',
      '--color-primary-800': '0 77 64',
      '--color-primary-900': '0 61 50',
    }
  },
  azure: {
    name: 'Azure Blue',
    colors: {
      '--color-primary-50': '240 249 255',
      '--color-primary-100': '224 242 254',
      '--color-primary-200': '186 230 253',
      '--color-primary-300': '125 211 252',
      '--color-primary-400': '56 189 248',
      '--color-primary-500': '14 165 233',
      '--color-primary-600': '2 132 199',
      '--color-primary-700': '3 105 161',
      '--color-primary-800': '7 89 133',
      '--color-primary-900': '12 74 110',
    }
  },
  coral: {
    name: 'Coral Pink',
    colors: {
      '--color-primary-50': '255 247 245',
      '--color-primary-100': '255 237 234',
      '--color-primary-200': '254 215 207',
      '--color-primary-300': '253 186 172',
      '--color-primary-400': '251 146 120',
      '--color-primary-500': '248 113 93',
      '--color-primary-600': '239 68 68',
      '--color-primary-700': '220 38 38',
      '--color-primary-800': '185 28 28',
      '--color-primary-900': '153 27 27',
    }
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      '--color-primary-50': '250 245 255',
      '--color-primary-100': '243 232 255',
      '--color-primary-200': '233 213 255',
      '--color-primary-300': '216 180 254',
      '--color-primary-400': '196 141 253',
      '--color-primary-500': '168 85 247',
      '--color-primary-600': '147 51 234',
      '--color-primary-700': '126 34 206',
      '--color-primary-800': '107 33 168',
      '--color-primary-900': '88 28 135',
    }
  }
};

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('viridian');

  const applyTheme = (themeKey: keyof typeof themes) => {
    const theme = themes[themeKey];
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    setCurrentTheme(themeKey);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-4">
        <h3 className="text-sm font-medium text-secondary-900 mb-3">Theme Switcher</h3>
        <div className="space-y-2">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => applyTheme(key as keyof typeof themes)}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${currentTheme === key
                  ? 'bg-primary-100 text-primary-900 border border-primary-300'
                  : 'hover:bg-secondary-100 text-secondary-700'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-secondary-300"
                  style={{
                    backgroundColor: `rgb(${theme.colors['--color-primary-500']})`
                  }}
                />
                {theme.name}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-secondary-200">
          <p className="text-xs text-secondary-500">
            Click any theme to see instant changes!
          </p>
        </div>
      </div>
    </div>
  );
}