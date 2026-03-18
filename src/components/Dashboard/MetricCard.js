import React from 'react';

function MetricCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  };

  const iconClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-row items-center border border-gray-100 dark:border-gray-700">
      <div className={`p-4 rounded-full mr-4 flex items-center justify-center ${iconClass}`} style={{ width: '60px', height: '60px' }}>
        <i className={`fas ${icon} text-2xl`}></i>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

export default MetricCard;
