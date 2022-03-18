export * from './lib/avatar';

export interface Proposal {
  proposal_id: string;
  proposal: string;
  number_of_votes: number;
  is_ongoing: boolean;
  duration: number;
}
