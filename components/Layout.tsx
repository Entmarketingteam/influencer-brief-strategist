
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-rose-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
              Brief Strategist
            </h1>
          </div>
          <div className="hidden sm:block text-sm text-gray-500 font-medium italic">
            "Helping you shine, one compliant post at a time." ✨
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-rose-100 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-sm">
          Built for the Creators & Big Sisters of the wellness space.
        </div>
      </footer>
    </div>
  );
};
