#!/usr/bin/env python3
"""
Sentiment analysis for Parliament AI mentions using keyword/pattern analysis.
Processes all 40 batches and outputs results for Convex import.
"""

import json
import os
import re
from pathlib import Path

# False positive patterns (Hansard API highlighting artifacts)
FALSE_POSITIVE_PATTERNS = [
    r'\b(pr|f|m|aw|ch|s|tr|pl|r|cl|str|br|afr|obt|st|dr|gr|upl|sl|p|w|restr|ent|ret|sust|rem|det|expl|att|cert|m)[\s]?ai[\s]?(se|n|m|d|t|r|l|ned|nt|ns|ning|ned|der|rman|rmanship|nst|led|ling|ls)\b',
    r'\bai[\s]?m\b',  # aim
    r'\bs[\s]?ai[\s]?d\b',  # said
    r'\bch[\s]?ai[\s]?r\b',  # chair
    r'\bpr[\s]?ai[\s]?se\b',  # praise
    r'\bm[\s]?ai[\s]?den\b',  # maiden
    r'\bAff[\s]?ai[\s]?rs\b',  # Affairs
    r'\brem[\s]?ai[\s]?n\b',  # remain
    r'\bobt[\s]?ai[\s]?n\b',  # obtain
    r'\bcont[\s]?ai[\s]?n\b',  # contain
    r'\bsust[\s]?ai[\s]?n\b',  # sustain
    r'\bdet[\s]?ai[\s]?l\b',  # detail
]

# Keywords for sentiment classification
POSITIVE_KEYWORDS = [
    'opportunity', 'opportunities', 'benefit', 'benefits', 'potential',
    'innovation', 'innovative', 'progress', 'advancement', 'growth',
    'support', 'supporting', 'welcome', 'welcomed', 'exciting',
    'transform', 'transformative', 'improve', 'improvement', 'enhance',
    'enable', 'enabling', 'empower', 'productivity', 'efficiency',
    'breakthrough', 'promising', 'optimistic', 'lead', 'leadership',
    'invest', 'investment', 'boost', 'advantage', 'advantageous'
]

NEGATIVE_KEYWORDS = [
    'risk', 'risks', 'danger', 'dangerous', 'threat', 'concern', 'concerned',
    'worry', 'worried', 'fear', 'fears', 'problem', 'problems', 'challenge',
    'harmful', 'harm', 'damage', 'unsafe', 'unsafe', 'regulate', 'regulation',
    'bias', 'biased', 'discrimination', 'discriminatory', 'unemployment',
    'job loss', 'job losses', 'replace', 'replacement', 'displace',
    'misinformation', 'disinformation', 'deepfake', 'deepfakes',
    'surveillance', 'privacy', 'unethical', 'ethical concerns',
    'safeguard', 'safeguards', 'protect', 'protection', 'caution', 'cautious'
]

NEUTRAL_KEYWORDS = [
    'question', 'questions', 'ask', 'asking', 'inquiry', 'review',
    'committee', 'report', 'statement', 'update', 'minister', 'secretary',
    'policy', 'legislation', 'bill', 'amendment', 'debate', 'discussion',
    'consider', 'considering', 'examine', 'examining', 'assess', 'assessment'
]


def is_false_positive(context_text: str) -> bool:
    """Check if the mention is a false positive (not about AI)."""
    text_lower = context_text.lower()
    
    # Check for false positive patterns
    for pattern in FALSE_POSITIVE_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            # But if it also contains real AI terms, it's not a false positive
            real_ai_terms = ['artificial intelligence', 'machine learning', 'ai system', 
                           'ai technology', 'ai model', 'generative ai', 'ai regulation',
                           'ai safety', 'ai ethics', 'chatgpt', 'large language model']
            if any(term in text_lower for term in real_ai_terms):
                return False
            
            # Check if context has standalone AI
            collapsed = re.sub(r'\s+', '', context_text)
            if not re.search(r'(?:^|[^a-zA-Z])AI(?:[^a-zA-Z]|$)', collapsed):
                return True
    
    return False


