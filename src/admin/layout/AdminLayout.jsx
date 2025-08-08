import React from 'react';
import Nav from '../components/Nav';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Nav />
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
