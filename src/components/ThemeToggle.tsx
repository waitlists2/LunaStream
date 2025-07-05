import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const ThemeToggle: React.FC = () => {
  const { theme, isDark, toggleTheme } = useDarkMode();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'system':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800' 
          : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
        }
      `}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <div className="relative">
        {getIcon()}
        
        {/* Theme indicator dot */}
        <div className={`
          absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-200
          ${theme === 'system' 
            ? 'bg-green-400 shadow-lg shadow-green-400/50' 
            : theme === 'dark' 
              ? 'bg-blue-400 shadow-lg shadow-blue-400/50' 
              : 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
          }
        `} />
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        {getTooltip()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-200"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;