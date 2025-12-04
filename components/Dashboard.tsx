import React from 'react';
import { Recommendation, Status } from '../types';
import DashboardChart from './DashboardChart';
import DeadlineHorizon from './DeadlineHorizon';
import StatusLegend from './StatusLegend';
import { ArrowRight, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface DashboardProps {
  data: Recommendation[];
  onChangeView: (view: 'tracker', params?: { search?: string }) => void;
}

const StatCell: React.FC<{ 
  title: string; 
  count: number; 
  total: number; 
  statusColor: string;
}> = ({ title, count, total, statusColor }) => {
  const percentage = Math.round((count / total) * 100) || 0;
  
  return (
    <div className="relative p-6 md:p-8 bg-white dark:bg-dark-surface border border-border dark:border-dark-border flex flex-col justify-between h-48 hover:border-primary dark:hover:border-accent transition-colors group">
      <div className="flex justify-between items-start">
        <span className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle">{title}</span>
        <div className={`w-2 h-2 ${statusColor}`}></div>
      </div>
      
      <div>
        <div className="text-5xl font-bold text-primary dark:text-dark-text tracking-tighter mb-2 group-hover:translate-x-1 transition-transform">{count}</div>
        <div className="w-full bg-cream dark:bg-dark-bg h-1 mt-2">
          <div className={`h-full ${statusColor}`} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="mt-2 text-right font-mono text-[10px] text-subtle dark:text-dark-subtle">{percentage}% OF TOTAL</div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ data, onChangeView }) => {
  const completed = data.filter(r => r.status === Status.COMPLETED).length;
  const onTrack = data.filter(r => r.status === Status.ON_TRACK).length;
  const partially = data.filter(r => r.status === Status.PARTIALLY).length;
  const delayed = data.filter(r => r.status === Status.DELAYED).length;
  const notStarted = data.filter(r => r.status === Status.NOT_STARTED).length;

  // Calculate departmental breakdown
  const deptCounts: Record<string, number> = {};
  data.forEach(r => {
    deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
  });
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Typographic Hero */}
      <div className="border-b border-primary/10 dark:border-accent/10 pb-12 relative overflow-hidden">
        <h1 className="text-6xl md:text-8xl font-black text-primary dark:text-dark-text tracking-tighter mb-8 leading-[0.85]">
          AI ACTION<br/>
          <span className="opacity-70">PLAN TRACKER</span><span className="text-accent">.</span>
        </h1>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Main Value Prop */}
          <div>
            <div className="relative pl-6 border-l-4 border-accent mb-8">
              <p className="text-xl md:text-2xl font-light text-primary dark:text-dark-text leading-relaxed">
                Tracking the implementation of the National AI Opportunities Action Plan.
              </p>

            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://docs.google.com/spreadsheets/d/1DKF3fe6EES8yPHpjWF_O3__xxDFahHY1YrTdS9GJR08" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 px-6 py-4 bg-primary dark:bg-accent text-white dark:text-primary font-mono text-sm uppercase tracking-wider font-bold overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <FileSpreadsheet size={18} />
                <span>View Live Tracker</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a 
                href="https://www.ai-forum.fyi/p/the-ai-opportunities-action-plan?utm_source=substack&utm_medium=email&utm_content=share" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-sm font-mono uppercase tracking-wider hover:bg-cream dark:hover:bg-dark-bg transition-colors dark:text-dark-text"
              >
                <ExternalLink size={16} className="text-subtle dark:text-dark-subtle group-hover:text-primary dark:group-hover:text-dark-text transition-colors"/>
                <span>Source: The AI Forum</span>
              </a>
            </div>
          </div>

          {/* Right Column: Contextual Details */}
          <div className="prose prose-sm dark:prose-invert text-subtle dark:text-dark-subtle leading-relaxed space-y-4 max-w-none">
            <p>
              In January 2025, the UK Government released the <strong className="text-primary dark:text-dark-text">AI Opportunities Action Plan</strong>, 
              authored by <strong className="text-primary dark:text-dark-text">Matt Clifford</strong>. 
              The plan outlines 50 recommendations to position the UK as an AI superpower, covering compute infrastructure, 
              talent development, public sector adoption, and regulatory frameworks.
            </p>
            <p>
              The Government published its official response accepting all 50 recommendations, committing to their implementation 
              across multiple departments. This tracker monitors progress against those commitments.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-cream/50 dark:bg-dark-bg/50 border border-border/50 dark:border-dark-border/50 rounded-none">
            <p className="text-sm text-subtle dark:text-dark-subtle font-mono leading-relaxed">
              <span className="text-accent font-bold uppercase text-xs tracking-wider mr-2">Note:</span>
              The status of government adherence to these recommendations is subjective to a degree, so feel free to contact me about disagreements or obvious errors. Much of this information is sourced from The AI Forum's Google Doc, though additional work and sourcing has been done to augment it as much as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - "Bento" style */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-border dark:border-dark-border bg-border dark:bg-dark-border">
        {/* Gap-0 with bg-border creates inner borders */}
        <StatCell 
          title="Completed" 
          count={completed} 
          total={data.length}
          statusColor="bg-primary"
        />
        <StatCell 
          title="On Track" 
          count={onTrack} 
          total={data.length}
          statusColor="bg-accent"
        />
        <StatCell 
          title="Partially" 
          count={partially} 
          total={data.length}
          statusColor="bg-[#FFB800]"
        />
        <StatCell 
          title="Delayed" 
          count={delayed} 
          total={data.length}
          statusColor="bg-[#FF4D00]"
        />
        <StatCell 
          title="Pending" 
          count={notStarted} 
          total={data.length}
          statusColor="bg-[#CDCBC4]"
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Column */}
        <div className="lg:col-span-1 border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-8 relative">
          <div className="absolute top-0 left-0 bg-primary text-cream text-[10px] font-mono px-2 py-1 uppercase">Figure 1.1</div>
          <h3 className="font-bold text-lg mb-8 tracking-tight dark:text-dark-text">Status Distribution</h3>
          <DashboardChart data={data} />
          
          {/* Custom Legend */}
          <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-border dark:border-dark-border">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary"></div>
                <span className="text-xs font-mono uppercase dark:text-dark-text">Completed</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent"></div>
                <span className="text-xs font-mono uppercase dark:text-dark-text">On Track</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FFB800]"></div>
                <span className="text-xs font-mono uppercase dark:text-dark-text">Partially</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF4D00]"></div>
                <span className="text-xs font-mono uppercase dark:text-dark-text">Delayed</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#CDCBC4]"></div>
                <span className="text-xs font-mono uppercase dark:text-dark-text">Pending</span>
             </div>
          </div>
        </div>

        {/* Department List */}
        <div className="lg:col-span-2 border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-0 flex flex-col relative">
          <div className="absolute top-0 left-0 bg-primary text-cream text-[10px] font-mono px-2 py-1 uppercase">Figure 1.2</div>
          <div className="p-8 border-b border-border dark:border-dark-border flex justify-between items-end">
            <div>
              <h3 className="font-bold text-lg tracking-tight dark:text-dark-text">Departmental Velocity</h3>
            </div>
            <button 
              onClick={() => onChangeView('tracker')}
              className="group flex items-center gap-2 text-sm font-mono uppercase hover:text-accent transition-colors dark:text-dark-text"
            >
              Full Index <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {sortedDepts.map(([dept, count], index) => (
              <div key={dept} className="flex items-center gap-6 p-4 px-8 border-b border-border dark:border-dark-border last:border-0 hover:bg-cream dark:hover:bg-dark-bg transition-colors group">
                <span className="font-mono text-xs text-subtle dark:text-dark-subtle w-4">{(index + 1).toString().padStart(2, '0')}</span>
                <div className="w-32 font-medium text-sm shrink-0 dark:text-dark-text">{dept}</div>
                <div className="flex-grow flex items-center gap-4">
                   <div className="flex-grow bg-cream dark:bg-dark-bg h-8 relative border border-border dark:border-dark-border">
                     <div 
                       className="absolute top-0 left-0 h-full bg-primary group-hover:bg-accent transition-colors duration-300" 
                       style={{ width: `${(count / data.length) * 100}%` }}
                     ></div>
                   </div>
                   <span className="font-mono text-sm w-8 text-right dark:text-dark-text">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline Horizon Visualization */}
      <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-8 relative">
        <div className="absolute top-0 left-0 bg-primary text-cream text-[10px] font-mono px-2 py-1 uppercase">Figure 1.3</div>
        <h3 className="font-bold text-lg mb-2 tracking-tight dark:text-dark-text">Deadline Horizons</h3>
        <p className="text-sm text-subtle dark:text-dark-subtle mb-6">Distribution of delivery timelines across short, medium, and long-term horizons</p>
        <DeadlineHorizon 
          data={data} 
          onRecommendationClick={(id) => onChangeView('tracker', { search: id })}
        />
        
        {/* Legend */}
        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-cream"></div>
            <span className="text-xs font-mono uppercase dark:text-dark-text">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent border-2 border-cream"></div>
            <span className="text-xs font-mono uppercase dark:text-dark-text">On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFB800] border-2 border-cream"></div>
            <span className="text-xs font-mono uppercase dark:text-dark-text">Partially</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF4D00] border-2 border-cream"></div>
            <span className="text-xs font-mono uppercase dark:text-dark-text">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#CDCBC4] border-2 border-cream"></div>
            <span className="text-xs font-mono uppercase dark:text-dark-text">Pending</span>
          </div>
        </div>
      </div>

      {/* Status Definitions Key */}
      <div>
        <h3 className="font-bold text-lg mb-4 tracking-tight dark:text-dark-text">How We Define Status</h3>
        <StatusLegend />
      </div>
    </div>
  );
};

export default Dashboard;