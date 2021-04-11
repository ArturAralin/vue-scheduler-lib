export interface ScheduledEventWithData {
  type: 'event';
  id: string;
  from: Date,
  to: Date,
  summary: string;
  headInCurrentRow: boolean;
  tailInCurrentRow: boolean;
  head: boolean;
  tail: boolean;
}

export interface EmptyEvent {
  type: 'empty';
  cellId: string;
}

export interface InfoEvent {
  type: 'info';
  cellId: string;
  summary: string;
}

export type ScheduledEvent = ScheduledEventWithData | EmptyEvent | InfoEvent;