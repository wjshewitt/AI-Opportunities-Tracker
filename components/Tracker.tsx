import React, { useState, useMemo, useEffect } from 'react';
import { Recommendation, Status, FilterState } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { formatDeliveryTimeline, isLongTermGoal } from '../utils';
import { getSourcesForRecommendation } from '../evidenceSources';
import { Search, ChevronDown, Plus, Minus, RotateCcw, ChevronUp } from 'lucide-react';
import { CHAPTER_SUMMARIES } from '../chapterData';

interface TrackerProps {
  data: Recommendation[];
  initialSearch?: string;
}

const ITEMS_PER_PAGE = 20;

const STATUS_STYLES: Record<Status, string> = {
  [Status.COMPLETED]: 'bg-primary text-white border-primary',
  [Status.ON_TRACK]: 'bg-accent text-primary border-accent',
  [Status.PARTIALLY]: 'bg-[#FFB800] text-primary border-[#FFB800]',
  [Status.DELAYED]: 'bg-[#FF4D00] text-white border-[#FF4D00]',
  [Status.NOT_STARTED]: 'bg-transparent text-subtle border-subtle',
};

const Tracker: React.FC<TrackerProps> = ({ data, initialSearch }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch || '',
    status: '',
    department: '',
    chapter: '',
    actionPlanSection: ''
  });

  useEffect(() => {
    if (initialSearch) {
      setFilters(prev => ({ ...prev, search: initialSearch }));
    }
  }, [initialSearch]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  const debouncedSearch = useDebounce(filters.search, 200);

  const chapters = useMemo(() => Array.from(new Set(data.map(d => d.chapter))), [data]);
  const departments = useMemo(() => Array.from(new Set(data.map(d => d.department))), [data]);
  const actionPlanSections = useMemo(
    () => Array.from(new Set(data.map(d => d.actionPlanSection).filter(Boolean))) as string[],
    [data]
  );
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            item.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            item.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            item.progress?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = filters.status ? item.status === filters.status : true;
      const matchesDepartment = filters.department ? item.department === filters.department : true;
      const matchesChapter = filters.chapter ? item.chapter === filters.chapter : true;
      const matchesActionPlanSection = filters.actionPlanSection
        ? item.actionPlanSection === filters.actionPlanSection
        : true;

      return matchesSearch && matchesStatus && matchesDepartment && matchesChapter && matchesActionPlanSection;
    });
  }, [data, debouncedSearch, filters.status, filters.department, filters.chapter, filters.actionPlanSection]);

  const chapterStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; onTrack: number; partially: number; delayed: number; notStarted: number }> = {};
    for (const item of filteredData) {
      const key = item.chapter;
      if (!stats[key]) {
        stats[key] = { total: 0, completed: 0, onTrack: 0, partially: 0, delayed: 0, notStarted: 0 };
      }
      const s = stats[key];
      s.total += 1;
      if (item.status === Status.COMPLETED) s.completed += 1;
      else if (item.status === Status.ON_TRACK) s.onTrack += 1;
      else if (item.status === Status.PARTIALLY) s.partially += 1;
      else if (item.status === Status.DELAYED) s.delayed += 1;
      else if (item.status === Status.NOT_STARTED) s.notStarted += 1;
    }
    return stats;
  }, [filteredData]);

  const { visibleCount, sentinelRef, resetScroll } = useInfiniteScroll({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: filteredData.length
  });

  const visibleData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  useEffect(() => {
    resetScroll();
  }, [debouncedSearch, filters.status, filters.department, filters.chapter, filters.actionPlanSection, resetScroll]);

  useEffect(() => {
    setOpenChapters(prev => {
      const next = { ...prev };
      chapters.forEach(ch => {
        if (next[ch] === undefined) {
          next[ch] = true;
        }
      });
      return next;
    });
  }, [chapters]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', department: '', chapter: '', actionPlanSection: '' });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.department ||
    filters.chapter ||
    filters.actionPlanSection;

  const FilterSelect = ({ value, onChange, options, placeholder }: { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
    options: string[]; 
    placeholder: string;
  }) => (
    <div className="relative">
      <select 
        className="appearance-none w-full pl-4 pr-10 py-3 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-none text-sm font-mono focus:outline-none focus:border-primary dark:focus:border-accent focus:ring-0 uppercase tracking-wide cursor-pointer hover:bg-cream dark:hover:bg-dark-bg transition-colors dark:text-dark-text"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={14} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary dark:border-accent pb-6">
        <div>
           <h2 className="text-3xl font-bold tracking-tighter text-primary dark:text-dark-text">RECOMMENDATION TRACKER</h2>
           <p className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mt-2">Database Index: {filteredData.length} Records</p>
        </div>
      </div>

      {/* Technical Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
        <div className="md:col-span-5 relative">
          <input 
            type="text" 
            placeholder="SEARCH DATABASE..." 
            className="w-full h-full pl-4 pr-4 py-3 bg-cream dark:bg-dark-bg border border-border dark:border-dark-border rounded-none text-sm font-mono focus:outline-none focus:border-primary dark:focus:border-accent placeholder:text-subtle dark:placeholder:text-dark-subtle uppercase dark:text-dark-text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary dark:text-dark-text">
             <Search size={16} />
          </div>
        </div>
        
        <div className="md:col-span-3">
           <FilterSelect 
             value={filters.chapter} 
             onChange={(e) => setFilters(prev => ({ ...prev, chapter: e.target.value }))}
             options={chapters}
             placeholder="ALL CHAPTERS"
           />
        </div>

        <div className="md:col-span-2">
           <FilterSelect 
             value={filters.department} 
             onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
             options={departments}
             placeholder="DEPT"
           />
        </div>

        <div className="md:col-span-4">
           <FilterSelect
             value={filters.actionPlanSection}
             onChange={(e) => setFilters(prev => ({ ...prev, actionPlanSection: e.target.value }))}
             options={actionPlanSections}
             placeholder="PLAN SECTION"
           />
        </div>

        <div className="md:col-span-2">
           <FilterSelect 
             value={filters.status} 
             onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
             options={Object.values(Status)}
             placeholder="STATUS"
           />
        </div>
      </div>

      {/* Results count and reset */}
      <div className="flex items-center justify-between text-xs font-mono text-subtle dark:text-dark-subtle">
        <span>
          Showing {visibleData.length} of {filteredData.length} records
          {filteredData.length !== data.length && ` (${data.length} total)`}
        </span>
        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 text-primary dark:text-dark-text hover:text-accent transition-colors uppercase tracking-wider"
          >
            <RotateCcw size={12} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
        {/* Table Header */}
        <div className="hidden md:flex border-b border-primary bg-primary text-cream py-3 px-6 text-[10px] font-mono uppercase tracking-widest">
           <div className="w-16 shrink-0">ID</div>
           <div className="flex-grow">Recommendation</div>
           <div className="w-40 shrink-0">Delivery Timeline</div>
           <div className="w-32 shrink-0">Status</div>
           <div className="w-12 shrink-0 text-center">Det</div>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-12 text-center font-mono text-sm uppercase text-subtle dark:text-dark-subtle">
            No matching records found.
          </div>
        ) : (
          <>
            {(() => {
               const renderedChapters = new Set<string>();
               return visibleData.map((item, index) => {
                 const isLast = index === visibleData.length - 1;
                 const isExpanded = expandedIds.has(item.id);
                 const showChapterHeader = !renderedChapters.has(item.chapter);
                 if (showChapterHeader) {
                   renderedChapters.add(item.chapter);
                 }
                 const summary = CHAPTER_SUMMARIES[item.chapter];
                 const stats = chapterStats[item.chapter];
                 const chapterOpen = openChapters[item.chapter] ?? true;

                 return (
                   <React.Fragment key={item.id}>
                     {showChapterHeader && (
          <div className="border-b border-border dark:border-dark-border bg-cream/60 dark:bg-dark-bg/70 px-6 py-4">
                         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                           <div className="space-y-3">
                             <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight text-primary dark:text-dark-text">
                      {item.chapter}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenChapters(prev => ({
                          ...prev,
                          [item.chapter]: !chapterOpen
                        }))
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-subtle dark:text-dark-subtle hover:text-primary dark:hover:text-dark-text"
                    >
                      <span>{chapterOpen ? 'Hide summary' : 'Show summary'}</span>
                      {chapterOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                               {stats && (
                                 <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-subtle dark:text-dark-subtle">
                                   {stats.total} recommendations
                                   {[
                                     stats.completed > 0 && `${stats.completed} done`,
                                     stats.onTrack > 0 && `${stats.onTrack} on track`,
                                     stats.partially > 0 && `${stats.partially} partially`
                                   ].filter(Boolean).map((s, i) => (
                                      <span key={i}> · {s}</span>
                                   ))}
                                 </p>
                               )}
                             </div>
                {summary && chapterOpen && (
                               <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border p-4 space-y-3">
                                 <h4 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">
                                   Chapter Summary
                                 </h4>
                                 <p className="text-xs md:text-sm text-primary dark:text-dark-text">
                                   <span className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mr-1">
                                     From plan:
                                   </span>
                                   {summary.planSummary}
                                 </p>
                                 <p className="text-xs md:text-sm text-primary dark:text-dark-text">
                                   <span className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mr-1">
                                     Gov response:
                                   </span>
                                   {summary.govSummary}
                                 </p>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     )}

                     <div className={`group ${showChapterHeader ? 'mt-1' : ''} ${!isLast ? 'border-b border-border dark:border-dark-border' : ''}`}>
                       {/* Row Main Content */}
                       <div
                         className="flex flex-col md:flex-row md:items-center p-4 md:px-6 md:py-4 gap-4 cursor-pointer hover:bg-cream dark:hover:bg-dark-bg transition-colors"
                         onClick={() => toggleExpand(item.id)}
                       >
                         <div className="w-16 shrink-0 font-mono text-xs font-bold text-accent bg-primary px-1 py-0.5 inline-block md:block w-fit md:w-auto">
                            {item.id}
                         </div>

                         <div className="flex-grow min-w-0">
                           <div className="md:hidden font-mono text-[10px] text-subtle dark:text-dark-subtle mb-1">{item.chapter}</div>
                           <h4 className="font-semibold text-primary dark:text-dark-text text-sm md:text-base leading-tight">{item.title}</h4>
                           {(item.actionPlanPage || item.govResponsePage) && (
                             <div className="mt-1 text-xs text-subtle dark:text-dark-subtle font-mono">
                               {item.actionPlanPage && (
                                 <span>Plan p.{item.actionPlanPage}</span>
                               )}
                               {item.govResponsePage && (
                                 <span>
                                   {item.actionPlanPage ? ' · ' : ''}
                                   Gov response p.{item.govResponsePage}
                                 </span>
                               )}
                             </div>
                           )}
                           <div className="md:hidden mt-2 flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] bg-gray-100 dark:bg-dark-bg px-1">{item.department}</span>
                              <span className="font-mono text-[10px] text-subtle dark:text-dark-subtle">{item.deliveryTimeline}</span>
                              {isLongTermGoal(item.deliveryTimeline) && (
                                <span className="font-mono text-[9px] text-subtle dark:text-dark-subtle bg-cream dark:bg-dark-bg px-1 border border-border dark:border-dark-border">Long-term</span>
                              )}
                           </div>
                         </div>

                         <div className="w-40 shrink-0 hidden md:block">
                           <div className="font-mono text-xs text-primary dark:text-dark-text">
                             {item.deliveryTimeline}
                           </div>
                           {isLongTermGoal(item.deliveryTimeline) && (
                             <div className="font-mono text-[9px] text-subtle dark:text-dark-subtle mt-0.5 bg-cream dark:bg-dark-bg px-1 py-0.5 inline-block border border-border dark:border-dark-border">
                               Long-term Goal
                             </div>
                           )}
                         </div>

                         <div className="w-32 shrink-0 flex items-center">
                           <span className={`text-[10px] font-bold font-mono uppercase px-2 py-1 border ${STATUS_STYLES[item.status]}`}>
                             {item.status}
                           </span>
                         </div>

                         <div className="w-12 shrink-0 flex justify-center text-primary dark:text-dark-text opacity-30 group-hover:opacity-100 transition-opacity">
                            {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                         </div>
                       </div>

                       {/* Expanded Details */}
                       {isExpanded && (
                         <div className="bg-cream dark:bg-dark-bg border-t border-border dark:border-dark-border border-dashed p-6 space-y-6 animate-in slide-in-from-top-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h5 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-3">Core Objective</h5>
                                <p className="text-sm leading-relaxed border-l-2 border-primary dark:border-accent pl-4 dark:text-dark-text">{item.description}</p>
                              </div>
                              <div>
                                <h5 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-3">Government Commitment</h5>
                                <p className="text-sm leading-relaxed text-primary-light dark:text-dark-text">{item.govResponse}</p>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">Latest Status Report</h5>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Last updated: {item.lastUpdate} 2025</span>
                              </div>
                              <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border p-4 text-sm font-mono text-primary-light dark:text-dark-text">
                                <span className="text-accent mr-2">&gt;&gt;&gt;</span> {item.progress}
                              </div>
                              <div className="mt-4 flex gap-4 text-xs font-mono text-subtle dark:text-dark-subtle">
                                 <span>{item.department}</span>
                                 <span>Delivery Timeline: {item.deliveryTimeline}</span>
                              </div>
                            </div>
                         </div>
                       )}
                     </div>
                   </React.Fragment>
                 );
               });
            })()}
            
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
          </>
        )}
      </div>
    </div>
  );
};

export default Tracker;
