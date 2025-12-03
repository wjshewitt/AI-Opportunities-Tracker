import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Recommendation, Status } from '../types';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  X, 
  Calendar,
  LayoutList,
  LayoutGrid,
  Filter,
  Clock,
  Building2
} from 'lucide-react';

interface TimelineProps {
  data: Recommendation[];
}

interface PeriodStats {
  key: string;
  label: string;
  description: string;
  dateRange: string;
  items: Recommendation[];
  completed: number;
  onTrack: number;
  partially: number;
  delayed: number;
  notStarted: number;
  total: number;
  percentage: number;
  departments: string[];
}

// Government timeline horizons
const HORIZON_CONFIG: Record<string, { order: number; label: string; description: string; dateRange: string }> = {
  'short-term': { 
    order: 1, 
    label: 'SHORT-TERM', 
    description: 'Immediate priorities and quick wins',
    dateRange: 'Spring – Autumn 2025'
  },
  'medium-term': { 
    order: 2, 
    label: 'MEDIUM-TERM', 
    description: 'Core implementation phase',
    dateRange: '2026'
  },
  'long-term': { 
    order: 3, 
    label: 'LONG-TERM', 
    description: 'Strategic and structural reforms',
    dateRange: '2027+'
  },
};

// Map specific timelines to horizons
const getHorizonKey = (timeline: string): string => {
  const lower = timeline.toLowerCase();
  
  // Short-term: 2025 deliverables
  if (lower.includes('2025') || lower.includes('spring 25') || lower.includes('summer 25') || lower.includes('autumn 25')) {
    return 'short-term';
  }
  
  // Medium-term: 2026 deliverables
  if (lower.includes('2026') || lower.includes('spring 26') || lower.includes('summer 26') || lower.includes('autumn 26')) {
    return 'medium-term';
  }
  
  // Long-term: 2027 and beyond
  if (lower.includes('2027') || lower.includes('2028') || lower.includes('2029') || lower.includes('2030')) {
    return 'long-term';
  }
  
  // Default to medium-term for unspecified
  return 'medium-term';
};

// For sorting items within a horizon
const getTimelineSortKey = (timeline: string): number => {
  const lower = timeline.toLowerCase();
  if (lower.includes('spring 2025')) return 1;
  if (lower.includes('summer 2025')) return 2;
  if (lower.includes('autumn 2025')) return 3;
  if (lower.includes('spring 2026')) return 4;
  if (lower.includes('summer 2026')) return 5;
  if (lower.includes('autumn 2026')) return 6;
  if (lower.includes('2027')) return 7;
  if (lower.includes('2028')) return 8;
  return 99;
};

const STATUS_COLORS: Record<Status, { bg: string; text: string; border: string; dot: string }> = {
  [Status.COMPLETED]: { bg: 'bg-primary', text: 'text-white', border: 'border-primary', dot: 'bg-primary' },
  [Status.ON_TRACK]: { bg: 'bg-accent', text: 'text-primary', border: 'border-accent', dot: 'bg-accent' },
  [Status.PARTIALLY]: { bg: 'bg-[#FFB800]', text: 'text-primary', border: 'border-[#FFB800]', dot: 'bg-[#FFB800]' },
  [Status.DELAYED]: { bg: 'bg-[#FF4D00]', text: 'text-white', border: 'border-[#FF4D00]', dot: 'bg-[#FF4D00]' },
  [Status.NOT_STARTED]: { bg: 'bg-[#CDCBC4]', text: 'text-primary', border: 'border-[#CDCBC4]', dot: 'bg-[#CDCBC4]' },
};

// Progress Ring SVG Component
const ProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({ 
  percentage, 
  size = 32, 
  strokeWidth = 3 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="text-border dark:text-dark-border"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-accent transition-all duration-500"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="transform rotate-90 origin-center fill-primary dark:fill-dark-text text-[8px] font-mono font-bold"
      >
        {percentage}
      </text>
    </svg>
  );
};

