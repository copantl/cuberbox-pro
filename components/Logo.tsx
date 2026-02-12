
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", showText = false }) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="relative group/logo">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover/logo:scale-105 transition-transform duration-500"
        >
          {/* Sombra de profundidad (Base) */}
          <path
            d="M50 90L10 65V35L50 10L90 35V65L50 90Z"
            fill="black"
            fillOpacity="0.4"
          />
          
          {/* Cara Izquierda - High Contrast Blue */}
          <path
            d="M50 85V48L15 30V67L50 85Z"
            fill="#1d4ed8"
          />
          <path
            d="M50 85V48L15 30V67L50 85Z"
            fill="url(#leftGradient)"
          />
          
          {/* Cara Derecha - Deep Royal Blue */}
          <path
            d="M50 85V48L85 30V67L50 85Z"
            fill="#1e40af"
          />
          <path
            d="M50 85V48L85 30V67L50 85Z"
            fill="url(#rightGradient)"
          />

          {/* Cara Superior - Ice White / Silver */}
          <path
            d="M50 48L15 30L50 12L85 30L50 48Z"
            fill="#eff6ff"
          />

          {/* Detalles de Circuitos Internos (Neural Core) */}
          <circle cx="32" cy="58" r="4" fill="white" fillOpacity="0.8" />
          <circle cx="68" cy="58" r="4" fill="white" fillOpacity="0.8" />
          <path d="M50 48V85" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          
          <defs>
            <linearGradient id="leftGradient" x1="50" y1="48" x2="15" y2="67" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="rightGradient" x1="50" y1="48" x2="85" y2="67" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>
        {/* Halo de producción activo */}
        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter text-white uppercase leading-none">cuberbox</span>
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1">pro engine</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
