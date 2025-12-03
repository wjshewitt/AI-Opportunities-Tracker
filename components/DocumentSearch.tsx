import React, { useState, useMemo, useCallback } from 'react';
import { Document, DocumentPage } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Search, ChevronDown, ChevronUp, FileText, RotateCcw, Eye, SearchIcon } from 'lucide-react';

interface DocumentSearchProps {
  documents: Document[];
}

interface SearchResult {
  document: Document;
  page: DocumentPage;
  matchCount: number;
  snippets: string[];
}

type TabView = 'viewer' | 'search';

const DocumentSearch: React.FC<DocumentSearchProps> = ({ documents }) => {
  const [activeTab, setActiveTab] = useState<TabView>('viewer');
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  
  const debouncedSearch = useDebounce(searchTerm, 200);

  const selectedDoc = useMemo(() => 
    documents.find(d => d.id === selectedDocId) || documents[0],
    [documents, selectedDocId]
  );

  const totalPages = useMemo(() => 
    documents.reduce((sum, doc) => sum + doc.pages.length, 0),
    [documents]
  );

  const searchResults = useMemo((): SearchResult[] => {
    if (!debouncedSearch.trim()) return [];
    
    const term = debouncedSearch.toLowerCase();
    const results: SearchResult[] = [];
    
    documents.forEach(doc => {
      doc.pages.forEach(page => {
        const content = page.content.toLowerCase();
        const matches = content.split(term).length - 1;
        
        if (matches > 0) {
          const snippets: string[] = [];
          const sentences = page.content.split(/[.!?]+/);
          
          sentences.forEach(sentence => {
            if (sentence.toLowerCase().includes(term) && snippets.length < 3) {
              snippets.push(sentence.trim());
            }
          });
          
          results.push({
            document: doc,
            page,
            matchCount: matches,
            snippets
          });
        }
      });
    });
    
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }, [documents, debouncedSearch]);

  const totalMatches = useMemo(() => {
    return searchResults.reduce((sum, r) => sum + r.matchCount, 0);
  }, [searchResults]);

  const toggleExpand = useCallback((docId: string, pageNumber: number) => {
    const key = `${docId}-${pageNumber}`;
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const highlightText = useCallback((text: string, term: string): React.ReactNode => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-accent text-primary px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  }, []);

  const resetSearch = () => {
    setSearchTerm('');
    setExpandedKeys(new Set());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary dark:border-accent pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-primary dark:text-dark-text">DOCUMENTS</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-subtle dark:text-dark-subtle mt-2">
            {documents.length} Documents • {totalPages} Pages Total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-subtle dark:text-dark-subtle" />
          <span className="font-mono text-xs text-subtle dark:text-dark-subtle">Official PDF Documents</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
        <button
          onClick={() => setActiveTab('viewer')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-mono uppercase tracking-wider transition-colors ${
            activeTab === 'viewer' 
              ? 'bg-primary text-cream' 
              : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
          }`}
        >
          <Eye size={16} />
          View PDFs
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-mono uppercase tracking-wider border-l border-border dark:border-dark-border transition-colors ${
            activeTab === 'search' 
              ? 'bg-primary text-cream' 
              : 'text-subtle dark:text-dark-subtle hover:bg-cream dark:hover:bg-dark-bg'
          }`}
        >
          <SearchIcon size={16} />
          Text Search
        </button>
      </div>

      {/* PDF Viewer */}
      {activeTab === 'viewer' && (
        <>
          {/* Document Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 border text-left transition-colors ${
                  selectedDocId === doc.id
                    ? 'border-primary dark:border-accent bg-white dark:bg-dark-surface'
                    : 'border-border dark:border-dark-border bg-cream dark:bg-dark-bg hover:bg-white dark:hover:bg-dark-surface'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText size={20} className={selectedDocId === doc.id ? 'text-primary dark:text-accent' : 'text-subtle dark:text-dark-subtle'} />
                  <div>
                    <h3 className={`font-semibold text-sm ${selectedDocId === doc.id ? 'text-primary dark:text-dark-text' : 'text-subtle dark:text-dark-subtle'}`}>
                      {doc.title}
                    </h3>
                    <p className="font-mono text-[10px] text-subtle dark:text-dark-subtle mt-1">
                      {doc.pages.length} PAGES
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* PDF Embed */}
          <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
            <div className="bg-cream dark:bg-dark-bg border-b border-border dark:border-dark-border px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-subtle dark:text-dark-subtle">
                {selectedDoc.title} • Use Ctrl+F / Cmd+F to search
              </span>
              <a 
                href={`/${selectedDoc.filename}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-wider text-primary dark:text-dark-text hover:text-accent transition-colors"
              >
                Open in New Tab →
              </a>
            </div>
            <iframe
              key={selectedDoc.id}
              src={`/${selectedDoc.filename}`}
              className="w-full h-[70vh] border-0"
              title={selectedDoc.title}
            />
          </div>
        </>
      )}

      {/* Text Search View */}
      {activeTab === 'search' && (
        <>
          {/* Search Bar */}
          <div className="p-6 bg-white dark:bg-dark-surface border border-border dark:border-dark-border">
            <div className="relative">
              <input 
                type="text" 
                placeholder="SEARCH ALL DOCUMENTS..." 
                className="w-full pl-4 pr-12 py-4 bg-cream dark:bg-dark-bg border border-border dark:border-dark-border rounded-none text-sm font-mono focus:outline-none focus:border-primary dark:focus:border-accent placeholder:text-subtle dark:placeholder:text-dark-subtle uppercase dark:text-dark-text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary dark:text-dark-text">
                <Search size={18} />
              </div>
            </div>
          </div>

          {/* Results Info */}
          {debouncedSearch.trim() && (
            <div className="flex items-center justify-between text-xs font-mono text-subtle dark:text-dark-subtle">
              <span>
                {searchResults.length > 0 ? (
                  <>
                    Found <span className="text-primary dark:text-dark-text font-bold">{totalMatches}</span> matches across{' '}
                    <span className="text-primary dark:text-dark-text font-bold">{searchResults.length}</span> pages
                  </>
                ) : (
                  'No matches found'
                )}
              </span>
              {searchTerm && (
                <button 
                  onClick={resetSearch}
                  className="flex items-center gap-2 text-primary dark:text-dark-text hover:text-accent transition-colors uppercase tracking-wider"
                >
                  <RotateCcw size={12} />
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {!debouncedSearch.trim() ? (
            <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-12 text-center">
              <FileText size={48} className="mx-auto text-border dark:text-dark-border mb-4" />
              <p className="font-mono text-sm uppercase text-subtle dark:text-dark-subtle">
                Enter a search term to search all documents
              </p>
              <p className="text-xs text-subtle dark:text-dark-subtle mt-2">
                Searches across {documents.length} documents ({totalPages} pages)
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface p-12 text-center">
              <p className="font-mono text-sm uppercase text-subtle dark:text-dark-subtle">
                No matching content found for "{debouncedSearch}"
              </p>
            </div>
          ) : (
            <div className="border border-border dark:border-dark-border bg-white dark:bg-dark-surface">
              {/* Table Header */}
              <div className="hidden md:flex border-b border-primary bg-primary text-cream py-3 px-6 text-[10px] font-mono uppercase tracking-widest">
                <div className="w-28 shrink-0">Document</div>
                <div className="w-16 shrink-0">Page</div>
                <div className="flex-grow">Content Preview</div>
                <div className="w-24 shrink-0 text-right">Matches</div>
                <div className="w-12 shrink-0"></div>
              </div>

              {searchResults.map((result, index) => {
                const isLast = index === searchResults.length - 1;
                const key = `${result.document.id}-${result.page.pageNumber}`;
                const isExpanded = expandedKeys.has(key);
                
                return (
                  <div key={key} className={`group ${!isLast ? 'border-b border-border dark:border-dark-border' : ''}`}>
                    {/* Row */}
                    <div 
                      className="flex flex-col md:flex-row md:items-center p-4 md:px-6 md:py-4 gap-4 cursor-pointer hover:bg-cream dark:hover:bg-dark-bg transition-colors"
                      onClick={() => toggleExpand(result.document.id, result.page.pageNumber)}
                    >
                      <div className="w-28 shrink-0">
                        <span className="font-mono text-[10px] font-medium text-subtle dark:text-dark-subtle bg-cream dark:bg-dark-bg px-2 py-1 inline-block truncate max-w-full">
                          {result.document.id === 'action-plan' ? 'ACTION PLAN' : 'GOV RESPONSE'}
                        </span>
                      </div>
                      
                      <div className="w-16 shrink-0">
                        <span className="font-mono text-xs font-bold text-accent bg-primary px-2 py-1 inline-block">
                          P{result.page.pageNumber.toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <p className="text-sm text-primary dark:text-dark-text leading-relaxed line-clamp-2">
                          {highlightText(result.snippets[0] || result.page.content.slice(0, 200), debouncedSearch)}...
                        </p>
                      </div>

                      <div className="w-24 shrink-0 text-right hidden md:block">
                        <span className="font-mono text-xs bg-cream dark:bg-dark-bg px-2 py-1 border border-border dark:border-dark-border dark:text-dark-text">
                          {result.matchCount} {result.matchCount === 1 ? 'match' : 'matches'}
                        </span>
                      </div>

                      <div className="w-12 shrink-0 flex justify-center text-primary dark:text-dark-text opacity-30 group-hover:opacity-100 transition-opacity">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="bg-cream dark:bg-dark-bg border-t border-border dark:border-dark-border border-dashed p-6 animate-in slide-in-from-top-1">
                        <h5 className="font-mono text-[10px] uppercase tracking-widest text-subtle dark:text-dark-subtle mb-4">
                          Full Page Content
                        </h5>
                        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border p-6 text-sm leading-relaxed max-h-96 overflow-y-auto custom-scrollbar dark:text-dark-text">
                          {highlightText(result.page.content, debouncedSearch)}
                        </div>
                        <div className="mt-4 flex gap-4 text-xs font-mono text-subtle dark:text-dark-subtle">
                          <span>DOCUMENT: {result.document.title}</span>
                          <span>PAGE: {result.page.pageNumber} of {result.document.pages.length}</span>
                          <span>MATCHES: {result.matchCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentSearch;
