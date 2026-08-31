import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'solid' | 'glyph-only';
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'md', 
  className = '',
  variant = 'solid' 
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-[22px]',
  };

  const iconSizeMap = {
    sm: 18,
    md: 22,
    lg: 28,
    xl: 38,
  };

  const px = iconSizeMap[size];

  if (variant === 'glyph-only') {
    return (
      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="ledger-gold" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        {/* Sculpted architectural 'L' Ledger monogram */}
        <path
          d="M12 9V29C12 29.5523 12.4477 30 13 30H29C29.5523 30 30 29.5523 30 29V26C30 25.4477 29.5523 25 29 25H18V9C18 8.44772 17.5523 8 17 8H13C12.4477 8 12 8.44772 12 9Z"
          fill="url(#ledger-gold)"
        />
        {/* Dual credit/debit horizontal ledger rule */}
        <circle cx="27" cy="14" r="3" fill="url(#ledger-gold)" />
      </svg>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white shadow-md border border-amber-500/20 overflow-hidden ${sizeMap[size]} ${className}`}
    >
      {/* Subtle warm golden ambient glow */}
      <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-500/15 rounded-full blur-md pointer-events-none" />
      <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-amber-600/10 rounded-full blur-md pointer-events-none" />

      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-xs"
      >
        <defs>
          <linearGradient id="ledger-gold-fill" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="ledger-gold-accent" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Minimalist ledger spine frame */}
        <path
          d="M10 8C10 7.44772 10.4477 7 11 7H13C13.5523 7 14 7.44772 14 7V33H11C10.4477 33 10 32.5523 10 32V8Z"
          fill="#3F3F46"
        />

        {/* Sculpted, bold 'L' Monogram for LEDGER */}
        <path
          d="M15 8H20V26H30V31C30 31.5523 29.5523 32 29 32H16C15.4477 32 15 31.5523 15 31V8Z"
          fill="url(#ledger-gold-fill)"
        />

        {/* Dual balancing ledger notch */}
        <rect x="23" y="10" width="7" height="3" rx="1.5" fill="url(#ledger-gold-accent)" />
        <rect x="23" y="16" width="7" height="3" rx="1.5" fill="#52525B" />
      </svg>
    </div>
  );
};

