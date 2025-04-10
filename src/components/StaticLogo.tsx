import React from 'react';

const StaticLogo: React.FC = () => {
  return (
    <div className="w-[90px] h-[90px] rounded-full overflow-hidden mb-2">
      <img
        src="/HMC-Logo.webp"
        alt="Hamad Medical Logo"
        className="w-full h-full object-cover opacity-60"
      />
    </div>
  );
};

export default StaticLogo;