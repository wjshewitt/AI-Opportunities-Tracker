import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ActionCache } from "@convex-dev/action-cache";
import { components } from "./_generated/api";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

const hansardCache = new ActionCache(components.actionCache, {
  action: internal.hansard.fetchHansardFromAPI,
  name: "hansardMentions",
  ttl: TWO_DAYS_MS,
});

export interface MemberParty {
  id: number;
  name: string;
  abbreviation: string;
  backgroundColour: string;
}

export interface HansardContribution {
  MemberName: string;
  MemberId: number;
  AttributedTo: string;
  ContributionText: string;
  ContributionTextFull?: string;
  DebateSection: string;
  DebateSectionExtId: string;
  ContributionExtId?: string;
  SittingDate: string;
  Section: string;
  House: string;
  Party?: MemberParty;
}

export interface HansardDebate {
  DebateSection: string;
  SittingDate: string;
  House: string;
  Title: string;
  DebateSectionExtId: string;
}

export interface HansardResponse {
  TotalContributions: number;
  TotalDebates: number;
  TotalWrittenStatements: number;
  Contributions: HansardContribution[];
  Debates: HansardDebate[];
}

// Fetch member party information from UK Parliament Members API
async function fetchMemberParty(memberId: number): Promise<MemberParty | null> {
  try {
    const url = `https://members-api.parliament.uk/api/Members/${memberId}`;
    console.log(`Fetching member ${memberId} from ${url}`);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      console.log(`Members API returned ${response.status} for member ${memberId}`);
      return null;
    }
    const data = await response.json();
    console.log(`Member ${memberId} response:`, JSON.stringify(data.value?.latestParty));
    const party = data.value?.latestParty;
    if (party) {
      // API returns colour without # prefix
      const colour = party.backgroundColour ? `#${party.backgroundColour}` : '#888888';
      return {
        id: party.id,
        name: party.name,
        abbreviation: party.abbreviation || party.name.substring(0, 3),
        backgroundColour: colour,
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch party for member ${memberId}:`, error);
    return null;
  }
}

// Fetch party info for multiple members in batches
async function fetchMemberParties(memberIds: number[]): Promise<Map<number, MemberParty | null>> {
  const results = new Map<number, MemberParty | null>();
  const batchSize = 5;
  
  for (let i = 0; i < memberIds.length; i += batchSize) {
    const batch = memberIds.slice(i, i + batchSize);
    const promises = batch.map(id => fetchMemberParty(id).then(party => ({ id, party })));
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, party }) => results.set(id, party));
    
    // Small delay between batches to be respectful to the API
    if (i + batchSize < memberIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Fetched party info for ${results.size} members`);
  return results;
}

// Fetch all pages for a single search term
async function fetchAllForTerm(searchTerm: string): Promise<{ contributions: HansardContribution[], debates: HansardDebate[], total: number }> {
  const encodedTerm = encodeURIComponent(`"${searchTerm}"`);
  const pageSize = 20;
  const contributions: HansardContribution[] = [];
  const debates: HansardDebate[] = [];
  let total = 0;
  
  let skip = 0;
  let hasMore = true;
  
  while (hasMore && skip < 500) {
    const url = `https://hansard-api.parliament.uk/search.json?queryParameters.searchTerm=${encodedTerm}&queryParameters.startDate=2025-01-01&queryParameters.take=${pageSize}&queryParameters.skip=${skip}&queryParameters.orderBy=SittingDateDesc`;
    
    console.log(`[${searchTerm}] Fetching with skip=${skip}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Hansard API error: ${response.status}`);
      break;
    }
    
    const data: HansardResponse = await response.json();
    
    if (skip === 0) {
      total = data.TotalContributions;
    }
    
    console.log(`[${searchTerm}] Page returned ${data.Contributions.length} contributions`);
    
    if (data.Contributions.length === 0) {
      hasMore = false;
    } else {
      contributions.push(...data.Contributions);
      debates.push(...data.Debates);
      skip = contributions.length;
      
      if (contributions.length >= total) {
        hasMore = false;
      }
    }
  }
  
  return { contributions, debates, total };
}

// Internal action that actually fetches from Hansard API with pagination
export const fetchHansardFromAPI = internalAction({
  args: {},
  handler: async (): Promise<HansardResponse> => {
    const searchTerms = [
      "AI Opportunities Action Plan",
      "AI Opportunities Plan",
      "AI Action Plan",
      "AI Plan"
    ];

    try {
      const allContributions: HansardContribution[] = [];
      const allDebates: HansardDebate[] = [];
      const seenContributionIds = new Set<string>();
      
      for (const term of searchTerms) {
        const result = await fetchAllForTerm(term);
        console.log(`[${term}] Total fetched: ${result.contributions.length} of ${result.total}`);
        
        // Deduplicate by ContributionExtId
        for (const c of result.contributions) {
          const id = c.ContributionExtId || `${c.DebateSectionExtId}-${c.MemberId}-${c.SittingDate}`;
          if (!seenContributionIds.has(id)) {
            seenContributionIds.add(id);
            allContributions.push(c);
          }
        }
        
        for (const d of result.debates) {
          if (!allDebates.some(existing => existing.DebateSectionExtId === d.DebateSectionExtId)) {
            allDebates.push(d);
          }
        }
      }
      
      // Sort by date descending
      allContributions.sort((a, b) => new Date(b.SittingDate).getTime() - new Date(a.SittingDate).getTime());
      
      console.log(`Total unique contributions: ${allContributions.length}`);
      
      // Fetch party information for all unique members
      const uniqueMemberIds = [...new Set(allContributions.map(c => c.MemberId))];
      console.log(`Fetching party info for ${uniqueMemberIds.length} unique members...`);
      const memberParties = await fetchMemberParties(uniqueMemberIds);
      
      // Enrich contributions with party data
      allContributions.forEach(c => {
        const party = memberParties.get(c.MemberId);
        if (party) {
          c.Party = party;
        }
      });
      
      return {
        TotalContributions: allContributions.length,
        TotalDebates: allDebates.length,
        TotalWrittenStatements: 0,
        Contributions: allContributions,
        Debates: allDebates,
      };
    } catch (error) {
      console.error("Failed to fetch from Hansard API:", error);
      return {
        TotalContributions: 0,
        TotalDebates: 0,
        TotalWrittenStatements: 0,
        Contributions: [],
        Debates: [],
      };
    }
  },
});

// Public action - returns cached data or fetches fresh
export const getHansardMentions = action({
  args: {},
  handler: async (ctx): Promise<HansardResponse> => {
    return await hansardCache.fetch(ctx, {});
  },
});

// Force refresh - bypass cache and fetch fresh data
export const refreshHansardMentions = action({
  args: {},
  handler: async (ctx): Promise<HansardResponse> => {
    return await hansardCache.fetch(ctx, {}, { force: true });
  },
});
