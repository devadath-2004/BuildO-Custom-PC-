import React from 'react';

const SIZE_CLASSES = {
  nav: 'text-[1.45rem] sm:text-[1.55rem]',
  footer: 'text-xl',
  compact: 'text-base',
  label: 'text-[0.72rem]',
  invoice: 'text-2xl',
};

/** The current BuildO identity is a standalone wordmark, with no chipset badge. */
export default function BuildOWordmark({ size = 'nav', className = '' }) {
  return (
    <span
      role="img"
      aria-label="BuildO"
      className={`inline-block whitespace-nowrap font-black uppercase leading-none tracking-[-0.075em] text-[#d8ff43] ${SIZE_CLASSES[size] || SIZE_CLASSES.nav} ${className}`}
    >
      BUILDO
    </span>
  );
}
