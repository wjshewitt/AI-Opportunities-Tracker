import React from 'react';
import { Info } from 'lucide-react';

interface StatusDefinition {
  name: string;
  color: string;
  bgClass: string;
  description: string;
}

const STATUS_DEFINITIONS: StatusDefinition[] = [
  {
    name: 'Completed',
    color: '#122623',
    bgClass: 'bg-primary',
    description: 'The recommendation has been fully implemented with all deliverables met.'
  },
  {
    name: 'On Track',
    color: '#D9F85E',
    bgClass: 'bg-accent',
    description: 'Active progress is being made with some sign of substantive progress, and the recommendation is expected to meet its deadline.'
  },
  {
    name: 'Partially',
    color: '#FFB800',
    bgClass: 'bg-[#FFB800]',
    description: 'Some elements have been delivered but the recommendation is not yet fully implemented.'
  },
  {
    name: 'Delayed',
    color: '#FF4D00',
    bgClass: 'bg-[#FF4D00]',
    description: 'The recommendation has missed its original deadline or is significantly behind schedule.'
  },
  {
    name: 'Not Started',
    color: '#CDCBC4',
    bgClass: 'bg-[#CDCBC4]',
    description: 'No substantive action has been taken on this recommendation yet.'
  }
];

interface StatusLegendProps {
  compact?: boolean;
  showTitle?: boolean;
}

const StatusLegend: React.FC<StatusLegendProps> = ({ compact = false, showTitle = true }) => {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-4">
        {STATUS_DEFINITIONS.map((status) => (
          <div key={status.name} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${status.bgClass}`}></div>
            <span className="text-xs font-mono uppercase dark:text-dark-text">{status.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
      {showTitle && (
        <div className="p-4 border-b border-border dark:border-dark-border bg-cream dark:bg-dark-bg flex items-center gap-2">
          <Info size={16} className="text-subtle dark:text-dark-subtle" />
          <span className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle">
            Status Definitions
          </span>
        </div>
      )}
      <div className="divide-y divide-border dark:divide-dark-border">
        {STATUS_DEFINITIONS.map((status) => (
          <div key={status.name} className="p-4 flex items-start gap-4">
            <div className={`w-4 h-4 ${status.bgClass} shrink-0 mt-0.5`}></div>
            <div className="flex-grow">
              <div className="font-mono text-sm font-bold text-primary dark:text-dark-text uppercase tracking-wide mb-1">
                {status.name}
              </div>
              <p className="text-sm text-subtle dark:text-dark-subtle leading-relaxed">
                {status.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusLegend;
