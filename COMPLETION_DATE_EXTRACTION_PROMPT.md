# Completion Date Extraction Prompt for Gemini

## Task
Extract the date(s) at which the UK Government achieved or completed each recommendation from the AI Opportunities Action Plan.

## Context
You are analyzing progress updates for recommendations from the UK Government's AI Opportunities Action Plan. Each recommendation has a `progress` field containing narrative text that describes what actions were taken. Your task is to extract the specific date(s) when the recommendation was achieved or substantially completed.

## Input Format
You will receive a JSON array of recommendations with the following structure:
```json
{
  "id": "R01",
  "title": "Recommendation title",
  "description": "Full recommendation text",
  "status": "Completed",
  "deliveryTimeline": "Target deadline (e.g., Spring 2025)",
  "progress": "Narrative text describing what was accomplished and when"
}
```

## Output Format
Return a JSON array with the following structure:
```json
[
  {
    "id": "R01",
    "completionDate": "2025-07-21",
    "completionDateFormatted": "21 July 2025",
    "dateConfidence": "high|medium|low",
    "extractedFrom": "Quote from progress text that contains the date",
    "notes": "Any relevant context about date selection"
  }
]
```

## Date Extraction Rules

1. **Primary Date**: Extract the date when the key deliverable was published, launched, or announced that fulfills the recommendation.

2. **Date Formats to Look For**:
   - Explicit dates: "21 July 2025", "30 April", "June 2025"
   - Month references: "in July", "launched June 2025"
   - Season/period references: "Spring 2025", "Autumn 2025"

3. **Date Confidence Levels**:
   - **high**: Exact date mentioned (e.g., "published on 21 July 2025")
   - **medium**: Month and year mentioned (e.g., "launched June 2025")
   - **low**: Only month or season mentioned without year, or date inferred from context

4. **Date Selection Priority**:
   - If multiple dates exist, select the date when the PRIMARY deliverable was achieved
   - For recommendations with ongoing work, select the date of the first major milestone that substantially fulfills the recommendation
   - If a recommendation was achieved in phases, note this and provide the earliest completion date

5. **Handling Ambiguity**:
   - If no clear date is found, set `completionDate` to `null` and explain in `notes`
   - If the progress text only mentions a month (e.g., "in October"), assume the year is 2025 unless context suggests otherwise
   - For seasonal references: Spring = April, Summer = July, Autumn = October

## Examples

### Example 1: High Confidence
**Input:**
```json
{
  "id": "R01",
  "progress": "The UK Compute Roadmap (CP 1352) was published on 21 July 2025, providing a 10-year investment horizon."
}
```
**Output:**
```json
{
  "id": "R01",
  "completionDate": "2025-07-21",
  "completionDateFormatted": "21 July 2025",
  "dateConfidence": "high",
  "extractedFrom": "was published on 21 July 2025",
  "notes": null
}
```

### Example 2: Medium Confidence
**Input:**
```json
{
  "id": "R20",
  "progress": "Global Talent Taskforce was launched in June to headhunt world-class researchers."
}
```
**Output:**
```json
{
  "id": "R20",
  "completionDate": "2025-06-01",
  "completionDateFormatted": "June 2025",
  "dateConfidence": "medium",
  "extractedFrom": "was launched in June",
  "notes": "Exact day not specified, defaulting to 1st of month"
}
```

### Example 3: Multiple Dates
**Input:**
```json
{
  "id": "R04",
  "progress": "Announced in January 2025 that Culham will be the first. Second AIGZ announced in September, and North Wales in November"
}
```
**Output:**
```json
{
  "id": "R04",
  "completionDate": "2025-01-01",
  "completionDateFormatted": "January 2025",
  "dateConfidence": "medium",
  "extractedFrom": "Announced in January 2025 that Culham will be the first",
  "notes": "First AI Growth Zone announced in January 2025. Additional zones announced later (September, November) but initial recommendation fulfilled in January."
}
```

## Data to Process

