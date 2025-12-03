# Sentiment Analysis Instructions

You are analyzing UK Parliament speeches mentioning AI.

## Your Task
Read your assigned batch files from `sentiment_batches/batch_XX.json` and classify each mention.

## Classification
For each mention, classify the speaker's stance toward AI:
- **positive**: supportive, optimistic, welcoming, praising AI/AI policy
- **neutral**: balanced, procedural, questioning, informational
- **negative**: critical, concerned, opposing, worried about AI
- **disregard**: ONLY if AI mention is incidental and unrelated to any AI sentiment

**Important**: Most mentions should be classified. Use `disregard` sparingly - only when it truly feels like you'd be classifying something unrelated to AI.

## Input Format
Each batch file contains an array of objects with:
- `contributionExtId`: unique ID
- `memberName`: speaker name
- `party`: political party
- `date`: speech date
- `debateTitle`: debate context
- `contextText`: ~100 words around the AI mention

## Output Format
Create a JSON file with your results:
```json
[
  {
    "id": "contributionExtId value",
    "sentiment": "positive|neutral|negative|disregard",
    "confidence": 0.85,
    "reasoning": "Brief 1-sentence explanation"
  }
]
```

## Save Results
Save your output to: `sentiment_batches/results_batch_XX_YY.json`
(where XX-YY are your assigned batch numbers)

After completing analysis, report your summary statistics.
