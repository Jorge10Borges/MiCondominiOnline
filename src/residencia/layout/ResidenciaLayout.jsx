import React from 'react';
import Nav from '../components/Nav';

export default function ResidenciaLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-green-50">
      <Nav />
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
