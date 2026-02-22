
import React from 'react';

export const DiagonalDecoration = () => (
  <div className="absolute -z-10 inset-0 overflow-hidden">
    <div className="relative w-full h-full">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#EAEAEA" fillOpacity="1" d="M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,245.3C672,245,768,267,864,266.7C960,267,1056,245,1152,236C1248,229,1344,235,1392,234.7L1440,235L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      {/* Diagonal element */}
      <div className="absolute top-[400px] -rotate-6 left-0 right-0 h-[800px] bg-[#EAEAEA]"></div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#EAEAEA" fillOpacity="1" d="M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,245.3C672,245,768,267,864,266.7C960,267,1056,245,1152,236C1248,229,1344,235,1392,234.7L1440,235L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  </div>
);
