import React, { useMemo, useState } from 'react';
import { Recommendation, Status } from '../types';
import { DEPARTMENTS, getDepartmentInfo } from '../departmentData';
import { getSourcesForRecommendation } from '../evidenceSources';
import { ChevronRight, ChevronDown, Trophy, Info } from 'lucide-react';
import StatusLegend from './StatusLegend';

interface ExpandableRecProps {
  rec: Recommendation;
}

const ExpandableRec: React.FC<ExpandableRecProps> = ({ rec }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    [Status.COMPLETED]: 'bg-primary text-cream',
    [Status.ON_TRACK]: 'bg-accent text-primary',
    [Status.PARTIALLY]: 'bg-[#FFB800] text-primary',
    [Status.DELAYED]: 'bg-[#FF4D00] text-white',
    [Status.NOT_STARTED]: 'bg-[#CDCBC4] text-primary'
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border overflow-hidden">
      {/* Header - always visible */}
      <div 
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-cream dark:hover:bg-dark-bg transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-mono text-xs text-subtle dark:text-dark-subtle w-10 shrink-0">{rec.id}</span>
        <div className="flex-grow min-w-0">
          <p className={`text-sm text-primary dark:text-dark-text ${isExpanded ? '' : 'line-clamp-1'}`}>
            {rec.title}
          </p>
        </div>
        <div className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider shrink-0 ${statusColors[rec.status]}`}>
          {rec.status}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-subtle dark:text-dark-subtle transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border dark:border-dark-border">
          {/* Government Response */}
          {rec.govResponse && (
            <div className="p-4 bg-cream/50 dark:bg-dark-bg/50 border-b border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
                Government Response
              </div>
              <p className="text-sm text-primary dark:text-dark-text leading-relaxed">
                {rec.govResponse}
              </p>
            </div>
          )}

          {/* Progress - Focused/Highlighted */}
          {rec.progress && (
            <div className="p-4 bg-accent/10 border-l-4 border-accent">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Latest Progress
              </div>
              <p className="text-sm text-primary dark:text-dark-text leading-relaxed font-medium">
                {rec.progress}
              </p>
              {rec.lastUpdate && (
                <div className="mt-2 font-mono text-[10px] text-subtle dark:text-dark-subtle">
                  Last updated: {rec.lastUpdate}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {rec.description && rec.description !== rec.title && (
            <div className="p-4 bg-cream/50 dark:bg-dark-bg/50 border-t border-border dark:border-dark-border">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
                Action Plan Description
              </div>
              <p className="text-sm text-primary dark:text-dark-text leading-relaxed">
                {rec.description}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="p-4 border-t border-border dark:border-dark-border flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">
                Delivery Timeline
              </div>
              <div className="text-sm font-medium text-primary dark:text-dark-text mt-1">
                {rec.deliveryTimeline}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">
                Chapter
              </div>
              <div className="text-sm text-primary dark:text-dark-text mt-1">
                {rec.chapter}
              </div>
            </div>
          </div>

          {/* Evidence Sources */}
          {(() => {
            const sources = getSourcesForRecommendation(rec.id);
            return sources.length > 0 && (
              <div className="p-4 border-t border-border dark:border-dark-border">
                <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
                  Evidence Sources
                </div>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-cream dark:bg-dark-bg border border-border dark:border-dark-border px-2 py-1 hover:border-accent transition-colors text-primary dark:text-dark-text"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source.title} ↗
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

interface LeagueTableProps {
  data: Recommendation[];
}

interface DepartmentStats {
  code: string;
  name: string;
  total: number;
  completed: number;
  onTrack: number;
  partially: number;
  delayed: number;
  notStarted: number;
  percentage: number;
  weightedScore: number;
  keyPeople: { name: string; role: string }[];
  recommendations: Recommendation[];
}

type SortMode = 'progress' | 'completed' | 'delayed';

// Weighted scoring system for fair ranking
// Each status is assigned points to create a composite score
const STATUS_WEIGHTS = {
  completed: 100,   // Full delivery
  onTrack: 75,      // On schedule
  partially: 50,    // Some progress made
  notStarted: 25,   // Acknowledged but pending
  delayed: 0        // Behind schedule
};

const LeagueTable: React.FC<LeagueTableProps> = ({ data }) => {
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('progress');
  const [showLegend, setShowLegend] = useState(false);

  const departmentStats = useMemo(() => {
    const statsMap: Record<string, DepartmentStats> = {};

    data.forEach(rec => {
      const dept = rec.department;
      if (!statsMap[dept]) {
        const info = getDepartmentInfo(dept);
        statsMap[dept] = {
          code: dept,
          name: info?.name || dept,
          total: 0,
          completed: 0,
          onTrack: 0,
          partially: 0,
          delayed: 0,
          notStarted: 0,
          percentage: 0,
          keyPeople: info?.keyPeople || [],
          recommendations: []
        };
      }
      statsMap[dept].total++;
      statsMap[dept].recommendations.push(rec);
      
      // Count all statuses
      if (rec.status === Status.COMPLETED) {
        statsMap[dept].completed++;
      } else if (rec.status === Status.ON_TRACK) {
        statsMap[dept].onTrack++;
      } else if (rec.status === Status.PARTIALLY) {
        statsMap[dept].partially++;
      } else if (rec.status === Status.DELAYED) {
        statsMap[dept].delayed++;
      } else if (rec.status === Status.NOT_STARTED) {
        statsMap[dept].notStarted++;
      }
    });

    // Calculate weighted progress score and percentages
    const stats = Object.values(statsMap).map(s => {
      // Weighted score: average of all recommendation weights (0-100 scale)
      const weightedScore = s.total > 0 
        ? Math.round((
            (s.completed * STATUS_WEIGHTS.completed) +
            (s.onTrack * STATUS_WEIGHTS.onTrack) +
            (s.partially * STATUS_WEIGHTS.partially) +
            (s.notStarted * STATUS_WEIGHTS.notStarted) +
            (s.delayed * STATUS_WEIGHTS.delayed)
          ) / s.total)
        : 0;
      
      return {
        ...s,
        percentage: s.total > 0 ? Math.round(((s.completed + s.onTrack) / s.total) * 100) : 0,
        weightedScore
      };
    });

    stats.sort((a, b) => {
      // Sort based on selected mode using percentages for fair comparison
      let aValue: number, bValue: number;
      switch (sortMode) {
        case 'completed':
          // Sort by completion percentage
          aValue = a.total > 0 ? (a.completed / a.total) * 100 : 0;
          bValue = b.total > 0 ? (b.completed / b.total) * 100 : 0;
          break;
        case 'delayed':
          // Sort by delay percentage (higher = worse, so we still sort descending to show worst first)
          aValue = a.total > 0 ? (a.delayed / a.total) * 100 : 0;
          bValue = b.total > 0 ? (b.delayed / b.total) * 100 : 0;
          break;
        case 'progress':
        default:
          // Sort by weighted progress score (accounts for all statuses fairly)
          aValue = a.weightedScore;
          bValue = b.weightedScore;
          break;
      }
      if (bValue !== aValue) return bValue - aValue;
      return b.total - a.total;
    });

    return stats;
  }, [data, sortMode]);

  const toggleExpand = (code: string) => {
    setExpandedDept(expandedDept === code ? null : code);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-primary dark:border-accent pb-8">
        <div className="flex items-center gap-4 mb-4">
          <Trophy className="w-10 h-10 text-accent" />
          <h1 className="text-4xl md:text-6xl font-bold text-primary dark:text-dark-text tracking-tighter leading-[0.9]">
            DEPARTMENT<br/>LEAGUE TABLE
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="max-w-2xl text-lg text-primary dark:text-dark-text font-light border-l-2 border-accent pl-4 py-1">
            Compare progress across all departments and owners.
          </p>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-subtle dark:text-dark-subtle hover:text-primary dark:hover:text-dark-text transition-colors"
          >
            <Info size={16} />
            {showLegend ? 'Hide' : 'Show'} Status Key
          </button>
        </div>
      </div>

      {/* Status Legend (collapsible) */}
      {showLegend && (
        <StatusLegend />
      )}

      {/* Sort Tabs */}
      <div className="flex border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
        <button
          onClick={() => setSortMode('progress')}
          className={`flex-1 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
            sortMode === 'progress'
              ? 'bg-accent text-primary font-bold'
              : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-accent border border-primary/20"></span>
            Progress Score
          </span>
        </button>
        <button
          onClick={() => setSortMode('completed')}
          className={`flex-1 px-4 py-3 font-mono text-xs uppercase tracking-widest border-l border-border dark:border-dark-border transition-colors ${
            sortMode === 'completed'
              ? 'bg-primary text-cream font-bold'
              : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-primary"></span>
            Completed
          </span>
        </button>
        <button
          onClick={() => setSortMode('delayed')}
          className={`flex-1 px-4 py-3 font-mono text-xs uppercase tracking-widest border-l border-border dark:border-dark-border transition-colors ${
            sortMode === 'delayed'
              ? 'bg-[#FF4D00] text-white font-bold'
              : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-[#FF4D00]"></span>
            Delayed
          </span>
        </button>
      </div>

      {/* Ranking Description */}
      <div className="bg-cream/50 dark:bg-dark-bg/50 border border-border dark:border-dark-border p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">
          How Rankings Work
        </div>
        <p className="text-sm text-primary dark:text-dark-text leading-relaxed">
          {sortMode === 'progress' && (
            <>
              <strong>Progress Score</strong> uses a weighted average that accounts for all status types fairly. 
              Points are assigned as: Completed (100), On Track (75), Partially (50), Not Started (25), Delayed (0). 
              The score represents overall delivery momentum, rewarding partial progress rather than ignoring it.
            </>
          )}
          {sortMode === 'completed' && (
            <>
              <strong>Completed</strong> ranks departments by the percentage of recommendations they have fully delivered. 
              This view highlights which departments have crossed the finish line on their commitments, regardless of other statuses.
            </>
          )}
          {sortMode === 'delayed' && (
            <>
              <strong>Delayed</strong> ranks departments by the percentage of recommendations that are behind schedule. 
              Higher percentages appear first to highlight where intervention may be needed. This view surfaces delivery risks.
            </>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 px-6 bg-cream dark:bg-dark-bg border-b border-border dark:border-dark-border">
          <div className="col-span-4">
            <span className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle">Owner</span>
          </div>
          <div className="col-span-4">
            <span className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle">Progress</span>
          </div>
          <div className="col-span-4">
            <span className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle">Key People</span>
          </div>
        </div>

        {/* Table Rows */}
        {departmentStats.map((dept, index) => (
          <div key={dept.code}>
            <div 
              className="grid grid-cols-12 gap-4 p-6 border-b border-border dark:border-dark-border last:border-0 hover:bg-cream dark:hover:bg-dark-bg transition-colors cursor-pointer group"
              onClick={() => toggleExpand(dept.code)}
            >
              {/* Owner Column */}
              <div className="col-span-4 flex items-start gap-4">
                <span className="font-mono text-2xl font-bold text-subtle dark:text-dark-subtle opacity-50 w-8">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-primary dark:text-dark-text tracking-tight">{dept.code}</h3>
                  <p className="text-sm text-subtle dark:text-dark-subtle mt-1 leading-tight">{dept.name}</p>
                </div>
              </div>

              {/* Progress Column */}
              <div className="col-span-4 flex flex-col justify-center">
                <div className="flex items-baseline gap-3 mb-2">
                  {sortMode === 'progress' ? (
                    <>
                      <span className="text-xl font-bold text-primary dark:text-dark-text">{dept.weightedScore}/100</span>
                      <span className="font-mono text-sm text-subtle dark:text-dark-subtle">progress score</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-primary dark:text-dark-text">{dept.percentage}% On Track</span>
                      <span className="font-mono text-sm text-subtle dark:text-dark-subtle">{dept.completed + dept.onTrack}/{dept.total}</span>
                    </>
                  )}
                </div>
                {/* Stacked progress bar */}
                <div className="w-full bg-cream dark:bg-dark-bg h-3 border border-border dark:border-dark-border flex overflow-hidden">
                  {dept.completed > 0 && (
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(dept.completed / dept.total) * 100}%` }}
                      title={`Completed: ${dept.completed}`}
                    />
                  )}
                  {dept.onTrack > 0 && (
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${(dept.onTrack / dept.total) * 100}%` }}
                      title={`On Track: ${dept.onTrack}`}
                    />
                  )}
                  {dept.partially > 0 && (
                    <div 
                      className="h-full bg-[#FFB800] transition-all duration-500"
                      style={{ width: `${(dept.partially / dept.total) * 100}%` }}
                      title={`Partially: ${dept.partially}`}
                    />
                  )}
                  {dept.delayed > 0 && (
                    <div 
                      className="h-full bg-[#FF4D00] transition-all duration-500"
                      style={{ width: `${(dept.delayed / dept.total) * 100}%` }}
                      title={`Delayed: ${dept.delayed}`}
                    />
                  )}
                  {dept.notStarted > 0 && (
                    <div 
                      className="h-full bg-[#CDCBC4] transition-all duration-500"
                      style={{ width: `${(dept.notStarted / dept.total) * 100}%` }}
                      title={`Not Started: ${dept.notStarted}`}
                    />
                  )}
                </div>
                {/* Status breakdown */}
                <div className="flex gap-3 mt-1.5 font-mono text-[10px] text-subtle dark:text-dark-subtle">
                  {dept.completed > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary"></span>{dept.completed} done</span>}
                  {dept.onTrack > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent"></span>{dept.onTrack} on track</span>}
                  {dept.partially > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#FFB800]"></span>{dept.partially} partially</span>}
                  {dept.delayed > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#FF4D00]"></span>{dept.delayed} delayed</span>}
                  {dept.notStarted > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#CDCBC4]"></span>{dept.notStarted} pending</span>}
                </div>
              </div>

              {/* Key People Column */}
              <div className="col-span-3 flex items-center gap-2 flex-wrap">
                {dept.keyPeople.map((person, i) => (
                  <div 
                    key={i} 
                    className="bg-cream dark:bg-dark-bg border border-border dark:border-dark-border px-3 py-2"
                  >
                    <div className="font-medium text-sm text-primary dark:text-dark-text">{person.name}</div>
                    <div className="font-mono text-[10px] text-subtle dark:text-dark-subtle uppercase tracking-wide">{person.role}</div>
                  </div>
                ))}
              </div>

              {/* Expand Arrow */}
              <div className="col-span-1 flex items-center justify-end">
                <ChevronRight 
                  className={`w-5 h-5 text-subtle dark:text-dark-subtle transition-transform ${expandedDept === dept.code ? 'rotate-90' : ''} group-hover:text-primary dark:group-hover:text-dark-text`} 
                />
              </div>
            </div>

            {/* Expanded Recommendations */}
            {expandedDept === dept.code && (
              <div className="bg-cream dark:bg-dark-bg border-b border-border dark:border-dark-border">
                <div className="p-6 space-y-3">
                  <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mb-4">
                    Recommendations ({dept.total})
                  </div>
                  {dept.recommendations.map(rec => (
                    <ExpandableRec key={rec.id} rec={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">Total Departments</div>
          <div className="text-3xl font-bold text-primary dark:text-dark-text">{departmentStats.length}</div>
        </div>
        <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">Total Recommendations</div>
          <div className="text-3xl font-bold text-primary dark:text-dark-text">{data.length}</div>
        </div>
        <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">On Track or Better</div>
          <div className="text-3xl font-bold text-accent">{data.filter(d => d.status === Status.COMPLETED || d.status === Status.ON_TRACK).length}</div>
        </div>
        <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">Avg Progress</div>
          <div className="text-3xl font-bold text-primary dark:text-dark-text">
            {departmentStats.length > 0 
              ? Math.round(departmentStats.reduce((acc, d) => acc + d.percentage, 0) / departmentStats.length) 
              : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueTable;
