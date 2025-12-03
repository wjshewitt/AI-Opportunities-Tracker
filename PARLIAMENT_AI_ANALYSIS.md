# Parliament AI Mentions Analysis System

## Overview

A comprehensive system to fetch, process, and analyze **all mentions of AI in UK Parliament** since November 2022. This captures thousands of speeches mentioning "AI" or "Artificial Intelligence", extracts relevant context, and performs sentiment analysis.

---

## Data Sources

### Hansard API
- **Endpoint**: `https://hansard-api.parliament.uk/search.json`
- **Documentation**: [hansard-api.parliament.uk/swagger](https://hansard-api.parliament.uk/swagger/ui/index)
- **Rate Limits**: Pagination with 20 items per page, respectful delays between requests

### Members API
- **Endpoint**: `https://members-api.parliament.uk/api/Members/{id}`
- **Purpose**: Fetch party affiliation and member details

---

## Search Parameters

| Parameter | Value |
|-----------|-------|
| Search Terms | `"AI"`, `"Artificial Intelligence"` |
| Start Date | 2022-11-01 |
| End Date | Present |
| Houses | Commons & Lords |

---

## Data Schema

### `parliamentAIMentions` Table

```typescript
{
  contributionExtId: string;      // Unique ID from Hansard
  memberId: number;               // Parliament member ID
  memberName: string;             // Speaker's name
  party: {                        // Political party
    name: string;
    abbreviation: string;
    colour: string;
  };
  date: string;                   // YYYY-MM-DD format
  house: string;                  // "Commons" or "Lords"
  debateTitle: string;            // Name of the debate
  debateExtId: string;            // Debate unique ID
  contextText: string;            // ~80-100 words around mention
  mentionType: string;            // "AI" or "Artificial Intelligence"
  sentiment?: string;             // "positive" | "neutral" | "negative"
  sentimentConfidence?: number;   // 0-1 confidence score
  sentimentReasoning?: string;    // Brief explanation
  processedAt?: number;           // Timestamp of sentiment analysis
}
```

### Indexes
- `by_date` - Query mentions by date
- `by_member` - Query by speaker
- `by_sentiment` - Filter by sentiment
- `by_house` - Filter Commons vs Lords

---

## Text Extraction Algorithm

For each contribution mentioning AI:

1. Find all occurrences of "AI" or "Artificial Intelligence" in the text
2. Extract ~40-50 words **before** the mention
3. Extract ~40-50 words **after** the mention
4. Combine into a single context extract (~80-100 words)
5. If multiple mentions exist, use the first occurrence

```typescript
function extractContext(text: string, searchTerm: string, wordsBefore = 45, wordsAfter = 45): string {
  const regex = new RegExp(searchTerm, 'gi');
  const match = regex.exec(text);
  if (!match) return text.slice(0, 200);
  
  const words = text.split(/\s+/);
  const position = text.slice(0, match.index).split(/\s+/).length;
  
  const start = Math.max(0, position - wordsBefore);
  const end = Math.min(words.length, position + wordsAfter);
  
  return words.slice(start, end).join(' ');
}
```

---

## Sentiment Analysis

### Methodology

Each extract is analyzed by Claude to determine the speaker's stance toward AI:

| Sentiment | Criteria |
|-----------|----------|
| **Positive** | Supportive, optimistic, welcoming, praising AI initiatives |
| **Neutral** | Informational, procedural, balanced discussion, questioning |
| **Negative** | Concerned, critical, opposing, highlighting risks/failures |

### Prompt Template

```
Analyze this UK Parliament speech extract about AI.
Context: [SPEAKER_NAME] ([PARTY]) speaking in [HOUSE] on [DATE] during "[DEBATE_TITLE]"

Text: "[CONTEXT_TEXT]"

Determine if the speaker's stance toward AI is:
- positive (supportive, optimistic, welcoming)
- neutral (informational, procedural, balanced)  
- negative (concerned, critical, opposing)

Respond with JSON: { "sentiment": "...", "confidence": 0.X, "reasoning": "..." }
```

### Parallel Processing

To handle thousands of mentions efficiently:

1. Export data in batches of 100-200 mentions
2. Spawn multiple Droid subagents
3. Each subagent processes one batch
4. Results merged back into Convex database

```
Batch 1 (mentions 1-200)    → Droid 1 → sentiment_batch_1.json
Batch 2 (mentions 201-400)  → Droid 2 → sentiment_batch_2.json
Batch 3 (mentions 401-600)  → Droid 3 → sentiment_batch_3.json
...
Final merge → Convex database
```

---

## Implementation Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema definition |
| `convex/parliamentAI.ts` | Data fetching and storage actions |
| `convex/parliamentAIQueries.ts` | Query functions for UI |
| `parliament_ai_raw.json` | Raw fetched data (temporary) |
| `parliament_ai_batches/` | Sentiment analysis batch files |

---

## API Batching Strategy

```
Phase 1: Initial Fetch
├── Search "AI" with pagination (skip 0, 20, 40...)
├── Search "Artificial Intelligence" with pagination
├── Deduplicate by ContributionExtId
├── Extract context for each mention
└── Store raw data (~3000-5000 records)

Phase 2: Enrichment  
├── Batch member IDs (groups of 10)
├── Fetch party info from Members API
├── 200ms delay between batches
└── Update records with party data

Phase 3: Sentiment Analysis
├── Export to JSON batches (100-200 each)
├── Parallel Droid processing
├── Merge results
└── Update Convex with sentiment
```

---

## Actual Volume (After Filtering)

| Metric | Value |
|--------|-------|
| Raw API results | ~4,400 |
| After standalone filter | **3,901** |
| Date range | Nov 2022 - Dec 2025 |
| Commons | 1,940 |
| Lords | 1,961 |

### Key Fixes Applied
1. **ContributionTextFull**: API returns truncated (255 char) and full text - we use full text
2. **Pagination**: API distributes `take` across all result types - we skip by actual contribution count, not PAGE_SIZE

### Party Breakdown
| Party | Mentions |
|-------|----------|
| Labour | 1,455 |
| Conservative | 1,387 |
| Liberal Democrat | 376 |
| Crossbench | 353 |
| Labour (Co-op) | 87 |
| SNP | 87 |

### Top Speakers
| Speaker | Party | Mentions |
|---------|-------|----------|
| Lord Clement-Jones | Liberal Democrat | 118 |
| Viscount Camrose | Conservative | 116 |
| Lord Vallance of Balham | Labour | 102 |
| Chris Bryant | Labour | 73 |
| Baroness Jones of Whitchurch | Labour | 71 |

### Filtering Applied
The Hansard API returns many false positives where "AI" appears as a substring:
- "det**ai**led" → filtered out
- "Brit**ai**n" → filtered out  
- "m**ai**den" → filtered out
- "ch**ai**r" → filtered out

Only standalone "AI", "A.I.", or "Artificial Intelligence" mentions are kept.

---

## Statistics & Analytics

Once data is collected and analyzed, we can generate:

### By Time
- Mentions per month/quarter
- Sentiment trends over time
- Peak discussion periods

### By Party
- Total mentions by party
- Sentiment breakdown by party
- Most active speakers per party

### By House
- Commons vs Lords comparison
- Sentiment differences between houses

### By Topic
- Debate categories (healthcare, jobs, regulation, etc.)
- Topic-specific sentiment analysis

---

## URLs & References

- **Hansard Search**: `https://hansard.parliament.uk/search/Contributions?contributionExtId={id}`
- **Debate Page**: `https://hansard.parliament.uk/{house}/{date}/debates/{debateExtId}`
- **Member Profile**: `https://members.parliament.uk/member/{memberId}`

---

## Progress Tracking

- [ ] Phase 1: Schema creation
- [ ] Phase 2: Data collection infrastructure
- [ ] Phase 3: Initial data fetch
- [ ] Phase 4: Member enrichment
- [ ] Phase 5: Sentiment analysis batches
- [ ] Phase 6: Results merge
- [ ] Phase 7: Statistics generation
- [ ] Phase 8: UI integration

---

## Related Files

- `hansardApi.ts` - Existing AI Action Plan tracking
- `sentimentData.ts` - Manual sentiment classifications
- `enhanced_sentiment_analysis.py` - Sentiment verification scripts

---

*Last updated: December 2024*
