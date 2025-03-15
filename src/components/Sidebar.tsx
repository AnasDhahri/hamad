import React from 'react';
import { Headphones, History } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const recentTranslations = [
  'English → Spanish: Business meeting discussion',
  'Spanish → English: Family conversation',
  'English → French: Travel directions',
  'German → English: Technical support',
  'English → Japanese: Greeting and introduction',
  'Chinese → English: Restaurant order'
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 dark:bg-[#1C1C1C] h-screen p-4 flex flex-col transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 dark:text-white font-semibold">LiveTranslate</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="space-y-1">
        <div className="pt-4">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 px-2 py-2">
            <History size={18} />
            <span>Recent Translations</span>
          </div>
          <div className="mt-2 space-y-1">
            {recentTranslations.map((translation, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-left text-sm transition-colors"
              >
                {translation}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;