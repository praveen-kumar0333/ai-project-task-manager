import React from 'react';

/**
 * SpatialContainer
 * Sets up the 3D perspective stage for the spatial workspace.
 * On desktop: full perspective with preserve-3d capability.
 * On tablet/mobile: streamlined flat/2.5D rendering for optimum mobile GPU performance.
 */
export default function SpatialContainer({ children, className = '' }) {
  return (
    <div
      className={`relative w-full min-h-full [perspective:1200px] [transform-style:preserve-3d] transition-all ${className}`}
    >
      {children}
    </div>
  );
}