def classify_sentiment(context_text: str, debate_title: str) -> tuple[str, float, str]:
    """Classify sentiment based on keywords and context."""
    text_lower = (context_text + ' ' + debate_title).lower()
    
    # Check for real AI mentions first
    is_real_ai = any(term in text_lower for term in [
        'artificial intelligence', 'machine learning', 'ai system', 
        'ai technology', 'ai model', 'generative ai', 'ai regulation',
        'ai safety', 'ai ethics', 'chatgpt', 'large language model',
        'ai act', 'ai governance', 'ai strategy', 'ai policy'
    ])
    
    # Count keyword matches
    positive_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_lower)
    negative_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text_lower)
    neutral_count = sum(1 for kw in NEUTRAL_KEYWORDS if kw in text_lower)
    
    # Weight based on context
    total = positive_count + negative_count + neutral_count
    
    if total == 0:
        if is_real_ai:
            return 'neutral', 0.5, 'Mentions AI but no clear sentiment indicators'
        else:
            return 'neutral', 0.4, 'General context without strong sentiment'
    
    # Calculate sentiment
    if positive_count > negative_count and positive_count > neutral_count:
        confidence = min(0.9, 0.5 + (positive_count / total) * 0.4)
        return 'positive', confidence, f'Positive keywords: {positive_count} (vs {negative_count} negative)'
    elif negative_count > positive_count and negative_count > neutral_count:
        confidence = min(0.9, 0.5 + (negative_count / total) * 0.4)
        return 'negative', confidence, f'Negative/concern keywords: {negative_count} (vs {positive_count} positive)'
    else:
        # Mixed or neutral
        if positive_count > 0 and negative_count > 0:
            return 'neutral', 0.6, f'Mixed sentiment: {positive_count} positive, {negative_count} negative keywords'
        return 'neutral', 0.7, f'Balanced/procedural discussion'


def process_batch(batch_path: Path) -> list[dict]:
    """Process a single batch file and return sentiment results."""
    with open(batch_path, 'r') as f:
        mentions = json.load(f)
    
    results = []
    for mention in mentions:
        mention_id = mention['contributionExtId']
        context = mention.get('contextText', '')
        debate = mention.get('debateTitle', '')
        mention_type = mention.get('mentionType', 'AI')
        
        # Check for false positives (only for "AI" type mentions, not "Artificial Intelligence")
        if mention_type == 'AI' and is_false_positive(context):
            results.append({
                'id': mention_id,
                'sentiment': 'disregard',
                'confidence': 0.9,
                'reasoning': 'False positive - AI appears as part of another word'
            })
            continue
        
        sentiment, confidence, reasoning = classify_sentiment(context, debate)
        results.append({
            'id': mention_id,
            'sentiment': sentiment,
            'confidence': round(confidence, 2),
            'reasoning': reasoning
        })
    
    return results


def main():
    batch_dir = Path('/Users/wjshewitt/Downloads/ai-action-plan-tracker/sentiment_batches')
    all_results = []
    stats = {'positive': 0, 'neutral': 0, 'negative': 0, 'disregard': 0}
    
    # Process all 40 batches
    for i in range(1, 41):
        batch_file = batch_dir / f'batch_{i:02d}.json'
        if batch_file.exists():
            print(f'Processing {batch_file.name}...')
            results = process_batch(batch_file)
            all_results.extend(results)
            
            # Update stats
            for r in results:
                stats[r['sentiment']] += 1
    
    # Save combined results
    output_path = batch_dir / 'sentiment_results.json'
    with open(output_path, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print(f'\n=== Sentiment Analysis Complete ===')
    print(f'Total processed: {len(all_results)}')
    print(f'Positive: {stats["positive"]} ({stats["positive"]/len(all_results)*100:.1f}%)')
    print(f'Neutral: {stats["neutral"]} ({stats["neutral"]/len(all_results)*100:.1f}%)')
    print(f'Negative: {stats["negative"]} ({stats["negative"]/len(all_results)*100:.1f}%)')
    print(f'Disregard: {stats["disregard"]} ({stats["disregard"]/len(all_results)*100:.1f}%)')
    print(f'\nResults saved to: {output_path}')
    
    # Save stats summary
    stats_path = batch_dir / 'sentiment_stats.json'
    with open(stats_path, 'w') as f:
        json.dump({
            'total': len(all_results),
            'breakdown': stats,
            'percentages': {k: round(v/len(all_results)*100, 1) for k, v in stats.items()}
        }, f, indent=2)
    print(f'Stats saved to: {stats_path}')


if __name__ == '__main__':
    main()
