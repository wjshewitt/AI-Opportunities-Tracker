import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  label?: string;
  title?: string;
  children: React.ReactNode;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({
  label = 'Data and methodology',
  title = 'Data & Methodology',
  children,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative flex items-stretch h-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-label={label}
        title={label}
        className="flex items-center justify-center w-12 border-l border-border dark:border-dark-border bg-cream dark:bg-dark-bg text-subtle dark:text-dark-subtle hover:text-primary dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Info size={14} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-1 w-80 max-w-xs z-30 border border-border dark:border-dark-border bg-white dark:bg-dark-surface shadow-lg p-4 text-xs md:text-sm text-primary dark:text-dark-text"
        >
          {title && (
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
              {title}
            </h3>
          )}
          <div className="space-y-2 leading-relaxed">{children}</div>
        </div>
      )}
    </div>
  );
};

export default InfoPopover;
