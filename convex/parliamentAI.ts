import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const START_DATE = "2022-11-01";
const PAGE_SIZE = 20;
const MAX_PAGES_PER_RUN = 100; // Process ~400 contributions per run (API returns ~4 per page)

interface MemberParty {
  id: number;
  name: string;
  abbreviation: string;
  backgroundColour: string;
}

interface HansardContribution {
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
}

interface HansardResponse {
  TotalContributions: number;
  Contributions: HansardContribution[];
}

// Extract ~40-50 words before and after an AI mention
function extractContext(text: string, searchTerm: string, wordsBefore = 45, wordsAfter = 45): string {
  // Clean HTML tags
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  const regex = new RegExp(searchTerm, 'gi');
  const match = regex.exec(cleanText);
  
  if (!match) {
    return cleanText.slice(0, 300);
  }
  
  // Split into words and find position
  const beforeText = cleanText.slice(0, match.index);
  const afterText = cleanText.slice(match.index + match[0].length);
  
  const wordsBefore_ = beforeText.split(/\s+/).filter(w => w.length > 0);
  const wordsAfter_ = afterText.split(/\s+/).filter(w => w.length > 0);
  
  const contextBefore = wordsBefore_.slice(-wordsBefore).join(' ');
  const contextAfter = wordsAfter_.slice(0, wordsAfter).join(' ');
  
  return `${contextBefore} ${match[0]} ${contextAfter}`.trim();
}

// Check if text contains genuine AI mention (not part of another word like "detail", "Britain")
function hasStandaloneAIMention(text: string): boolean {
  // Always accept "Artificial Intelligence" - unambiguous
  if (/artificial\s*intelligence/i.test(text)) {
    return true;
  }
  
  // Check for standalone AI - must be surrounded by non-letter characters
  // Matches: " AI ", "AI,", "AI.", "(AI)", "AI-", "-AI", etc.
  if (/(?:^|[^a-zA-Z])AI(?:[^a-zA-Z]|$)/.test(text)) {
    return true;
  }
  
  // Check for A.I. notation
  if (/A\.I\./i.test(text)) {
    return true;
  }
  
  return false;
}

// Determine which search term matched
function detectMentionType(text: string): string {
  const cleanText = text.toLowerCase();
  if (cleanText.includes('artificial intelligence')) {
    return 'Artificial Intelligence';
  }
  return 'AI';
}

