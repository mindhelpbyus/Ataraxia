import React from 'react';

export function AppLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Ataraxia...</h2>
        <p className="text-gray-600">Please wait while we prepare your wellness management system</p>
      </div>
    </div>
  );
}