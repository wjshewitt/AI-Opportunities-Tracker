import React, { useState, useEffect, useMemo } from 'react';
import { useHansardMentions, HansardResponse, HansardContribution, MemberParty } from '../hansardApi';
import { ExternalLink, RefreshCw, ChevronDown, ChevronUp, Users, Eye, EyeOff } from 'lucide-react';
import MentionsChart from './MentionsChart';
import { getSentiment, sentimentConfig, Sentiment } from '../sentimentData';

interface PartyStats {
  name: string;
  count: number;
  colour: string;
  abbreviation: string;
}

interface DisplayOptions {
  showParty: boolean;
  showSentiment: boolean;
  showChamber: boolean;
}

// AI Action Plan was unveiled on 13 Jan 2025
const PLAN_START_DATE = new Date(2025, 0, 1);

const ParliamentTest: React.FC = () => {
  const [data, setData] = useState<HansardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    showParty: true,
    showSentiment: true,
    showChamber: true,
  });
  
  const { load, refresh } = useHansardMentions();

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = forceRefresh ? await refresh() : await load();
      setData(result as HansardResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    if (!data) return { total: 0, commons: 0, lords: 0 };
    const commons = data.Contributions.filter(c => c.House === 'Commons').length;
    const lords = data.Contributions.filter(c => c.House === 'Lords').length;
    return { total: data.TotalContributions, commons, lords };
  }, [data]);

  const partyStats = useMemo((): PartyStats[] => {
    if (!data) return [];
    const counts: Record<string, { count: number; colour: string; abbreviation: string }> = {};
    
    data.Contributions.forEach(c => {
      const party = c.Party?.name || 'Unknown';
      const colour = c.Party?.backgroundColour || '#888888';
      const abbreviation = c.Party?.abbreviation || party.substring(0, 3);
      
      if (!counts[party]) {
        counts[party] = { count: 0, colour, abbreviation };
      }
      counts[party].count++;
    });
    
    return Object.entries(counts)
      .map(([name, { count, colour, abbreviation }]) => ({ name, count, colour, abbreviation }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const sentimentStats = useMemo(() => {
    if (!data) return { positive: 0, neutral: 0, negative: 0 };
    const counts = { positive: 0, neutral: 0, negative: 0 };
    data.Contributions.forEach(c => {
      const sentiment = getSentiment(c.ContributionExtId);
      counts[sentiment]++;
    });
    return counts;
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Generate all months from Jan 2025 to current month
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const allMonths: string[] = [];
    let current = new Date(PLAN_START_DATE);
    
    while (current <= currentMonth) {
      allMonths.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
    
    const monthCounts: Record<string, { commons: number; lords: number }> = {};
    allMonths.forEach(m => { monthCounts[m] = { commons: 0, lords: 0 }; });
    
    data.Contributions.forEach(c => {
      const date = new Date(c.SittingDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthCounts[monthKey]) {
        if (c.House === 'Commons') {
          monthCounts[monthKey].commons++;
        } else {
          monthCounts[monthKey].lords++;
        }
      }
    });
    
    return allMonths.map(m => {
      const [year, month] = m.split('-');
      const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      return {
        month: label,
        commons: monthCounts[m].commons,
        lords: monthCounts[m].lords
      };
    });
  }, [data]);

  const contributionsData = useMemo(() => {
    if (!data) return [];
    return data.Contributions.map(c => ({
      date: new Date(c.SittingDate),
      house: c.House,
      member: c.MemberName,
      debate: c.DebateSection
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-1 bg-primary dark:bg-accent animate-pulse"></div>
          <span className="font-mono text-xs uppercase tracking-widest dark:text-dark-text">Loading Hansard Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary dark:border-accent pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-primary dark:text-dark-text">PARLIAMENT</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mt-2">
            Hansard mentions of AI Opportunities Action Plan
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-sm font-mono hover:bg-cream dark:hover:bg-dark-bg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 font-mono text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
          <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">Total Mentions</div>
          <div className="text-4xl font-bold text-primary dark:text-dark-text">{stats.total}</div>
        </div>
        <div className="p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
          <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">Commons</div>
          <div className="text-4xl font-bold text-primary dark:text-dark-text">{stats.commons}</div>
        </div>
        <div className="p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
          <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2">Lords</div>
          <div className="text-4xl font-bold text-primary dark:text-dark-text">{stats.lords}</div>
        </div>
      </div>

      {/* Party Breakdown */}
      {partyStats.length > 0 && (
        <div className="p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-subtle dark:text-dark-subtle" />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">Contributions by Party</h3>
          </div>
          <div className="space-y-3">
            {partyStats.map(party => {
              const percentage = stats.total > 0 ? (party.count / stats.total) * 100 : 0;
              return (
                <div key={party.name} className="flex items-center gap-4">
                  <div className="w-24 shrink-0 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm shrink-0" 
                      style={{ backgroundColor: party.colour }}
                    />
                    <span className="font-mono text-xs text-primary dark:text-dark-text truncate" title={party.name}>
                      {party.abbreviation}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="h-6 bg-cream dark:bg-dark-bg rounded-sm overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: party.colour,
                          minWidth: party.count > 0 ? '4px' : '0'
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 shrink-0 text-right">
                    <span className="font-mono text-sm font-bold text-primary dark:text-dark-text">{party.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sentiment Stats */}
      {stats.total > 0 && (
        <div className="p-4 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">Sentiment:</span>
            <div className="flex items-center gap-2">
              <span className="text-green-500">{sentimentConfig.positive.icon}</span>
              <span className="font-mono text-xs text-primary dark:text-dark-text">{sentimentStats.positive}</span>
              <span className="font-mono text-[10px] text-subtle dark:text-dark-subtle">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{sentimentConfig.neutral.icon}</span>
              <span className="font-mono text-xs text-primary dark:text-dark-text">{sentimentStats.neutral}</span>
              <span className="font-mono text-[10px] text-subtle dark:text-dark-subtle">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">{sentimentConfig.negative.icon}</span>
              <span className="font-mono text-xs text-primary dark:text-dark-text">{sentimentStats.negative}</span>
              <span className="font-mono text-[10px] text-subtle dark:text-dark-subtle">Negative</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-4">Mentions Over Time</h3>
        <MentionsChart data={chartData} contributions={contributionsData} />
      </div>

      {/* Display Options Toggle */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-cream dark:bg-dark-bg border border-border dark:border-dark-border">
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle">Show:</span>
        <button
          onClick={() => setDisplayOptions(prev => ({ ...prev, showParty: !prev.showParty }))}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs border transition-colors ${
            displayOptions.showParty 
              ? 'bg-primary text-cream border-primary' 
              : 'bg-white dark:bg-dark-surface text-subtle dark:text-dark-subtle border-border dark:border-dark-border'
          }`}
        >
          {displayOptions.showParty ? <Eye size={12} /> : <EyeOff size={12} />}
          Party
        </button>
        <button
          onClick={() => setDisplayOptions(prev => ({ ...prev, showSentiment: !prev.showSentiment }))}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs border transition-colors ${
            displayOptions.showSentiment 
              ? 'bg-primary text-cream border-primary' 
              : 'bg-white dark:bg-dark-surface text-subtle dark:text-dark-subtle border-border dark:border-dark-border'
          }`}
        >
          {displayOptions.showSentiment ? <Eye size={12} /> : <EyeOff size={12} />}
          Sentiment
        </button>
        <button
          onClick={() => setDisplayOptions(prev => ({ ...prev, showChamber: !prev.showChamber }))}
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs border transition-colors ${
            displayOptions.showChamber 
              ? 'bg-primary text-cream border-primary' 
              : 'bg-white dark:bg-dark-surface text-subtle dark:text-dark-subtle border-border dark:border-dark-border'
          }`}
        >
          {displayOptions.showChamber ? <Eye size={12} /> : <EyeOff size={12} />}
          Chamber
        </button>
      </div>

      {/* Contributions List */}
      <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="border-b border-primary bg-primary text-cream py-3 px-6 text-[10px] font-mono uppercase tracking-widest flex">
          <div className="w-28 shrink-0">Date</div>
          {displayOptions.showChamber && <div className="w-20 shrink-0">House</div>}
          <div className="w-48 shrink-0">Speaker</div>
          <div className="flex-grow">Debate</div>
          <div className="w-20 shrink-0"></div>
        </div>

        {data?.Contributions.map((contribution, index) => (
          <ContributionRow 
            key={`${contribution.DebateSectionExtId}-${index}`} 
            contribution={contribution} 
            displayOptions={displayOptions}
          />
        ))}
      </div>

      {/* Link to Hansard */}
      <div className="text-center">
        <a
          href="https://hansard.parliament.uk/search?searchTerm=AI%20Opportunities%20Action%20Plan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-cream font-mono text-sm hover:bg-primary-light transition-colors"
        >
          View all on Hansard
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

const HighlightedText: React.FC<{ text: string }> = ({ text }) => {
  // Match all search terms: "AI Opportunities Action Plan", "AI Opportunities Plan", "AI Action Plan", "AI Plan"
  const regex = /AI (?:Opportunities )?(?:Action )?Plan/gi;
  const parts = text.split(regex);
  const matches = text.match(regex) || [];
  
  const result: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    result.push(<span key={`text-${i}`}>{part}</span>);
    if (i < matches.length) {
      result.push(
        <mark key={`match-${i}`} className="bg-accent text-primary font-semibold px-1">
          {matches[i]}
        </mark>
      );
    }
  });
  
  return <>{result}</>;
};

const ContributionRow: React.FC<{ 
  contribution: HansardContribution; 
  displayOptions: DisplayOptions;
}> = ({ contribution, displayOptions }) => {
  const [expanded, setExpanded] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const date = new Date(contribution.SittingDate);
  const formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  
  // Format: https://hansard.parliament.uk/Commons/2025-01-13/debates/EXTID/Title#contribution-XXXXX
  const dateStr = contribution.SittingDate.split('T')[0];
  const house = contribution.House;
  const debateSlug = contribution.DebateSection.replace(/[^a-zA-Z0-9]+/g, '');
  const anchor = contribution.ContributionExtId ? `#contribution-${contribution.ContributionExtId}` : '';
  const hansardUrl = `https://hansard.parliament.uk/${house}/${dateStr}/debates/${contribution.DebateSectionExtId}/${debateSlug}${anchor}`;

  // Clean HTML tags from full text
  const fullText = (contribution.ContributionTextFull || contribution.ContributionText || '')
    .replace(/<[^>]*>/g, '')
    .trim();

  const sentiment = getSentiment(contribution.ContributionExtId);
  const sentimentInfo = sentimentConfig[sentiment];

  // Split text around the first highlight match
  const regex = /AI (?:Opportunities )?(?:Action )?Plan/i;
  const match = fullText.match(regex);
  const matchIndex = match ? fullText.indexOf(match[0]) : -1;
  
  // Get context around match (expand to sentence boundaries)
  const getContextBounds = (text: string, matchStart: number, matchEnd: number) => {
    // Find sentence start (look for . ! ? followed by space, or start of text)
    let contextStart = matchStart;
    for (let i = matchStart - 1; i >= 0 && i >= matchStart - 200; i--) {
      if ((text[i] === '.' || text[i] === '!' || text[i] === '?') && text[i + 1] === ' ') {
        contextStart = i + 2;
        break;
      }
      if (i === 0) contextStart = 0;
    }
    
    // Find sentence end
    let contextEnd = matchEnd;
    for (let i = matchEnd; i < text.length && i <= matchEnd + 200; i++) {
      if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
        contextEnd = i + 1;
        break;
      }
      if (i === text.length - 1) contextEnd = text.length;
    }
    
    return { contextStart, contextEnd };
  };

  const hasMatch = matchIndex !== -1;
  const { contextStart, contextEnd } = hasMatch 
    ? getContextBounds(fullText, matchIndex, matchIndex + (match?.[0]?.length || 0))
    : { contextStart: 0, contextEnd: fullText.length };
  
  const textAbove = hasMatch ? fullText.slice(0, contextStart).trim() : '';
  const textHighlighted = hasMatch ? fullText.slice(contextStart, contextEnd) : fullText;
  const textBelow = hasMatch ? fullText.slice(contextEnd).trim() : '';

  // Reset show states when collapsing
  const handleToggle = () => {
    if (expanded) {
      setShowFullText(false);
    }
    setExpanded(!expanded);
  };

  return (
    <div className="border-b border-border dark:border-dark-border last:border-0">
      <div 
        className="flex items-center p-4 px-6 gap-4 hover:bg-cream dark:hover:bg-dark-bg transition-colors cursor-pointer"
        onClick={handleToggle}
      >
        <div className="w-28 shrink-0 font-mono text-xs dark:text-dark-text">{formattedDate}</div>
        {displayOptions.showChamber && (
          <div className="w-20 shrink-0">
            <span className={`font-mono text-[10px] px-2 py-0.5 ${
              contribution.House === 'Commons' ? 'bg-primary text-cream' : 'bg-accent text-primary'
            }`}>
              {contribution.House}
            </span>
          </div>
        )}
        <div className="w-48 shrink-0 flex items-center gap-2">
          {displayOptions.showSentiment && (
            <span 
              className="shrink-0 text-sm"
              style={{ color: sentimentInfo.color }}
              title={sentimentInfo.label}
            >
              {sentimentInfo.icon}
            </span>
          )}
          <span className="font-mono text-xs text-subtle dark:text-dark-subtle truncate" title={contribution.MemberName}>
            {contribution.MemberName}
          </span>
          {displayOptions.showParty && contribution.Party && (
            <span 
              className="shrink-0 font-mono text-[9px] px-1 py-0.5 rounded text-white"
              style={{ backgroundColor: contribution.Party.backgroundColour }}
            >
              {contribution.Party.abbreviation}
            </span>
          )}
        </div>
        <div className="flex-grow text-sm truncate dark:text-dark-text" title={contribution.DebateSection}>
          {contribution.DebateSection}
        </div>
        <div className="w-20 shrink-0 flex justify-end gap-2">
          <a
            href={hansardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-subtle dark:text-dark-subtle hover:text-primary dark:hover:text-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
          {expanded ? <ChevronUp size={14} className="text-subtle dark:text-dark-subtle" /> : <ChevronDown size={14} className="text-subtle dark:text-dark-subtle" />}
        </div>
      </div>
      {expanded && fullText && (
        <div className="px-6 pb-4 pt-0">
          <div className="bg-cream dark:bg-dark-bg p-4 text-sm leading-relaxed text-primary/80 dark:text-dark-text/80 border-l-2 border-accent">
            <div className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-2 flex items-center gap-2 flex-wrap">
              <span>{contribution.AttributedTo}</span>
              {displayOptions.showParty && contribution.Party && (
                <span 
                  className="px-1.5 py-0.5 rounded text-white text-[9px]"
                  style={{ backgroundColor: contribution.Party.backgroundColour }}
                >
                  {contribution.Party.name}
                </span>
              )}
              {displayOptions.showSentiment && (
                <span 
                  className="px-1.5 py-0.5 rounded text-[9px]"
                  style={{ 
                    backgroundColor: sentimentInfo.bgColor,
                    color: sentimentInfo.color 
                  }}
                >
                  {sentimentInfo.icon} {sentimentInfo.label}
                </span>
              )}
            </div>
            
            {showFullText ? (
              /* Full text view */
              <div>
                <HighlightedText text={fullText} />
              </div>
            ) : (
              /* Focused view with gradient blur */
              <div className="relative">
                {/* Text Above - Gradient blur */}
                {textAbove && (
                  <div className="relative mb-2">
                    <p 
                      className="text-primary/40 dark:text-dark-text/40"
                      style={{
                        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)'
                      }}
                    >
                      {textAbove}
                    </p>
                  </div>
                )}
                
                {/* Highlighted Section - Always visible and focused */}
                <div className="py-2 px-3 bg-accent/10 border-l-2 border-accent my-2">
                  <HighlightedText text={textHighlighted} />
                </div>
                
                {/* Text Below - Gradient blur */}
                {textBelow && (
                  <div className="relative mt-2">
                    <p 
                      className="text-primary/40 dark:text-dark-text/40"
                      style={{
                        maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)'
                      }}
                    >
                      {textBelow}
                    </p>
                  </div>
                )}
                
                {/* Single "See more" button */}
                {(textAbove || textBelow) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowFullText(true); }}
                    className="mt-3 text-xs font-mono uppercase tracking-wider text-accent hover:text-primary dark:hover:text-dark-text transition-colors"
                  >
                    See full text →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParliamentTest;
