# Sentiment Analysis Session Prompt

Use this prompt to start a new Droid session for sentiment analysis. Copy the appropriate section based on which batch range you're assigning.

---

## Project Context

Working directory: `/Users/wjshewitt/Downloads/ai-action-plan-tracker`

We have 3,901 UK Parliament AI mentions stored in 40 batch files (`sentiment_batches/batch_01.json` through `batch_40.json`). Each batch contains ~100 mentions that need LLM-based sentiment classification.

---

## Session Prompts (Copy one per session)

### Agent 1: Batches 01-05 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_01.json
   - batch_02.json
   - batch_03.json
   - batch_04.json
   - batch_05.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_01_05.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 2: Batches 06-10 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_06.json
   - batch_07.json
   - batch_08.json
   - batch_09.json
   - batch_10.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_06_10.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 3: Batches 11-15 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_11.json
   - batch_12.json
   - batch_13.json
   - batch_14.json
   - batch_15.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_11_15.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 4: Batches 16-20 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_16.json
   - batch_17.json
   - batch_18.json
   - batch_19.json
   - batch_20.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_16_20.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 5: Batches 21-25 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_21.json
   - batch_22.json
   - batch_23.json
   - batch_24.json
   - batch_25.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_21_25.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 6: Batches 26-30 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_26.json
   - batch_27.json
   - batch_28.json
   - batch_29.json
   - batch_30.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_26_30.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 7: Batches 31-35 (500 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_31.json
   - batch_32.json
   - batch_33.json
   - batch_34.json
   - batch_35.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_31_35.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 500 mentions. Use the contextText and debateTitle to determine sentiment.
```

### Agent 8: Batches 36-40 (401 mentions)

```
Analyze UK Parliament AI mentions for sentiment using the sentiment-analyzer droid.

Working directory: /Users/wjshewitt/Downloads/ai-action-plan-tracker

Your task:
1. Read these batch files from sentiment_batches/:
   - batch_36.json
   - batch_37.json
   - batch_38.json
   - batch_39.json
   - batch_40.json

2. For EACH mention, classify sentiment as: positive, neutral, negative, or disregard
   - positive: supportive/optimistic about AI
   - neutral: balanced/procedural/questioning
   - negative: critical/concerned about AI risks
   - disregard: FALSE POSITIVE where "AI" is part of another word (e.g., "ch ai r" = chair, "s ai d" = said)

3. Create output file: sentiment_batches/results_36_40.json
   Format: [{"id": "contributionExtId", "sentiment": "...", "confidence": 0.8, "reasoning": "brief explanation"}]

Process all 401 mentions. Use the contextText and debateTitle to determine sentiment.
```

---

## After All Agents Complete

Once all 8 result files exist, run this to merge and update Convex:

```bash
cd /Users/wjshewitt/Downloads/ai-action-plan-tracker
# Check all results exist
ls -la sentiment_batches/results_*.json

# Merge results (create a script or do manually)
# Then update Convex with batchUpdateSentiments mutation
```

---

## Expected Output Files

- `sentiment_batches/results_01_05.json`
- `sentiment_batches/results_06_10.json`
- `sentiment_batches/results_11_15.json`
- `sentiment_batches/results_16_20.json`
- `sentiment_batches/results_21_25.json`
- `sentiment_batches/results_26_30.json`
- `sentiment_batches/results_31_35.json`
- `sentiment_batches/results_36_40.json`

Total: 3,901 classified mentions
