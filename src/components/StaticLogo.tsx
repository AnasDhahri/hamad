import React from 'react';

// StaticLogo.tsx
const StaticLogo: React.FC = () => {
  return (
    <div className="w-[100px] h-[100px] rounded-full overflow-hidden z-0">
      <img
        src="/HMC-Logo.webp"
        alt="Hamad Medical Logo"
        className="w-full h-full object-cover opacity-60"
      />
    </div>
  );
};

export default StaticLogo;