// Fetch member party information
async function fetchMemberParty(memberId: number): Promise<MemberParty | null> {
  try {
    const response = await fetch(`https://members-api.parliament.uk/api/Members/${memberId}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    const party = data.value?.latestParty;
    if (party) {
      return {
        id: party.id,
        name: party.name,
        abbreviation: party.abbreviation || party.name.substring(0, 3),
        backgroundColour: party.backgroundColour ? `#${party.backgroundColour}` : '#888888',
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Batch fetch party info for multiple members
async function fetchMemberParties(memberIds: number[]): Promise<Map<number, MemberParty | null>> {
  const results = new Map<number, MemberParty | null>();
  const batchSize = 10;
  
  for (let i = 0; i < memberIds.length; i += batchSize) {
    const batch = memberIds.slice(i, i + batchSize);
    const promises = batch.map(id => fetchMemberParty(id).then(party => ({ id, party })));
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, party }) => results.set(id, party));
    
    if (i + batchSize < memberIds.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

// Store a batch of mentions
export const storeMentions = internalMutation({
  args: {
    mentions: v.array(v.object({
      contributionExtId: v.string(),
      memberId: v.number(),
      memberName: v.string(),
      party: v.optional(v.object({
        name: v.string(),
        abbreviation: v.string(),
        colour: v.string(),
      })),
      date: v.string(),
      house: v.string(),
      debateTitle: v.string(),
      debateExtId: v.string(),
      contextText: v.string(),
      mentionType: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    for (const mention of args.mentions) {
      // Check if already exists
      const existing = await ctx.db
        .query("parliamentAIMentions")
        .withIndex("by_contribution", q => q.eq("contributionExtId", mention.contributionExtId))
        .first();
      
      if (!existing) {
        await ctx.db.insert("parliamentAIMentions", mention);
      }
    }
  },
});

// Update or create fetch progress
export const updateFetchProgress = internalMutation({
  args: {
    searchTerm: v.string(),
    lastSkip: v.number(),
    totalFound: v.number(),
    fetchedCount: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("parliamentAIFetchProgress")
      .withIndex("by_term", q => q.eq("searchTerm", args.searchTerm))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSkip: args.lastSkip,
        totalFound: args.totalFound,
        fetchedCount: args.fetchedCount,
        completed: args.completed,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("parliamentAIFetchProgress", {
        searchTerm: args.searchTerm,
        lastSkip: args.lastSkip,
        totalFound: args.totalFound,
        fetchedCount: args.fetchedCount,
        completed: args.completed,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Get fetch progress for a term
export const getFetchProgress = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("parliamentAIFetchProgress")
      .withIndex("by_term", q => q.eq("searchTerm", args.searchTerm))
      .first();
  },
});

// Fetch a batch of contributions for a search term
export const fetchBatchForTerm = internalAction({
  args: {
    searchTerm: v.string(),
    skip: v.number(),
  },
  handler: async (ctx, args): Promise<{ done: boolean; nextSkip: number; total: number; fetched: number }> => {
    const { searchTerm, skip } = args;
    const encodedTerm = encodeURIComponent(`"${searchTerm}"`);
    
    let currentSkip = skip;
    let totalContributions = 0;
    let fetchedThisRun = 0;
    const allMentions: Array<{
      contributionExtId: string;
      memberId: number;
      memberName: string;
      date: string;
      house: string;
      debateTitle: string;
      debateExtId: string;
      contextText: string;
      mentionType: string;
    }> = [];
    const memberIds = new Set<number>();
    
    for (let page = 0; page < MAX_PAGES_PER_RUN; page++) {
      const url = `https://hansard-api.parliament.uk/search.json?queryParameters.searchTerm=${encodedTerm}&queryParameters.startDate=${START_DATE}&queryParameters.take=${PAGE_SIZE}&queryParameters.skip=${currentSkip}&queryParameters.orderBy=SittingDateDesc`;
      
      console.log(`[${searchTerm}] Fetching skip=${currentSkip}...`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        break;
      }
      
      const data: HansardResponse = await response.json();
      
      // Always update totalContributions from the API response
      if (data.TotalContributions) {
        totalContributions = data.TotalContributions;
      }
      if (page === 0 && currentSkip === 0) {
        console.log(`[${searchTerm}] Total available: ${totalContributions}`);
      }
      
      if (!data.Contributions || data.Contributions.length === 0) {
        // No more data
        await ctx.runMutation(internal.parliamentAI.updateFetchProgress, {
          searchTerm,
          lastSkip: currentSkip,
          totalFound: totalContributions,
          fetchedCount: currentSkip + fetchedThisRun,
          completed: true,
        });
        
        return { done: true, nextSkip: currentSkip, total: totalContributions, fetched: fetchedThisRun };
      }
      
      // Process contributions - filter for standalone AI mentions only
      // Use ContributionTextFull if available (full text), otherwise fall back to ContributionText (truncated)
      for (const contrib of data.Contributions) {
        const fullText = contrib.ContributionTextFull || contrib.ContributionText;
        const contextText = extractContext(fullText, searchTerm);
        
        // Skip if no standalone AI mention (filters out "maiden", "Britain", etc.)
        if (!hasStandaloneAIMention(contextText) && !hasStandaloneAIMention(fullText)) {
          continue;
        }
        
        const extId = contrib.ContributionExtId || `${contrib.DebateSectionExtId}-${contrib.MemberId}-${contrib.SittingDate}`;
        
        allMentions.push({
          contributionExtId: extId,
          memberId: contrib.MemberId,
          memberName: contrib.MemberName,
          date: contrib.SittingDate.split('T')[0],
          house: contrib.House,
          debateTitle: contrib.DebateSection,
          debateExtId: contrib.DebateSectionExtId,
          contextText,
          mentionType: detectMentionType(fullText),
        });
        
        memberIds.add(contrib.MemberId);
      }
      
      fetchedThisRun += data.Contributions.length;
      currentSkip += data.Contributions.length;  // Skip by actual count, not PAGE_SIZE
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if we've fetched everything
      if (currentSkip >= totalContributions) {
        break;
      }
    }
    
    // Fetch party info for all members in this batch
    console.log(`Fetching party info for ${memberIds.size} members...`);
    const partyMap = await fetchMemberParties([...memberIds]);
    
    // Enrich mentions with party data
    const enrichedMentions = allMentions.map(m => ({
      ...m,
      party: partyMap.get(m.memberId) ? {
        name: partyMap.get(m.memberId)!.name,
        abbreviation: partyMap.get(m.memberId)!.abbreviation,
        colour: partyMap.get(m.memberId)!.backgroundColour,
      } : undefined,
    }));
    
    // Store mentions in batches
    const STORE_BATCH_SIZE = 50;
    for (let i = 0; i < enrichedMentions.length; i += STORE_BATCH_SIZE) {
      const batch = enrichedMentions.slice(i, i + STORE_BATCH_SIZE);
      await ctx.runMutation(internal.parliamentAI.storeMentions, { mentions: batch });
    }
    
    // Update progress
    const done = currentSkip >= totalContributions;
    await ctx.runMutation(internal.parliamentAI.updateFetchProgress, {
      searchTerm,
      lastSkip: currentSkip,
      totalFound: totalContributions,
      fetchedCount: currentSkip,
      completed: done,
    });
    
    console.log(`[${searchTerm}] Stored ${fetchedThisRun} mentions. Progress: ${currentSkip}/${totalContributions}`);
    
    return { done, nextSkip: currentSkip, total: totalContributions, fetched: fetchedThisRun };
  },
});

// Main action to start/continue fetching all AI mentions
export const fetchAllAIMentions = action({
  args: {},
  handler: async (ctx) => {
    const searchTerms = ["AI", "Artificial Intelligence"];
    const results: Record<string, { total: number; fetched: number; done: boolean }> = {};
    
    for (const term of searchTerms) {
      // Get current progress
      const progress = await ctx.runQuery(internal.parliamentAI.getFetchProgressInternal, { searchTerm: term });
      const startSkip = progress?.completed ? 0 : (progress?.lastSkip || 0);
      
      if (progress?.completed) {
        console.log(`[${term}] Already completed. Skipping.`);
        results[term] = { total: progress.totalFound, fetched: progress.fetchedCount, done: true };
        continue;
      }
      
      const result = await ctx.runAction(internal.parliamentAI.fetchBatchForTerm, {
        searchTerm: term,
        skip: startSkip,
      });
      
      results[term] = { total: result.total, fetched: result.fetched, done: result.done };
    }
    
    return results;
  },
});

// Internal query for progress (used by actions)
export const getFetchProgressInternal = internalQuery({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("parliamentAIFetchProgress")
      .withIndex("by_term", q => q.eq("searchTerm", args.searchTerm))
      .first();
  },
});

// Reset progress to re-fetch
export const resetFetchProgress = mutation({
  args: { searchTerm: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.searchTerm) {
      const term = args.searchTerm;
      const progress = await ctx.db
        .query("parliamentAIFetchProgress")
        .withIndex("by_term", q => q.eq("searchTerm", term))
        .first();
      if (progress) {
        await ctx.db.delete(progress._id);
      }
    } else {
      // Reset all
      const all = await ctx.db.query("parliamentAIFetchProgress").collect();
      for (const p of all) {
        await ctx.db.delete(p._id);
      }
    }
  },
});

// Query all mentions
export const getAllMentions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("parliamentAIMentions").order("desc");
    if (args.limit) {
      return await q.take(args.limit);
    }
    return await q.collect();
  },
});

// Get unanalyzed mentions for sentiment processing
export const getUnanalyzedMentions = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("parliamentAIMentions").collect();
    const unanalyzed = all.filter(m => !m.sentiment);
    const start = args.offset || 0;
    const end = args.limit ? start + args.limit : unanalyzed.length;
    return unanalyzed.slice(start, end);
  },
});

