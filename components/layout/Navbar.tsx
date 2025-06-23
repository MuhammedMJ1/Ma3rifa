
// This component is illustrative. The main navigation is currently in App.tsx for simplicity.
// If more complex navbar logic is needed, it can be expanded here.
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-primary-dark text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-primary-light transition-colors">
          مدينة العلم
        </Link>
        <div className="space-x-4 space-x-reverse">
          <Link to="/" className="hover:text-primary-light transition-colors flex items-center">
            <Home size={20} className="ml-1" /> الرئيسية
          </Link>
          <Link to="/reader" className="hover:text-primary-light transition-colors flex items-center">
            <BookOpen size={20} className="ml-1" /> قارئ PDF
          </Link>
          <Link to="/research" className="hover:text-primary-light transition-colors flex items-center">
            <Search size={20} className="ml-1" /> البحث العلمي
          </Link>
        </div>
      </div>
    </nav>
  );
};