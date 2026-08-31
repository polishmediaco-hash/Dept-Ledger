import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'solid' | 'glyph-only';
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'md', 
  className = '',
  variant = 'solid' 
}) => {
  const sizeMap = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-6.5 h-6.5 rounded-lg',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-13 h-13 rounded-2xl',
  };

  const iconPxMap = {
    xs: 12,
    sm: 15,
    md: 18,
    lg: 22,
    xl: 28,
  };

  const px = iconPxMap[size];

  // Razor-sharp minimalist geometric ledger glyph
  const glyph = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Precision vertical stem */}
      <rect x="7" y="6" width="4.5" height="20" rx="1" />
      {/* Precision horizontal baseline */}
      <rect x="7" y="21.5" width="18" height="4.5" rx="1" />
      {/* Top credit balance rule */}
      <rect x="14.5" y="6" width="10.5" height="3.5" rx="1" />
      {/* Mid debit ledger mark */}
      <rect x="14.5" y="12.5" width="6.5" height="3" rx="0.75" />
    </svg>
  );

  if (variant === 'glyph-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {glyph}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-800 dark:border-zinc-200/90 shadow-2xs transition-colors select-none ${sizeMap[size]} ${className}`}
    >
      {glyph}
    </div>
  );
};