// Update sentiment for a mention
export const updateSentiment = mutation({
  args: {
    contributionExtId: v.string(),
    sentiment: v.string(),
    sentimentConfidence: v.number(),
    sentimentReasoning: v.string(),
  },
  handler: async (ctx, args) => {
    const mention = await ctx.db
      .query("parliamentAIMentions")
      .withIndex("by_contribution", q => q.eq("contributionExtId", args.contributionExtId))
      .first();
    
    if (mention) {
      await ctx.db.patch(mention._id, {
        sentiment: args.sentiment,
        sentimentConfidence: args.sentimentConfidence,
        sentimentReasoning: args.sentimentReasoning,
        processedAt: Date.now(),
      });
      return true;
    }
    return false;
  },
});

// Batch update sentiments
export const batchUpdateSentiments = mutation({
  args: {
    updates: v.array(v.object({
      contributionExtId: v.string(),
      sentiment: v.string(),
      sentimentConfidence: v.number(),
      sentimentReasoning: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    let updated = 0;
    for (const update of args.updates) {
      const mention = await ctx.db
        .query("parliamentAIMentions")
        .withIndex("by_contribution", q => q.eq("contributionExtId", update.contributionExtId))
        .first();
      
      if (mention) {
        await ctx.db.patch(mention._id, {
          sentiment: update.sentiment,
          sentimentConfidence: update.sentimentConfidence,
          sentimentReasoning: update.sentimentReasoning,
          processedAt: Date.now(),
        });
        updated++;
      }
    }
    return { updated };
  },
});

// Delete mentions by contribution IDs (for cleaning up false positives)
export const deleteMentionsByIds = mutation({
  args: {
    contributionExtIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    let deleted = 0;
    for (const extId of args.contributionExtIds) {
      const mention = await ctx.db
        .query("parliamentAIMentions")
        .withIndex("by_contribution", q => q.eq("contributionExtId", extId))
        .first();
      if (mention) {
        await ctx.db.delete(mention._id);
        deleted++;
      }
    }
    return { deleted };
  },
});

// Filter and delete non-standalone AI mentions from existing data
export const cleanupFalsePositives = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("parliamentAIMentions").collect();
    
    let deleted = 0;
    for (const m of all) {
      if (!hasStandaloneAIMention(m.contextText)) {
        await ctx.db.delete(m._id);
        deleted++;
      }
    }
    return { deleted, remaining: all.length - deleted };
  },
});

