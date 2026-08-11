import React from 'react';

interface BrandNameProps {
  textSize?: string;
  badgeSize?: string;
  className?: string;
}

export const BrandName: React.FC<BrandNameProps> = ({
  textSize = 'text-xl sm:text-2xl',
  badgeSize = 'text-[10px]',
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1 sm:gap-1.5 align-middle ${className}`}>
      <span className={`font-bold tracking-tight font-logo-rounded bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent ${textSize}`}>
        Engie
      </span>
      <span className={`font-bold font-logo-curved px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-800/80 shrink-0 ${badgeSize}`}>
        AI
      </span>
    </span>
  );
};