```json
[
  {
    "id": "R01",
    "title": "Set out, within 6 months, a long-term plan for UK's AI infrastructure needs, backed by a 10-year investment commitment.",
    "status": "Completed",
    "deliveryTimeline": "Spring 2025",
    "progress": "The UK Compute Roadmap (CP 1352) was published on 21 July 2025, providing a 10-year investment horizon and committing up to £2 billion to build a modern public compute ecosystem. The roadmap details the transition from current capabilities to a 2030 target."
  },
  {
    "id": "R04",
    "title": "Establish 'AI Growth Zones' (AIGZ) to facilitate the accelerated build out of AI data centres.",
    "status": "Completed",
    "deliveryTimeline": "Spring 2025",
    "progress": "Announced in January 2025 that Culham will be the first, and a call for expression of interest to host more was issued the following month. The formal AI Growth Zones application process opened on 30 April. Second AIGZ announced in the North East in September, and North Wales in November"
  },
  {
    "id": "R14",
    "title": "Accurately assess the size of the skills gap.",
    "status": "Completed",
    "deliveryTimeline": "Spring 2025",
    "progress": "Skills England's AI skills for the UK workforce report was published in October."
  },
  {
    "id": "R15",
    "title": "Support Higher Education Institutions (HEI) to increase the numbers of AI graduates and teach industry-relevant skills.",
    "status": "Completed",
    "deliveryTimeline": "Autumn 2027",
    "progress": "Spärck AI Scholarships launched June 2025 (£17.2m) funding Master's degrees at 9 universities (Oxford, Cambridge, Imperial, etc.) to increase AI graduates. UKRI also opened Turing AI Pioneer Interdisciplinary Fellowships call (July)."
  },
  {
    "id": "R17",
    "title": "Expand education pathways into AI.",
    "status": "Completed",
    "deliveryTimeline": "Autumn 2026",
    "progress": "Skills England published AI skills tools and report in October (AI Skills Framework, Adoption Pathway, Employer Checklist) to widen routes into AI across sectors, complemented by TechFirst strands (Youth, Graduate, Expert, Local)."
  },
  {
    "id": "R19",
    "title": "Ensure its lifelong skills programme is ready for AI.",
    "status": "Completed",
    "deliveryTimeline": "Autumn 2025",
    "progress": "Skills England published 'AI skills for the UK workforce' in October, with an AI Skills Framework, Adoption Pathway and Employer Checklist to steer lifelong upskilling. Curriculum & Assessment Review interim report was published in March, with the final report due Autumn 2025. See https://www.gov.uk/government/publications/ai-skills-for-the-uk-workforce"
  },
  {
    "id": "R20",
    "title": "Establish an internal headhunting capability on a par with top AI firms to bring a small number of truly elite individuals to the UK.",
    "status": "Completed",
    "deliveryTimeline": "Spring 2026",
    "progress": "Global Talent Taskforce was launched in June to headhunt world-class researchers and innovators to the UK, alongside a £54m Global Talent Fund via 12 delivery institutions."
  },
  {
    "id": "R22",
    "title": "Expand the Turing AI Fellowships offer.",
    "status": "Completed",
    "deliveryTimeline": "Autumn 2026",
    "progress": "UKRI launched Turing AI Pioneer Interdisciplinary Fellowships in July."
  },
  {
    "id": "R29",
    "title": "Support the AI assurance ecosystem to increase trust and adoption by investing in new assurance tools.",
    "status": "Completed",
    "deliveryTimeline": "Spring 2026",
    "progress": "Trusted Third-Party AI Assurance Roadmap was launched in September, an £11m AI Assurance Innovation Fund was announced. AISI's Systemic AI Safety grants are running, with first 20 projects selected."
  },
  {
    "id": "R33",
    "title": "SCAN - 2-way partnerships with AI vendors and startups to anticipate future AI developments and signal public sector demand.",
    "status": "Completed",
    "deliveryTimeline": "Update in Summer 2025",
    "progress": "High-profile MoUs signed in 2025 with Anthropic (Feb), Nvidia (June), Cohere (June), and OpenAI (July). Partnerships explicitly designed to 'anticipate future AI developments' and 'upskill the UK workforce'. AI Exemplars also involve multi-department supplier projects."
  },
  {
    "id": "R45",
    "title": "Publish best-practice guidance, results, case-studies and open-source solutions through a single, 'AI Knowledge Hub'.",
    "status": "Completed",
    "deliveryTimeline": "Summer 2025",
    "progress": "AI Knowledge Hub is live and includes guidance, tools and case studies for public sector teams, with the content growing regularly."
  },
  {
    "id": "R47",
    "title": "Leverage the new Industrial Strategy to drive collective action to support AI adoption across the economy.",
    "status": "Completed",
    "deliveryTimeline": "Spring 2025",
    "progress": "Industrial Strategy and sector plans (e.g. Digital & Technologies, Life Sciences, PBS) embed AI adoption throughout."
  },
  {
    "id": "R48",
    "title": "Appoint AI Sector Champions in key industries like the life sciences, financial services and the creative industries.",
    "status": "Completed",
    "deliveryTimeline": "Summer 2025",
    "progress": "AI Sector Champions appointed November 2025: Shaheen Sayed (Professional Business Services), Chris Dungey (Advanced Manufacturing), Lucy Yu (Clean Energy). Tom Blomfield appointed as AI ambassador for SMEs."
  },
  {
    "id": "R50",
    "title": "Create a new unit, with the power to partner with the private sector to deliver the clear mandate of maximising the UK's stake in frontier AI.",
    "status": "Completed",
    "deliveryTimeline": "Further details to be shared by Spring 2025",
    "progress": "The unit is operating. Early delivery includes: Compute access call for short-term AIRR projects in June, Sovereign AI 'Series One' Proof-of-Concept competition in August-September, OpenBind (£8m seed to DLS/Oxford-led consortium to build the world's largest open protein-ligand dataset), and Encode: AI for Science fellowship expansion. In addition, through the unit several MoUs with companies, such as NVIDIA, OpenAI and Cohere, have been signed, alongside a more formal partnership with Anthropic."
  }
]
```

## Instructions
1. Process each recommendation in the input array
2. Extract the completion date following the rules above
3. Return the complete JSON array with all extracted dates
4. Ensure all dates use ISO 8601 format (YYYY-MM-DD) for `completionDate`
5. Include the human-readable format in `completionDateFormatted`
