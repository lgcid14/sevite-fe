import React from 'react';

/**
 * Logo component that uses the official logo.png (original logo-sit.png)
 * and crops the white borders using CSS scale.
 * 155% width/height ensures the ~440px purple square fills the 640px image container.
 */
const Logo = ({ className = "w-20 h-20" }) => {
  return (
    <div className={`${className} overflow-hidden rounded-2xl flex items-center justify-center relative`}>
      <img 
        src="/logo.png" 
        alt="Servit Logo" 
        className="max-w-none"
        style={{
          width: '155%', 
          height: '155%',
          transform: 'scale(1.0)',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default Logo;