// Get mentions count
export const getMentionsCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("parliamentAIMentions").collect();
    return all.length;
  },
});

// Get statistics
export const getStatistics = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("parliamentAIMentions").collect();
    
    const byParty: Record<string, number> = {};
    const byHouse: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    const topSpeakers: Record<string, { count: number; name: string; party?: string }> = {};
    
    for (const m of all) {
      // By party
      const partyName = m.party?.name || 'Unknown';
      byParty[partyName] = (byParty[partyName] || 0) + 1;
      
      // By house
      byHouse[m.house] = (byHouse[m.house] || 0) + 1;
      
      // By sentiment
      const sentiment = m.sentiment || 'unanalyzed';
      bySentiment[sentiment] = (bySentiment[sentiment] || 0) + 1;
      
      // By month
      const month = m.date.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
      
      // Top speakers
      const speakerId = String(m.memberId);
      if (!topSpeakers[speakerId]) {
        topSpeakers[speakerId] = { count: 0, name: m.memberName, party: m.party?.name };
      }
      topSpeakers[speakerId].count++;
    }
    
    // Sort top speakers
    const sortedSpeakers = Object.entries(topSpeakers)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([id, data]) => ({ memberId: id, ...data }));
    
    return {
      total: all.length,
      byParty,
      byHouse,
      bySentiment,
      byMonth,
      topSpeakers: sortedSpeakers,
    };
  },
});

// Delete all mentions (for re-fetching with updated logic)
export const deleteAllMentions = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("parliamentAIMentions").collect();
    for (const m of all) {
      await ctx.db.delete(m._id);
    }
    return { deleted: all.length };
  },
});
