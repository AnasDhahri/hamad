import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center justify-center mt-4">
      <img 
        src="/HMC-Logo.webp" // Use relative path from the root of your project
        alt="Hamad Medical Corporation Logo"
        className="w-40 object-contain"
      />
    </div>
  );
};

export default Logo;
