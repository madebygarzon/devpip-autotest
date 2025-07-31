"use client";

import React from "react";

interface SpinnerProps {
  size?: number;       
  innerSize?: number;  
}

const Loader: React.FC<SpinnerProps> = ({ size = 80, innerSize }) => {
  const calculatedInnerSize = innerSize || size * 0.8;

  return (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
      {/* Círculo externo */}
      <div
        className="border-4 border-transparent text-blue-400 animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
        style={{
          width: size,
          height: size,
          fontSize: size / 4,
        }}
      >
        <div
          className="border-4 border-transparent text-red-400 animate-spin flex items-center justify-center border-t-red-400 rounded-full"
          style={{
            width: calculatedInnerSize,
            height: calculatedInnerSize,
            fontSize: calculatedInnerSize / 4,
          }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;
