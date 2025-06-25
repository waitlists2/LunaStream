import React from 'react';

const LastUpdated: React.FC = () => {
  const lastUpdated = new Date(document.lastModified);
  const localTime = lastUpdated.toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Last Updated</h2>
        <p className="text-lg text-gray-600">This page was last updated on:</p>
        <p className="text-xl font-semibold text-gray-800">{localTime}</p>
      </div>
    </div>
  );
};

export default LastUpdated;
