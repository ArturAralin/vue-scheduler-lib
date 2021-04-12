import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import startOfDay from 'date-fns/startOfDay';
import getDay from 'date-fns/getDay';
import getMonth from 'date-fns/getMonth';
import { ScheduledEvent, ScheduledEventWithData } from './interfaces/scheduled-event.interface';
import { ScheduleEventCell } from './interfaces/scheduler-event-cell.interface';

const DAYS_IN_ROW = 7;
const MAX_EVENTS_IN_ROW = 6;

function fillEvents(
  cells: ScheduleEventCell<ScheduledEvent>[],
): ScheduleEventCell<ScheduledEvent>[] {
  const eventPosMax: Record<string, number> = {};

  cells.forEach((cell) => {
    cell.events.forEach((e, pos) => {
      if (e.type === 'event') {
        eventPosMax[e.id] = Math.max(pos + 1, eventPosMax[e.id] || 1);
      }
    });
  });

  return cells.map((cell) => {
    const events: ScheduledEvent[] = [...Array(MAX_EVENTS_IN_ROW)].map<ScheduledEvent>(() => ({
      cellId: cell.cellId,
      type: 'empty',
    }));

    cell.events.slice(0, MAX_EVENTS_IN_ROW).forEach((e) => {
      if (e.type === 'event') {
        const maxPos = eventPosMax[e.id];

        events[maxPos - 1] = e;
      }
    });

    if (cell.events.length > MAX_EVENTS_IN_ROW) {
      const info: ScheduledEvent = {
        cellId: cell.cellId,
        type: 'info',
        summary: `${cell.events.length - MAX_EVENTS_IN_ROW} more`,
      };
      events.push(info);
    }

    return {
      ...cell,
      events,
    };
  });
}

export default function calculateSchedulerCells(
  month: Date,
  startOf: Date,
  rows: number,
  events: ScheduledEventWithData[],
): ScheduleEventCell<ScheduledEvent>[] {
  const today = startOfDay(new Date()).getTime();
  const mainMonthNumber = getMonth(month);
  let cells: ScheduleEventCell<ScheduledEvent>[] = [];

  let offset = 0;
  for (let row = 0; row < rows; row += 1) {
    const rowCells: ScheduleEventCell<ScheduledEvent>[] = [];
    const headerIds = new Set();

    for (let col = 0; col < DAYS_IN_ROW; col += 1) {
      const date = addDays(startOf, offset);
      const nextDate = addDays(startOf, offset + 1);
      const prevDate = addDays(startOf, offset - 1);
      const nextEventsIds = new Set(
        events
          .filter((e) => (
            nextDate.getTime() >= e.from.getTime() && nextDate.getTime() <= e.to.getTime()
          ))
          .map((e) => e.id),
      );
      const prevEventsIds = new Set(
        events
          .filter((e) => (
            prevDate.getTime() >= e.from.getTime() && prevDate.getTime() <= e.to.getTime()
          ))
          .map((e) => e.id),
      );

      const eventsInRange = events
        .filter((e) => (
          date.getTime() >= e.from.getTime() && date.getTime() <= e.to.getTime()
        ))
        .map((e) => {
          const event: ScheduledEvent = {
            ...e,
            type: 'event',
            headInCurrentRow: !headerIds.has(e.id),
            tailInCurrentRow: col === (DAYS_IN_ROW - 1),
            head: !prevEventsIds.has(e.id),
            tail: !nextEventsIds.has(e.id),
          };

          headerIds.add(e.id);

          return event;
        });

      const weekDayNumber = getDay(date);
      const event: ScheduleEventCell<ScheduledEvent> = {
        date,
        cellId: format(date, 'yyyy_MM_dd_HH_mm_ss'),
        active: startOfDay(date).getTime() === today,
        weekend: weekDayNumber === 6 || weekDayNumber === 0,
        shaded: mainMonthNumber !== getMonth(date),
        events: eventsInRange,
        lastInRow: col === (DAYS_IN_ROW - 1),
        bottomRow: row === (rows - 1),
      };
      offset += 1;
      rowCells.push(event);
    }
    cells = cells.concat(fillEvents(rowCells));
  }

  return cells;
}
