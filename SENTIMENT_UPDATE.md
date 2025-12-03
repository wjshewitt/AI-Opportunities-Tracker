# Sentiment Analysis Update Guide

This document describes how to update sentiment analysis for new Parliamentary contributions.

## Overview

Sentiment analysis is stored in `sentimentData.ts` as a static mapping of `ContributionExtId` -> `Sentiment`.

### Methodology

**Analyze the ~40 words before and after the mention of "AI Opportunities Action Plan"** to determine sentiment toward the plan specifically, not overall speech tone.

Each contribution is classified as:
- **positive**: Supporting, praising, welcoming the AI plan
- **neutral**: Procedural, informational, questioning, balanced discussion
- **negative**: Criticizing, opposing, highlighting failures or concerns about the plan

## Update Process

### 1. Fetch New Contributions

Run this command to get a list of contributions:

```bash
curl -s 'https://hansard-api.parliament.uk/search.json?queryParameters.searchTerm=%22AI%20Opportunities%20Action%20Plan%22&queryParameters.startDate=2025-01-01&queryParameters.take=100&queryParameters.orderBy=SittingDateDesc' | python3 -c "
import json,sys
d=json.load(sys.stdin)
for c in d['Contributions']:
    ext_id = c.get('ContributionExtId', '')
    text = (c.get('ContributionText', '') or '')[:300]
    print(f'{c[\"MemberName\"]} ({c[\"SittingDate\"][:10]})')
    print(f'ID: {ext_id}')
    print(f'Text: {text}...')
    print()
"
```

### 2. Review Each Contribution

For each new contribution not already in `sentimentData.ts`:

1. Read the full text (visit Hansard website if needed)
2. Determine sentiment based on:
   - **Positive indicators**: "welcome", "support", "excellent", "opportunity", "progress", ministerial endorsement
   - **Neutral indicators**: Questions, procedural statements, balanced discussion, information sharing
   - **Negative indicators**: "concern", "worried", "criticize", "oppose", "fail", "inadequate"

### 3. Update sentimentData.ts

Add new entries to the `sentimentMap` object:

```typescript
// MemberName - Date - Brief reason
"CONTRIBUTION-EXT-ID": "positive",  // or "neutral" or "negative"
```

### 4. Test Locally

```bash
npm run dev
```

Visit the Parliament page and verify:
- New contributions appear
- Sentiment icons display correctly
- Stats update properly

### 5. Deploy

```bash
npm run build
# Deploy as appropriate
```

## Sentiment Guidelines

### Positive
- Government ministers promoting/defending the plan
- Members explicitly praising or welcoming the plan
- Enthusiasm about AI opportunities
- Support for specific recommendations

### Neutral
- Parliamentary questions seeking information
- Procedural statements
- Balanced discussion of pros and cons
- Technical/informational responses
- Amendments and detailed scrutiny

### Negative
- Criticism of the plan or its implementation
- Concerns about specific aspects
- Opposition to recommendations
- Highlighting failures or inadequacies

## Last Updated

- **Date**: 2025-12-03
- **Total Contributions Analyzed**: 84
- **Breakdown**: 43 Positive, 37 Neutral, 4 Negative

### Notable Negative Examples
- **Alan Mak** (Opposition, 2025-01-13, 2025-02-12): Opposition criticism of government approach
- **Dr Ben Spencer**: "Why are the Government ignoring the advice..."
- **Christine Jardine**: Concerns about exascale computer cancellation not addressed in the plan
