/// <reference types="react" />
import React from 'react';
import { HashRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PdfReaderPage } from './pages/PdfReaderPage';
import { ResearchPage } from './pages/ResearchPage';
import { PrayerTimesBar } from './components/layout/PrayerTimesBar'; // Import the new component
import { Book, FileText, Home, Search, Settings } from 'lucide-react';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-background text-textPrimary">
        <PrayerTimesBar /> {/* Add the PrayerTimesBar here */}
        
        {/* Adjust top margin of nav to account for the fixed PrayerTimesBar height (assumed h-16 or 4rem) */}
        <nav className="bg-primary-dark shadow-md text-white mt-16"> {/* mt-16 assuming PrayerTimesBar is h-16 */}
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">مدينة العلم</Link>
            <div className="flex items-center space-x-4 space-x-reverse">
              <NavLink to="/" className={({ isActive }) => `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded hover:bg-primary ${isActive ? 'bg-primary' : ''}`}>
                <Home size={20} />
                <span>الرئيسية</span>
              </NavLink>
              <NavLink to="/reader" className={({ isActive }) => `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded hover:bg-primary ${isActive ? 'bg-primary' : ''}`}>
                <FileText size={20} />
                <span>قارئ PDF</span>
              </NavLink>
              <NavLink to="/research" className={({ isActive }) => `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded hover:bg-primary ${isActive ? 'bg-primary' : ''}`}>
                <Search size={20} />
                <span>البحث العلمي</span>
              </NavLink>
               {/* Placeholder for Settings/More icon if needed */}
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reader" element={<PdfReaderPage />} />
            <Route path="/research" element={<ResearchPage />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; {new Date().getFullYear()} مدينة العلم. جميع الحقوق محفوظة.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;