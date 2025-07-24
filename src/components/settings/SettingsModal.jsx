import React from 'react';

export const SettingsModal = ({ visible, onClose, setting }) => {
  if (!visible || !setting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          ✕
        </button>

        <div className="mb-4">
          <div className="text-xl font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
            <setting.icon className="w-5 h-5" />
            <span>{setting.title}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{setting.description}</div>
        </div>

        <div className="space-y-4">
          {setting.subOptions?.map((sub, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-md p-3"
            >
              <div className="flex items-center space-x-3">
                <sub.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div className="text-sm text-gray-700 dark:text-gray-200">{sub.label}</div>
              </div>
              {typeof sub.value === 'boolean' ? (
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={sub.value} readOnly className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-checked:bg-green-500 rounded-full peer transition duration-300 relative">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </div>
                </label>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300">{sub.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
