import React from 'react';
import Nav from '../components/Nav';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-blue-50">
      <Nav />
      <main className="w-full mx-auto p-4 h-full">
        {children}
      </main>
    </div>
  );
}
