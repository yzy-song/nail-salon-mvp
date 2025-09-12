import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-6 border-t mt-12">
      <div className="container mx-auto text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} yzysong.com. All rights reserved.</p>
      </div>
    </footer>
  );
};
