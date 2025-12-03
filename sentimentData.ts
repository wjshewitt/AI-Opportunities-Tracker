export type Sentiment = 'positive' | 'neutral' | 'negative';

// Sentiment analysis of AI Opportunities Action Plan mentions in Parliament
// Last updated: 2025-12-03
// Total contributions analyzed: 84
//
// METHODOLOGY: Analyze ~40 words before and after the mention of "AI Opportunities Action Plan"
// to determine sentiment toward the plan specifically, not overall speech tone.
//
// Criteria:
// - positive: Supporting, praising, welcoming the AI plan
// - neutral: Procedural, informational, questioning, balanced discussion
// - negative: Criticizing, opposing, highlighting failures or concerns about the plan

export const sentimentMap: Record<string, Sentiment> = {
  // Alan Mak (Opposition) - 2025-02-12 - "Labour's consultation provides the worst of all worlds"
  "FC359FB7-6918-4E90-9883-00EE708797B5": "negative",
  
  // Alan Mak (Opposition) - 2025-01-13 - Opposition response criticizing govt approach, questions energy policy
  "77DF2EB4-B508-4BF3-9795-22332D4E85B1": "negative",
  
  // Viscount Colville of Culross - 2025-11-27 - Raising concerns about regulation gaps (supporting amendments)
  "18BCBA81-19A6-4F52-8B9E-575C4EA2A495": "neutral",
  
  // Peter Kyle (Minister) - 2025-10-30 - Promoting AI plan, "industrial revolution"
  "A6826669-83CA-4078-8C1C-A4CBA8B1F0CD": "positive",
  
  // Dan Aldridge - 2025-10-16 - "hugely positive about our technological future"
  "FEC6FC4F-EA57-4696-A404-1F02A8D6259F": "positive",
  
  // Baroness Levitt - 2025-09-09 - New minister, procedural response
  "69E92665-74FB-4A12-B614-B91DFAAD64F3": "neutral",
  
  // Baroness Kidron - 2025-07-21 - Questioning sovereign AI details
  "8B1B14B4-9BCB-4214-AC8F-031F0020BDAA": "neutral",
  
  // Lord Vallance (Minister) - 2025-07-21 - Positive about AI plan implementation
  "C1141C45-6F5F-473F-9CB8-F32D03F04535": "positive",
  
  // Baroness Jones (Minister) - 2025-07-21 - Responding to amendments
  "D40AC7C3-D8F4-4720-BDE2-BB0F07C9D9E1": "neutral",
  
  // Will Stone - 2025-07-08 - Thanks for debate, supportive tone
  "9C994832-077D-49EB-8EB0-EF302F4A0858": "neutral",
  
  // Zöe Franklin - 2025-07-08 - AI in schools, balanced concerns
  "DFB83BF5-FE83-4F9D-80AD-8A2786F3A163": "neutral",
  
  // Uma Kumaran - 2025-06-25 - Praising AI hub where PM launched plan
  "52AC7284-0046-44CF-86DE-D18AB094A32F": "positive",
  
  // Dr Ben Spencer (Opposition) - 2025-06-25 - Criticizing govt for ignoring advice, favoring big corps
  "48FF2AB1-9504-4F85-B0BA-CED42D325CA2": "negative",
  
  // Lord Clement-Jones - 2025-06-13 - Praising committee, supportive
  "4273DE26-E28A-49B0-BE6C-5C2E47A40DF4": "positive",
  
  // Baroness Kidron - 2025-06-13 - Welcome, thanking committee
  "2CA22F9A-AA57-4EAE-980F-F064197B5D34": "positive",
  
  // Viscount Camrose - 2025-06-13 - Thanking for debate, welcoming
  "ED6EE10B-8F4E-4AC5-8EF2-A344680ACEE5": "positive",
  
  // Lord Tarassenko - 2025-06-13 - AI healthcare interests, supportive
  "03EE16D4-B22D-4191-A5D7-6AD2CC67EDEE": "positive",
  
  // Baroness Jones (Minister) - 2025-06-13 - Thanking committee, positive
  "A045C491-1C4B-45A5-9FF9-914E7688BBF7": "positive",
  
  // Baroness Stowell - 2025-06-13 - Chair, positive final report
  "B409942F-679E-41B4-9068-B7104308813E": "positive",
  
  // Lord Holmes - 2025-06-05 - Asking about implementation steps (question)
  "999BF219-545D-4996-8CFE-1BF99E44FCCD": "neutral",
  
  // Lord Vallance (Minister) - 2025-06-05 - "Accepted all 50 recommendations"
  "99965FD3-3B92-4435-A209-2BE973739171": "positive",
  
  // Lord Tarassenko - 2025-06-05 - Human capital emphasis
  "77504A69-75F6-4492-831B-9C27B8D0420B": "neutral",
  
  // Lord Vallance (Minister) - 2025-06-05 - Technical response on data
  "7D8158D6-E216-42B8-AD09-C03D5B62F131": "neutral",
  
  // Lord Browne - 2025-05-21 - Discussing NTI interests
  "D4E7A5AF-6484-42B0-A0DB-DDC23C6F5343": "neutral",
  
  // Baroness Twycross - 2025-05-15 - Govt recognizes creative content value
  "6E2F5837-4F21-43CF-8C08-01364B042318": "positive",
  
  // Lord Vallance (Minister) - 2025-05-06 - Public services central, £42m announcement
  "1AF76D52-E770-41E1-B1DD-7C7D646C1AEF": "positive",
  
  // Lord Kirkhope - 2025-04-29 - "Very encouraging", welcoming plan
  "7D27431E-3EB0-4EFC-981A-76B64ADA473B": "positive",
  
  // Lord Vallance (Minister) - 2025-04-29 - Positive ministerial response
  "16974A47-ED79-4FA7-9708-C77B1D4DF814": "positive",
  
  // Pat McFadden - 2025-04-24 - "AI is a huge opportunity for the UK"
  "D6A44FE4-E918-401A-B298-F5E032774431": "positive",
  
  // Lord Wilson - 2025-04-23 - Wales/UK cooperation on AI
  "2B11A3F0-46A9-45B6-9433-290D2B5A9FFE": "positive",
  
  // Dr Ben Spencer (Opposition) - 2025-04-23 - Constructive opposition response
  "8B76D7D9-0D41-403F-B893-606BCBCCA22F": "neutral",
  
  // Steve Race - 2025-04-23 - Congratulating debate, positive
  "3F905312-071A-4BB1-B571-B5289DE8FE04": "positive",
  
  // Chris Bryant - 2025-04-22 - Humorous comment about robots
  "647E8381-363E-42CC-B37A-20C4FB4905F9": "neutral",
  
  // Andrew Western (Minister) - 2025-03-18 - Recognizes opportunities and safety
  "E8D0DFF6-7860-416F-A3BC-6FFE56D95FFF": "positive",
  
  // Andrew Western (Minister) - 2025-03-18 - AI framework response
  "7CCAE862-87F7-49D7-9C43-11BD2C9EB52E": "neutral",
  
  // Dr Ben Spencer (Opposition) - 2025-03-11 - Supporting creative industry, balanced
  "EFE6DDDF-AF8A-4EEA-ADC0-3E0F31E4BAF8": "neutral",
  
  // Baroness Smith (Minister) - 2025-03-06 - Women's Day debate, positive opening
  "679FF2AB-CEA3-447A-A14F-4EDAEA4BE523": "positive",
  
  // Lord Hunt (Minister) - 2025-02-26 - Taking note of debate
  "929B05FF-81EE-4473-BD85-97AD27A29147": "neutral",
  
  // Peter Kyle (Minister) - 2025-02-12 - "PM delivered AI plan", deploying AI
  "A1A2955D-0503-4DD2-982C-44DD29A44F11": "positive",
  
  // Peter Kyle (Minister) - 2025-02-12 - "Britain leading the world"
  "C30DE83D-9DC5-44AE-A12F-3EFDE08085B7": "positive",
  
  // Feryal Clark (Minister) - 2025-02-12 - Advocating for AI growth zone
  "0606BA06-3BC1-4966-BECE-6A5EF171D465": "positive",
  
  // Feryal Clark (Minister) - 2025-02-12 - AI growth zones secure UK position
  "15A08EAF-25D2-4D92-8988-F38836264F9F": "positive",
  
  // Feryal Clark (Minister) - 2025-02-12 - Opportunities for small businesses
  "A8159FA9-289A-4647-9F04-E8C255332727": "positive",
  
  // Peter Kyle (Minister) - 2025-02-12 - Govt committed to AI infrastructure
  "79811FCE-E753-4017-BAF1-540E5978E9A8": "positive",
  
  // Lord Holmes - 2025-02-10 - Asking about legislation plans (question)
  "75DE3D13-3B41-41B5-A95D-557922790CB0": "neutral",
  
  // Lord Ranger - 2025-02-10 - Question about startups
  "EA1DDC33-921A-432F-B247-3F8955AE2955": "neutral",
  
  // Lord Tarassenko - 2025-01-28 - Support for NHS datasets amendment
  "AAA641D7-2CAE-4537-8276-E8E37F7963B8": "neutral",
  
  // Lord Clement-Jones - 2025-01-28 - Setting context, here-and-now issue
  "25CD09E9-2097-4CA7-B349-DB0932455315": "neutral",
  
  // Lord Vallance (Minister) - 2025-01-28 - Technical response on LLMs
  "8D19C961-C277-4C0A-9BCE-731672593CBE": "neutral",
  
  // Lord Stevenson - 2025-01-28 - Signed amendment, procedural
  "D4FC39EF-CD54-4C70-B54F-0DA55B057D1F": "neutral",
  
  // Baroness Stowell - 2025-01-28 - Copyright difficult to resolve
  "D627391F-01D8-431D-89A8-A691CD32ACA4": "neutral",
  
  // Christine Jardine - 2025-01-27 - Concern about cancelled exascale computer
  "AF67D283-86D8-417B-989D-D029701ED216": "negative",
  
  // Pat McFadden - 2025-01-23 - "Great opportunities", serious approach
  "F7832939-72A6-4134-88AD-0E9CF0B9F3E5": "positive",
  
  // Lord Livermore (Minister) - 2025-01-23 - Thanks for debate
  "175964FC-08AD-492F-9E63-2BE7FECA7B9F": "neutral",
  
  // Lord Tarassenko - 2025-01-22 - Data centres from AI plan
  "9F76F616-72C9-431A-88E0-0331A00F6227": "neutral",
  
  // Baroness Kidron - 2025-01-21 - Scrutinizing implementation
  "8B73BF42-9690-49C6-BFDF-0AB9FE09A2DE": "neutral",
  
  // Lord McNicol - 2025-01-16 - "Welcomes Statement, ambitious vision"
  "895B366D-97FE-4A69-82B9-34AE248A8BC2": "positive",
  
  // Baroness Stowell - 2025-01-16 - Committee welcomes plan (with copyright caveat)
  "00F24E0F-CF87-4038-9529-72B4144C501E": "positive",
  
  // Lord Vallance (Minister) - 2025-01-16 - Thanks for broad welcome
  "13AF28B1-1D50-40E6-9542-66505FEC9445": "positive",
  
  // Sir Keir Starmer (PM) - 2025-01-15 - PM statement mentioning AI work
  "EA5B74CC-B225-48A5-A28A-12348A6646B1": "positive",
  
  // Lord Livermore (Minister) - 2025-01-14 - Chancellor's growth Statement
  "1755D229-C172-4032-A4E8-9577A0A3C3D7": "positive",
  
  // Peter Kyle (Minister) - 2025-01-13 - Initial AI plan statement launch
  "8C097D42-6AEA-4E1C-BED2-C12DA48C98EE": "positive",
  
  // --- Additional 22 contributions ---
  
  // Lord Vallance (Minister) - 2025-06-05 - "AI sovereignty is very much part of the AI action plan"
  "0275F300-D9BB-4C3E-AAE2-E2EE35D7E7EB": "positive",
  
  // Lord Holmes - 2025-01-28 - Supporting amendments for creatives
  "05A19A71-DF89-4C4B-8DE2-E9FB789437A2": "neutral",
  
  // Baroness Stowell - 2025-05-21 - Supporting tech scale-up amendments
  "114F6BF3-27B2-4455-98B7-231E7C543445": "neutral",
  
  // Rachel Reeves (Chancellor) - 2025-06-11 - Economic policy context
  "1CCC4969-C7B9-4A66-AE2B-487E634BE836": "neutral",
  
  // Pat McFadden - 2025-06-24 - "put such stress on having an AI action plan"
  "20DE1D03-ED1D-43D1-BA45-242655F6E0AF": "positive",
  
  // Lord Spellar - 2025-01-22 - Referencing plan's opportunity
  "2F403864-F614-4C5A-B234-E17903630E15": "neutral",
  
  // Lord Vaizey - 2025-01-16 - "welcome the Minister's focus on delivery"
  "3585AC14-9449-4BF9-BAB5-C14848EC81C5": "positive",
  
  // Andy Slaughter - 2025-10-23 - Justice Committee, procedural
  "41561CF7-D0CE-4E7B-94A1-43B147E0B09B": "neutral",
  
  // Lord Vallance (Minister) - 2025-02-10 - "The AI action plan is about exactly that"
  "5075EDE5-F51B-4E72-AC82-407C9402F819": "positive",
  
  // Baroness Jones (Minister) - 2025-06-05 - Thanking for amendments
  "632912D8-6B9C-4C87-B983-FAAF45CC07E5": "neutral",
  
  // Baroness Kidron - 2025-01-28 - Public data amendments
  "70D0E241-D649-4D03-AAF1-4B9C6E8763BF": "neutral",
  
  // Lord Vallance (Minister) - 2025-04-29 - "committed to bringing forward AI legislation"
  "883253D6-53B6-4DC2-AF3C-2D85407EEFAD": "positive",
  
  // Pat McFadden - 2025-01-23 - "AI opportunities plan so UK is great home for AI"
  "8B298A6A-064B-403B-8B5F-3DAFDC922F03": "positive",
  
  // Kanishka Narayan - 2025-01-14 - "AI opportunities plan just this week" enthusiastic
  "903576ED-8DFF-42B8-9A55-865CAC53D164": "positive",
  
  // Lord Clement-Jones - 2025-01-30 - "AI clearly has many creative uses"
  "AF257D7F-3845-4D77-B262-4598736E89EE": "neutral",
  
  // Jon Pearce - 2025-01-13 - Supportive question about small businesses
  "B58785C9-7A40-4A22-A5CD-08BA88DF5523": "positive",
  
  // Lord Russell - 2025-06-04 - Constitutional discussion, procedural
  "BEB38F3A-6B27-475A-B0FF-FD8D81F99148": "neutral",
  
  // Pat McFadden - 2025-04-24 - Government reform agenda
  "CB5D6E8D-432F-402F-A3C1-2C85533BC6B2": "positive",
  
  // Lord Vallance (Minister) - 2025-06-05 - PhD funding discussion
  "DB66A07F-B58A-40DB-9C3A-B24BF6EA9400": "neutral",
  
  // Lord Sharpe - 2025-05-14 - Trade agreement discussion
  "DC5CA013-1646-4FFD-9AA7-33732FEA78AA": "neutral",
  
  // Viscount Camrose - 2025-01-30 - Thanking for debate
  "E631C2A7-AB48-4726-8AF9-F60C4D107540": "neutral",
  
  // Emma Reynolds - 2025-03-04 - "taking forward the AI action plan"
  "FED890FE-6BC0-492D-9798-27CF17AD38F0": "positive",
};

// Get sentiment for a contribution
export function getSentiment(extId?: string): Sentiment {
  if (extId && sentimentMap[extId]) {
    return sentimentMap[extId];
  }
  return 'neutral';
}

// Sentiment display configuration
export const sentimentConfig = {
  positive: {
    icon: '▲',
    label: 'Positive',
    color: '#22C55E',
    bgColor: '#DCFCE7',
    darkBgColor: '#166534',
  },
  neutral: {
    icon: '●',
    label: 'Neutral', 
    color: '#6B7280',
    bgColor: '#F3F4F6',
    darkBgColor: '#374151',
  },
  negative: {
    icon: '▼',
    label: 'Negative',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    darkBgColor: '#991B1B',
  },
};
