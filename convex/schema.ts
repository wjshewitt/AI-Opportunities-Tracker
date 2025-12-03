import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  parliamentAIMentions: defineTable({
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
    sentiment: v.optional(v.string()),
    sentimentConfidence: v.optional(v.number()),
    sentimentReasoning: v.optional(v.string()),
    processedAt: v.optional(v.number()),
  })
    .index("by_date", ["date"])
    .index("by_member", ["memberId"])
    .index("by_sentiment", ["sentiment"])
    .index("by_house", ["house"])
    .index("by_contribution", ["contributionExtId"]),

  parliamentAIFetchProgress: defineTable({
    searchTerm: v.string(),
    lastSkip: v.number(),
    totalFound: v.number(),
    fetchedCount: v.number(),
    completed: v.boolean(),
    lastUpdated: v.number(),
  })
    .index("by_term", ["searchTerm"]),
});
