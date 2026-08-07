import React from 'react';

const Logo = ({ className = "h-10 w-auto", color }) => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt="Starling Crest Finance"
        className={className}
        style={{ display: 'block', borderRadius: '4px' }}
      />
    </div>
  );
};

export default Logo;