// Timeline Card Component
const TimelineCard: React.FC<{ item: Recommendation; isExpanded: boolean; onToggle: () => void }> = ({ 
  item, 
  isExpanded,
  onToggle 
}) => {
  const colors = STATUS_COLORS[item.status];

  return (
    <div 
      className={`bg-white dark:bg-dark-surface border border-border dark:border-dark-border transition-all duration-300 hover:shadow-md group ${
        isExpanded ? 'ring-2 ring-accent/30' : ''
      }`}
    >
      {/* Card Header - Always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-cream/50 dark:hover:bg-dark-bg/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {/* Status indicator bar */}
          <div className={`w-1 self-stretch ${colors.bg} rounded-full shrink-0`} />
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-white bg-primary px-1.5 py-0.5">
                {item.id}
              </span>
              <span className="font-mono text-[10px] text-subtle dark:text-dark-subtle uppercase tracking-wider flex items-center gap-1">
                <Building2 size={10} />
                {item.department}
              </span>
            </div>
            
            <h4 className={`font-medium text-sm leading-snug text-primary dark:text-dark-text ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {item.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-2 py-1 text-[10px] font-mono font-bold uppercase ${colors.bg} ${colors.text}`}>
              {item.status}
            </div>
            <ChevronDown 
              size={16} 
              className={`text-subtle dark:text-dark-subtle transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border dark:border-dark-border animate-fade-in">
          {/* Progress Section - Highlighted */}
          {item.progress && (
            <div className="p-4 bg-accent/10 border-l-4 border-accent">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Latest Progress
              </div>
              <p className="text-sm text-primary dark:text-dark-text leading-relaxed">
                {item.progress}
              </p>
              {item.lastUpdate && (
                <div className="mt-2 font-mono text-[10px] text-subtle dark:text-dark-subtle flex items-center gap-1">
                  <Clock size={10} />
                  Last updated: {item.lastUpdate}
                </div>
              )}
            </div>
          )}

          {/* Government Response */}
          {item.govResponse && (
            <div className="p-4 bg-cream/50 dark:bg-dark-bg/50 border-t border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
                Government Response
              </div>
              <p className="text-sm text-primary dark:text-dark-text leading-relaxed">
                {item.govResponse}
              </p>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="p-4 border-t border-border dark:border-dark-border flex flex-wrap gap-4 text-xs">
            <div>
              <span className="font-mono text-subtle dark:text-dark-subtle uppercase tracking-wider">Chapter: </span>
              <span className="text-primary dark:text-dark-text">{item.chapter}</span>
            </div>
            <div>
              <span className="font-mono text-subtle dark:text-dark-subtle uppercase tracking-wider">Timeline: </span>
              <span className="text-primary dark:text-dark-text">{item.deliveryTimeline}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Swimlane View Component
const SwimlaneView: React.FC<{ periods: PeriodStats[]; expandedCard: string | null; onToggleCard: (id: string) => void }> = ({ 
  periods, 
  expandedCard,
  onToggleCard 
}) => {
  const statuses = [Status.COMPLETED, Status.ON_TRACK, Status.PARTIALLY, Status.DELAYED, Status.NOT_STARTED];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[900px]">
        {/* Header Row */}
        <div className="grid grid-cols-[200px_repeat(5,1fr)] gap-2 mb-4 sticky top-0 bg-cream dark:bg-dark-bg z-10 py-2">
          <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle p-2">
            Period
          </div>
          {statuses.map(status => (
            <div key={status} className="p-2 text-center">
              <span className={`inline-block px-2 py-1 text-[10px] font-mono font-bold uppercase ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`}>
                {status}
              </span>
            </div>
          ))}
        </div>

        {/* Swimlanes */}
        {periods.map(period => (
          <div key={period.key} className="grid grid-cols-[200px_repeat(5,1fr)] gap-2 mb-4">
            {/* Period Label */}
            <div className="p-3 bg-primary text-cream flex items-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">{period.label}</span>
            </div>

            {/* Status Lanes */}
            {statuses.map(status => {
              const items = period.items.filter(i => i.status === status);
              return (
                <div 
                  key={status} 
                  className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border p-2 min-h-[80px]"
                >
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => onToggleCard(item.id)}
                          className={`p-2 text-xs cursor-pointer hover:bg-cream dark:hover:bg-dark-bg transition-colors border-l-2 ${STATUS_COLORS[item.status].border} ${
                            expandedCard === item.id ? 'bg-accent/10' : ''
                          }`}
                        >
                          <div className="font-mono font-bold text-primary dark:text-dark-text">{item.id}</div>
                          <div className="text-subtle dark:text-dark-subtle line-clamp-2 mt-0.5">{item.title}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] text-subtle dark:text-dark-subtle font-mono">
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const [view, setView] = useState<'vertical' | 'swimlane'>('vertical');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status[]>([]);
  const [deptFilter, setDeptFilter] = useState('');
  const [collapsedPeriods, setCollapsedPeriods] = useState<Set<string>>(new Set());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(data.map(d => d.department))].sort();
  }, [data]);

  // Filter and group data
  const periods = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.progress?.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(item => statusFilter.includes(item.status));
    }

    // Apply department filter
    if (deptFilter) {
      filtered = filtered.filter(item => item.department === deptFilter);
    }

    // Sort by timeline within each horizon
    filtered.sort((a, b) => getTimelineSortKey(a.deliveryTimeline) - getTimelineSortKey(b.deliveryTimeline));

    // Group by government timeline horizon (short/medium/long-term)
    const grouped: Record<string, PeriodStats> = {};
    
    filtered.forEach(item => {
      const key = getHorizonKey(item.deliveryTimeline);
      const config = HORIZON_CONFIG[key];
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          label: config.label,
          description: config.description,
          dateRange: config.dateRange,
          items: [],
          completed: 0,
          onTrack: 0,
          partially: 0,
          delayed: 0,
          notStarted: 0,
          total: 0,
          percentage: 0,
          departments: [],
        };
      }
      
      grouped[key].items.push(item);
      grouped[key].total++;
      
      if (item.status === Status.COMPLETED) grouped[key].completed++;
      else if (item.status === Status.ON_TRACK) grouped[key].onTrack++;
      else if (item.status === Status.PARTIALLY) grouped[key].partially++;
      else if (item.status === Status.DELAYED) grouped[key].delayed++;
      else if (item.status === Status.NOT_STARTED) grouped[key].notStarted++;

      if (!grouped[key].departments.includes(item.department)) {
        grouped[key].departments.push(item.department);
      }
    });

    // Calculate percentages and sort by horizon order
    return Object.values(grouped)
      .map(period => ({
        ...period,
        percentage: period.total > 0 
          ? Math.round(((period.completed + period.onTrack) / period.total) * 100) 
          : 0
      }))
      .sort((a, b) => (HORIZON_CONFIG[a.key]?.order || 99) - (HORIZON_CONFIG[b.key]?.order || 99));
  }, [data, searchQuery, statusFilter, deptFilter]);

  // Scroll spy effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActivePeriod(entry.target.getAttribute('data-period'));
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [periods]);

  const scrollToPeriod = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const togglePeriod = (key: string) => {
    setCollapsedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleStatusFilter = (status: Status) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter([]);
    setDeptFilter('');
  };

  const hasFilters = searchQuery || statusFilter.length > 0 || deptFilter;
  const totalFiltered = periods.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="border-b border-primary dark:border-accent pb-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-accent" />
              <h1 className="text-3xl md:text-5xl font-bold text-primary dark:text-dark-text tracking-tighter">
                IMPLEMENTATION<br className="md:hidden" /> TIMELINE
              </h1>
            </div>
            <p className="text-subtle dark:text-dark-subtle font-light border-l-2 border-accent pl-3 mt-4">
              Track delivery milestones across all 50 recommendations
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
            <button
              onClick={() => setView('vertical')}
              className={`px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                view === 'vertical' 
                  ? 'bg-primary text-cream' 
                  : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
              }`}
            >
              <LayoutList size={14} />
              <span className="hidden sm:inline">Vertical</span>
            </button>
            <button
              onClick={() => setView('swimlane')}
              className={`px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider border-l border-border dark:border-dark-border transition-colors ${
                view === 'swimlane' 
                  ? 'bg-primary text-cream' 
                  : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Swimlane</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and Department Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle dark:text-dark-subtle" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-primary dark:text-dark-text text-sm font-mono placeholder:text-subtle dark:placeholder:text-dark-subtle focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-primary dark:hover:text-dark-text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle dark:text-dark-subtle pointer-events-none" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-primary dark:text-dark-text text-sm font-mono appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle dark:text-dark-subtle pointer-events-none" />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle flex items-center gap-1">
            <Filter size={12} />
            Status:
          </span>
          {Object.values(Status).map(status => {
            const colors = STATUS_COLORS[status];
            const isActive = statusFilter.includes(status);
            return (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-all ${
                  isActive 
                    ? `${colors.bg} ${colors.text} ${colors.border}` 
                    : 'border-border dark:border-dark-border text-subtle dark:text-dark-subtle hover:border-primary dark:hover:border-dark-text'
                }`}
              >
                {status}
              </button>
            );
          })}
          
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#FF4D00] hover:bg-[#FF4D00]/10 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {hasFilters && (
          <div className="font-mono text-xs text-subtle dark:text-dark-subtle">
            Showing {totalFiltered} of {data.length} recommendations
          </div>
        )}
      </div>

      {/* Sticky Horizon Navigator - only show in vertical view */}
      {view === 'vertical' && (
        <nav className="sticky top-16 z-40 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 py-3 bg-cream/95 dark:bg-dark-bg/95 backdrop-blur border-y border-border dark:border-dark-border mb-8 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 min-w-max">
            {periods.map((period, idx) => (
              <button
                key={period.key}
                onClick={() => scrollToPeriod(period.key)}
                className={`flex items-center gap-3 px-4 py-3 transition-all border ${
                  activePeriod === period.key
                    ? 'bg-primary text-cream border-primary'
                    : 'bg-white dark:bg-dark-surface hover:border-primary dark:hover:border-accent border-border dark:border-dark-border text-primary dark:text-dark-text'
                }`}
              >
                <ProgressRing percentage={period.percentage} size={36} strokeWidth={3} />
                <div className="text-left">
                  <div className="font-bold text-sm tracking-tight leading-tight">
                    {period.label}
                  </div>
                  <div className="font-mono text-[10px] opacity-70">
                    {period.dateRange}
                  </div>
                </div>
                <div className="text-right ml-2 pl-2 border-l border-current/20">
                  <div className="font-mono text-lg font-bold leading-none">{period.total}</div>
                  <div className="font-mono text-[9px] uppercase opacity-70">items</div>
                </div>
                {idx < periods.length - 1 && (
                  <ChevronRight size={16} className="ml-1 opacity-30" />
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Content */}
      {view === 'swimlane' ? (
        <SwimlaneView 
          periods={periods} 
          expandedCard={expandedCard}
          onToggleCard={(id) => setExpandedCard(expandedCard === id ? null : id)}
        />
      ) : (
        <div className="space-y-8">
          {periods.map(period => (
            <section
              key={period.key}
              ref={el => sectionRefs.current[period.key] = el}
              data-period={period.key}
              className="scroll-mt-40"
            >
              {/* Horizon Header */}
              <div 
                className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border cursor-pointer hover:border-primary dark:hover:border-accent transition-colors group"
                onClick={() => togglePeriod(period.key)}
              >
                {/* Top section with label and toggle */}
                <div className="flex items-center gap-4 p-4 border-b border-border dark:border-dark-border">
                  <div className={`p-3 ${collapsedPeriods.has(period.key) ? 'bg-cream dark:bg-dark-bg' : 'bg-primary'}`}>
                    {collapsedPeriods.has(period.key) ? (
                      <ChevronRight className="w-5 h-5 text-primary dark:text-dark-text" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-cream" />
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <h3 className="font-bold text-2xl text-primary dark:text-dark-text tracking-tight">
                        {period.label}
                      </h3>
                      <span className="px-2 py-0.5 bg-accent/20 text-accent font-mono text-xs font-bold">
                        {period.dateRange}
                      </span>
                    </div>
                    <p className="text-sm text-subtle dark:text-dark-subtle mt-1">
                      {period.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold text-primary dark:text-dark-text">{period.total}</div>
                    <div className="font-mono text-[10px] uppercase text-subtle dark:text-dark-subtle">
                      {period.total === 1 ? 'recommendation' : 'recommendations'}
                    </div>
                  </div>
                </div>
                
                {/* Progress section */}
                <div className="p-4 bg-cream/50 dark:bg-dark-bg/50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-grow h-3 bg-white dark:bg-dark-surface border border-border dark:border-dark-border flex overflow-hidden">
                      {period.completed > 0 && (
                        <div className="h-full bg-primary transition-all" style={{ width: `${(period.completed / period.total) * 100}%` }} />
                      )}
                      {period.onTrack > 0 && (
                        <div className="h-full bg-accent transition-all" style={{ width: `${(period.onTrack / period.total) * 100}%` }} />
                      )}
                      {period.partially > 0 && (
                        <div className="h-full bg-[#FFB800] transition-all" style={{ width: `${(period.partially / period.total) * 100}%` }} />
                      )}
                      {period.delayed > 0 && (
                        <div className="h-full bg-[#FF4D00] transition-all" style={{ width: `${(period.delayed / period.total) * 100}%` }} />
                      )}
                      {period.notStarted > 0 && (
                        <div className="h-full bg-[#CDCBC4] transition-all" style={{ width: `${(period.notStarted / period.total) * 100}%` }} />
                      )}
                    </div>
                    <span className="font-mono text-lg font-bold text-accent">{period.percentage}%</span>
                  </div>
                  
                  {/* Status breakdown */}
                  <div className="flex flex-wrap gap-4 font-mono text-xs">
                    {period.completed > 0 && (
                      <span className="flex items-center gap-1.5 text-primary dark:text-dark-text">
                        <span className="w-3 h-3 bg-primary" />
                        {period.completed} Completed
                      </span>
                    )}
                    {period.onTrack > 0 && (
                      <span className="flex items-center gap-1.5 text-primary dark:text-dark-text">
                        <span className="w-3 h-3 bg-accent" />
                        {period.onTrack} On Track
                      </span>
                    )}
                    {period.partially > 0 && (
                      <span className="flex items-center gap-1.5 text-primary dark:text-dark-text">
                        <span className="w-3 h-3 bg-[#FFB800]" />
                        {period.partially} Partially
                      </span>
                    )}
                    {period.delayed > 0 && (
                      <span className="flex items-center gap-1.5 text-primary dark:text-dark-text">
                        <span className="w-3 h-3 bg-[#FF4D00]" />
                        {period.delayed} Delayed
                      </span>
                    )}
                    {period.notStarted > 0 && (
                      <span className="flex items-center gap-1.5 text-primary dark:text-dark-text">
                        <span className="w-3 h-3 bg-[#CDCBC4]" />
                        {period.notStarted} Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Period Content */}
              {!collapsedPeriods.has(period.key) && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-accent/30 ml-6">
                  {period.items.map(item => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      isExpanded={expandedCard === item.id}
                      onToggle={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Empty State */}
      {periods.length === 0 && (
        <div className="text-center py-20 border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
          <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
            No Results
          </div>
          <p className="text-primary dark:text-dark-text">
            No recommendations match your current filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-accent text-primary font-mono text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {periods.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border dark:border-dark-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-1">
                Total Shown
              </div>
              <div className="text-2xl font-bold text-primary dark:text-dark-text">{totalFiltered}</div>
            </div>
            <div className="p-4 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-1">
                Horizons
              </div>
              <div className="text-2xl font-bold text-primary dark:text-dark-text">{periods.length}</div>
            </div>
            <div className="p-4 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-1">
                On Track+
              </div>
              <div className="text-2xl font-bold text-accent">
                {periods.reduce((acc, p) => acc + p.completed + p.onTrack, 0)}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-1">
                Avg Progress
              </div>
              <div className="text-2xl font-bold text-primary dark:text-dark-text">
                {periods.length > 0 
                  ? Math.round(periods.reduce((acc, p) => acc + p.percentage, 0) / periods.length) 
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
