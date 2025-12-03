import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, Recommendation } from './types';
import { fetchData, refreshData } from './api';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import Timeline from './components/Timeline';
import LeagueTable from './components/LeagueTable';
import DocumentSearch from './components/DocumentSearch';
import ParliamentTest from './components/ParliamentTest';
import { DOCUMENTS } from './documentData';
import { LayoutDashboard, ListTodo, CalendarDays, Trophy, FileText, Building2, ArrowUpRight, RefreshCw, AlertCircle, X, Moon, Sun } from 'lucide-react';
import InfoPopover from './components/InfoPopover';
import { useDarkMode } from './hooks/useDarkMode';

const VALID_VIEWS: ViewState[] = ['dashboard', 'tracker', 'timeline', 'league', 'document', 'test'];

function getViewFromHash(): ViewState {
  const hash = window.location.hash.slice(1);
  return VALID_VIEWS.includes(hash as ViewState) ? (hash as ViewState) : 'dashboard';
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(getViewFromHash);
  const [viewParams, setViewParams] = useState<{ search?: string }>({});
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getViewFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((view: ViewState, params?: { search?: string }) => {
    window.location.hash = view;
    setCurrentView(view);
    if (params) {
      setViewParams(params);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const result = await fetchData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await refreshData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-1 bg-primary dark:bg-accent animate-pulse"></div>
             <span className="font-mono text-xs uppercase tracking-widest dark:text-dark-text">Loading Data...</span>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={data} onChangeView={navigate} />;
      case 'tracker':
        return <Tracker data={data} initialSearch={viewParams.search} />;
      case 'timeline':
        return <Timeline data={data} />;
      case 'league':
        return <LeagueTable data={data} />;
      case 'document':
        return <DocumentSearch documents={DOCUMENTS} />;
      case 'test':
        return <ParliamentTest />;
      default:
        return <Dashboard data={data} onChangeView={navigate} />;
    }
  };

  const NavItem = ({ view, label, icon: Icon }: { view: ViewState, label: string, icon: React.ComponentType<{ size?: number }> }) => (
    <button 
      onClick={() => navigate(view)}
      title={label}
      className={`relative h-full px-3 lg:px-4 flex items-center gap-2 text-sm font-medium transition-colors border-l border-transparent hover:bg-white/50 dark:hover:bg-dark-surface/50 ${
        currentView === view 
          ? 'bg-white dark:bg-dark-surface text-primary dark:text-dark-text border-l-primary border-r border-r-border dark:border-r-dark-border' 
          : 'text-subtle dark:text-dark-subtle border-r border-r-transparent'
      }`}
    >
      <Icon size={16} />
      <span className="hidden lg:inline uppercase tracking-wide text-xs">{label}</span>
      {currentView === view && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent"></div>
      )}
    </button>
  );

  return (
    <div className="min-h-full bg-cream dark:bg-dark-bg text-primary dark:text-dark-text font-sans flex flex-col transition-colors duration-300">
      
      {/* Structural Header */}
      <header className="sticky top-0 z-50 bg-cream dark:bg-dark-bg border-b border-primary dark:border-accent transition-colors duration-300">
        <div className="max-w-7xl mx-auto border-x border-border/50 dark:border-dark-border/50">
          <div className="flex h-16 items-stretch justify-between">
            
            {/* Logo Area */}
            <div className="flex items-center px-4 lg:px-6 shrink-0 border-r border-border dark:border-dark-border bg-primary text-cream">
              <div className="font-bold text-sm lg:text-lg leading-none uppercase tracking-tighter">
                AI Action<br/>Plan Tracker
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-stretch flex-grow">
              <NavItem view="dashboard" label="Overview" icon={LayoutDashboard} />
              <NavItem view="tracker" label="Tracker" icon={ListTodo} />
              <NavItem view="timeline" label="Timeline" icon={CalendarDays} />
              <NavItem view="league" label="Departments" icon={Trophy} />
              <NavItem view="document" label="Document" icon={FileText} />
              <NavItem view="test" label="Parliament" icon={Building2} />
            </nav>

            {/* Header Utilities */}
            <div className="flex items-center gap-1">
              <InfoPopover>
                <p>
                  Data is updated regularly on a best-efforts basis and may occasionally lag underlying
                  government sources.
                </p>
                <p>
                  If you spot an error, please email hewittjswill (at) gmail dot com.
                </p>
              </InfoPopover>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center px-3 border-l border-border dark:border-dark-border bg-cream dark:bg-dark-bg hover:bg-white dark:hover:bg-dark-surface transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex items-center px-3 border-l border-border dark:border-dark-border bg-cream dark:bg-dark-bg hover:bg-white dark:hover:bg-dark-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>

              {/* External Link */}
              <a 
                href="https://docs.google.com/spreadsheets/d/1DKF3fe6EES8yPHpjWF_O3__xxDFahHY1YrTdS9GJR08"
                target="_blank"
                rel="noopener noreferrer"
                title="Live Tracker"
                className="flex items-center px-3 lg:px-4 border-l border-border dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-accent transition-colors cursor-pointer group"
              >
                <span className="text-xs font-mono uppercase tracking-wider mr-2 hidden xl:inline">Live</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
              </a>
            </div>
          </div>
        </div>
        
        {/* Mobile Nav Bar (Below header for mobile only) */}
        <div className="md:hidden grid grid-cols-6 border-b border-border dark:border-dark-border bg-white dark:bg-dark-surface">
          <button onClick={() => navigate('dashboard')} className={`p-3 flex justify-center border-r border-border dark:border-dark-border ${currentView === 'dashboard' ? 'bg-accent' : ''}`}><LayoutDashboard/></button>
          <button onClick={() => navigate('tracker')} className={`p-3 flex justify-center border-r border-border dark:border-dark-border ${currentView === 'tracker' ? 'bg-accent' : ''}`}><ListTodo/></button>
          <button onClick={() => navigate('timeline')} className={`p-3 flex justify-center border-r border-border dark:border-dark-border ${currentView === 'timeline' ? 'bg-accent' : ''}`}><CalendarDays/></button>
          <button onClick={() => navigate('league')} className={`p-3 flex justify-center border-r border-border dark:border-dark-border ${currentView === 'league' ? 'bg-accent' : ''}`}><Trophy/></button>
          <button onClick={() => navigate('document')} className={`p-3 flex justify-center border-r border-border dark:border-dark-border ${currentView === 'document' ? 'bg-accent' : ''}`}><FileText/></button>
          <button onClick={() => navigate('test')} className={`p-3 flex justify-center ${currentView === 'test' ? 'bg-accent' : ''}`}><Building2/></button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle size={16} />
                <span className="text-sm font-mono">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto border-x border-border/50 dark:border-dark-border/50 bg-cream dark:bg-dark-bg transition-colors duration-300">
        <div className="p-4 md:p-8 lg:p-12">
          {renderView()}
        </div>
      </main>

      {/* Structural Footer */}
      <footer className="border-t border-primary dark:border-accent bg-primary text-cream">
        <div className="max-w-7xl mx-auto border-x border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="p-8 md:col-span-2">
              <h4 className="font-mono text-xs text-accent mb-4 uppercase tracking-widest">About</h4>
              <p className="text-sm text-gray-300 leading-relaxed max-w-md">
                An independent tracking mechanism for the UK Government's AI Opportunities Action Plan. 
                Monitoring implementation velocity and public sector accountability.
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Credit: <a href="https://www.ai-forum.fyi/p/the-ai-opportunities-action-plan?utm_source=substack&utm_medium=email&utm_content=share" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">The AI Forum</a>
              </p>
            </div>
            <div className="p-8">
               <h4 className="font-mono text-xs text-accent mb-4 uppercase tracking-widest">Data Source</h4>
               <ul className="space-y-2 text-sm text-gray-400 font-mono">
                 <li>DSIT Publications</li>
                 <li>Hansard Records</li>
                 <li>Departmental Reports</li>
               </ul>
            </div>
            <div className="p-8 flex flex-col justify-end">
            </div>
          </div>
          <div className="border-t border-white/10 px-4 py-3 text-center text-[11px] font-mono text-gray-300">
            Built by{' '}
            <a
              href="https://whewitt.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Will Hewitt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
