export interface ScheduledEvent {
  id: string;
  from: Date,
  to: Date,
  summary: string;
  empty: false;
  headInCurrentRow: boolean;
  tailInCurrentRow: boolean;
  head: boolean;
  tail: boolean;
}

export interface EmptyEvent {
  cellId: string;
  empty: true;
}
