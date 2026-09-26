import React from 'react';
import { Link } from 'react-router-dom';
import { Dog, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner">
          <Dog className="w-14 h-14" />
        </div>
        
        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200 mb-3">
          404 ERROR
        </span>
        
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
          Ruh-roh! Page Not Found
        </h1>
        
        <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
          Looks like this page chased a squirrel and wandered off. Let's get you back on track with your furry friends!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
