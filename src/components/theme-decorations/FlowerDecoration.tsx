
import React from 'react';

export const FlowerDecoration = ({ themeStyle = 'classic' }: { themeStyle?: string }) => (
  <div className="absolute -z-10 inset-0 overflow-hidden opacity-20">
    <div className="absolute top-0 left-0 w-32 h-32">
      <img src={`/assets/themes/${themeStyle}/decoration-top-left.png`} alt="" className="w-full h-full object-contain" />
    </div>
    <div className="absolute top-0 right-0 w-32 h-32">
      <img src={`/assets/themes/${themeStyle}/decoration-top-right.png`} alt="" className="w-full h-full object-contain" />
    </div>
    <div className="absolute bottom-0 left-0 w-32 h-32">
      <img src={`/assets/themes/${themeStyle}/decoration-bottom-left.png`} alt="" className="w-full h-full object-contain" />
    </div>
    <div className="absolute bottom-0 right-0 w-32 h-32">
      <img src={`/assets/themes/${themeStyle}/decoration-bottom-right.png`} alt="" className="w-full h-full object-contain" />
    </div>
  </div>
); 
