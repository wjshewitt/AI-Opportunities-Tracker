import { useAction } from 'convex/react';
import { api } from './convex/_generated/api';

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

export function useHansardMentions() {
  const getHansardMentions = useAction(api.hansard.getHansardMentions);
  const refreshHansardMentions = useAction(api.hansard.refreshHansardMentions);
  
  const load = async (): Promise<HansardResponse> => {
    try {
      const result = await getHansardMentions();
      return result as HansardResponse;
    } catch (error) {
      console.error('Failed to fetch Hansard mentions:', error);
      return {
        TotalContributions: 0,
        TotalDebates: 0,
        TotalWrittenStatements: 0,
        Contributions: [],
        Debates: []
      };
    }
  };

  const refresh = async (): Promise<HansardResponse> => {
    try {
      const result = await refreshHansardMentions();
      return result as HansardResponse;
    } catch (error) {
      console.error('Failed to refresh Hansard mentions:', error);
      return {
        TotalContributions: 0,
        TotalDebates: 0,
        TotalWrittenStatements: 0,
        Contributions: [],
        Debates: []
      };
    }
  };

  return { load, refresh };
}

export function getHansardDebateUrl(extId: string): string {
  return `https://hansard.parliament.uk/search/Contributions?contributionExtId=${extId}`;
}
