import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SettingItem = ({ icon: Icon, label, value, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition mb-3 shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-800 dark:text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800 dark:text-white">{label}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{value}</div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-300" />
    </div>
  );
};
