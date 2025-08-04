import React from 'react';
import Nav from '../components/Nav';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Nav />
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
