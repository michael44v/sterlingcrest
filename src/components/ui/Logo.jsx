import React from 'react';

const Logo = ({ className = "h-8 w-auto", color = "#0A2D5A" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 30V15L20 5L35 15V30" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 30H35" stroke={color} strokeWidth="3" strokeLinecap="round"/>
        <path d="M12 30V35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M28 30V35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 5V10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="18" r="4" fill={color}/>
      </svg>
      <span className="font-bold text-xl tracking-tight" style={{ color }}>
        North<span className="text-chase-blue">Bridge Bank</span>
      </span>
    </div>
  );
};

export default Logo;
