import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 border-t border-gray-700/50" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center space-x-6 text-sm mb-6 text-gray-400">
          <a href="/about" className="hover:text-[var(--color-accent)] transition duration-200">About Us</a>
          <a href="/terms" className="hover:text-[var(--color-accent)] transition duration-200">Terms of Service</a>
          <a href="/privacy" className="hover:text-[var(--color-accent)] transition duration-200">Privacy Policy</a>
          <a href="/contact" className="hover:text-[var(--color-accent)] transition duration-200">Contact</a>
        </div>
        
        {/* Copyright & Bitcoin mention */}
        <p className="text-xs text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} RAHAFUND by DirectAid. Built with Bitcoin and Lightning ⚡.
        </p>
      </div>
    </footer>
  );
};

export default Footer;