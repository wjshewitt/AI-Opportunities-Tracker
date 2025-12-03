import { Recommendation, Status } from './types';
import { RECOMMENDATIONS } from './data';
import { applySourceMetadata } from './sourceMetadata';

const CACHE_KEY = 'aiplan_data';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1DKF3fe6EES8yPHpjWF_O3__xxDFahHY1YrTdS9GJR08/export?format=csv';

interface CacheData {
  data: Recommendation[];
  timestamp: number;
}

function parseLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function extractDepartment(govResponse: string): string {
  const deptPatterns: [RegExp, string][] = [
    [/\bSkills England\b/i, 'Skills England'],
    [/\bDfE\b/i, 'DfE'],
    [/\bDBT\b/i, 'DBT'],
    [/\bDHSC\b/i, 'DHSC'],
    [/\bDWP\b/i, 'DWP'],
    [/\bHMT\b/i, 'HMT'],
    [/\bTreasury\b/i, 'HMT'],
    [/\bCabinet Office\b/i, 'Cabinet Office'],
    [/\bHome Office\b/i, 'Home Office'],
    [/\bFCDO\b/i, 'FCDO'],
    [/\bMHCLG\b/i, 'MHCLG'],
    [/\bDCMS\b/i, 'DCMS'],
    [/\bIPO\b/i, 'IPO'],
    [/\bDSIT\b/i, 'DSIT'],
  ];
  
  for (const [pattern, name] of deptPatterns) {
    if (pattern.test(govResponse)) {
      return name;
    }
  }
  return 'DSIT';
}

function deriveStatusFromProgress(progressText: string, timeline: string): Status {
  const text = progressText.trim().toLowerCase();
  
  // Empty or just restating commitment = NOT_STARTED
  if (!text || text.length < 20) {
    return Status.NOT_STARTED;
  }
  
  // Check for delayed indicators first
  const delayedIndicators = [
    'no public announcement',
    'not yet published',
    'was expected',
    'expected in summer',
    'expected in spring',
    'haven\'t been announced',
    'not yet',
    'no further updates',
    'wider appointments not yet'
  ];
  
  for (const indicator of delayedIndicators) {
    if (text.includes(indicator)) {
      return Status.DELAYED;
    }
  }
  
  // Check for COMPLETED indicators - strong completion language
  const completedIndicators = [
    'has been completed',
    'fully operational',
    'fully delivered',
    'implementation complete',
    'successfully completed',
    'now complete',
    'is complete'
  ];
  
  for (const indicator of completedIndicators) {
    if (text.includes(indicator)) {
      return Status.COMPLETED;
    }
  }
  
  // Check for not started indicators (just restating future plans)
  const notStartedIndicators = [
    'will work with',
    'to appoint',
    'to engage',
    'scoping options',
    'will publish'
  ];
  
  // If text is short and contains future tense only
  if (text.length < 80) {
    for (const indicator of notStartedIndicators) {
      if (text.includes(indicator) && !text.includes('launched') && !text.includes('published') && !text.includes('announced')) {
        return Status.NOT_STARTED;
      }
    }
  }
  
  // Check for on track indicators
  const onTrackIndicators = [
    'published',
    'launched',
    'announced',
    'went live',
    'is live',
    'is operating',
    'opened',
    'established',
    'selected',
    'running',
    'delivered'
  ];
  
  for (const indicator of onTrackIndicators) {
    if (text.includes(indicator)) {
      return Status.ON_TRACK;
    }
  }
  
  return Status.ON_TRACK;
}

function parseCSV(csv: string): Recommendation[] {
  const lines = csv.trim().split('\n');
  
  // Find the header row (contains 'Action')
  let headerIndex = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].toLowerCase().includes('action')) {
      headerIndex = i;
      break;
    }
  }
  
  const headers = parseLine(lines[headerIndex]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
  
  return lines.slice(headerIndex + 1).map((line, index): Recommendation | null => {
    const values = parseLine(line);
    
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    
    // Map from Google Sheet columns:
    // # | Action | Government response | Govt's stated delivery timeline | Last update | Status (progress report)
    const action = obj['action'] || '';
    const govResponse = obj['government_response'] || '';
    const timeline = obj['govts_stated_delivery_timeline'] || '';
    const lastUpdate = obj['last_update'] || '';
    const progressReport = obj['status'] || ''; // Column 6 is the actual status/progress report
    
    if (!action) return null;
    
    // Use row index + 1 as the recommendation number
    const numId = index + 1;
    const recId = `R${String(numId).padStart(2, '0')}`;
    
    // Derive status from analyzing the progress report text
    const status = deriveStatusFromProgress(progressReport, timeline);
    
    // Extract department from government response
    const department = extractDepartment(govResponse);
    
    // Derive chapter from recommendation number
    let chapter = '';
    if (numId >= 1 && numId <= 6) chapter = '1. Compute & Infrastructure';
    else if (numId >= 7 && numId <= 13) chapter = '2. Data Availability';
    else if (numId >= 14 && numId <= 22) chapter = '3. Talent & Skills';
    else if (numId >= 23 && numId <= 30) chapter = '4. Safety & Regulation';
    else if (numId >= 31 && numId <= 49) chapter = '5. Public Sector Adoption';
    else if (numId >= 50) chapter = '6. Sovereign AI';
    
    return {
      id: recId,
      chapter,
      title: action.length > 100 ? action.substring(0, 100) + '...' : action,
      description: action,
      department,
      status,
      deliveryTimeline: timeline,
      govResponse: govResponse,
      progress: progressReport || 'No update available',
      lastUpdate: lastUpdate || 'N/A'
    };
  }).filter((item): item is Recommendation => item !== null && item.title.length > 0);
}

function getCache(): Recommendation[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp }: CacheData = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    
    return data;
  } catch {
    return null;
  }
}

function setCache(data: Recommendation[]): void {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // localStorage full or unavailable
  }
}

export async function fetchData(): Promise<Recommendation[]> {
  const cached = getCache();
  if (cached) {
    return cached;
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(SHEETS_URL, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const csv = await response.text();
    const data = parseCSV(csv);
    const enriched = applySourceMetadata(data);

    if (enriched.length > 0) {
      setCache(enriched);
      return enriched;
    }
    
    throw new Error('No data parsed');
  } catch (error) {
    console.warn('Using fallback data:', error instanceof Error ? error.message : 'Unknown error');
    return applySourceMetadata(RECOMMENDATIONS);
  }
}

export function refreshData(): Promise<Recommendation[]> {
  localStorage.removeItem(CACHE_KEY);
  return fetchData();
}
