export enum Status {
  COMPLETED = 'Completed',
  ON_TRACK = 'On Track',
  DELAYED = 'Delayed',
  NOT_STARTED = 'Not Started',
  PARTIALLY = 'Partially'
}

export interface Recommendation {
  id: string;
  title: string;
  chapter: string;
  department: string;
  status: Status;
  deliveryTimeline: string;
  govResponse: string;
  progress: string;
  lastUpdate: string;
  description?: string;
  completionDate?: string; // ISO format date when recommendation was achieved (e.g., "2025-07-21")

  // Source metadata (purely factual, from CP 1241 and CP 1242)
  actionPlanPage?: number;
  actionPlanSection?: string;
  govResponsePage?: number;
  govResponseSection?: string;
}

export type ViewState = 'dashboard' | 'tracker' | 'timeline' | 'league' | 'document' | 'test';

export interface DocumentPage {
  pageNumber: number;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  pages: DocumentPage[];
}

export interface FilterState {
  search: string;
  status: string;
  department: string;
  chapter: string;
   actionPlanSection: string;
}
