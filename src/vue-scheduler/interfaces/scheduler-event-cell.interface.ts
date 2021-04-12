export interface ScheduleEventCell<T> {
  cellId: string;
  date: Date;
  active: boolean;
  weekend: boolean;
  lastInRow: boolean;
  bottomRow: boolean;
  shaded: boolean;
  events: T[];
}
