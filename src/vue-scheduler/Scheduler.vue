<template>
  <div
    :id="schedulerId"
    class="scheduler"
  >
    <div
      v-bind:key="cell.cellId"
      v-for="cell in cells"
      @click.self="cellClick(cell)"
      @dblclick.self="cellDoubleClick(cell)"
      :class="{
        'scheduler-cell': true,
        'weekend': cell.weekend,
        'active': cell.active,
        'last-in-row': cell.lastInRow,
        'bottom-row': cell.bottomRow,
      }"
    >
    <div :class="{
      'scheduler-cell-date': true,
      'active': cell.active,
    }">{{formatCellDateFn(cell)}}</div>
      <EventItem
        v-bind:key="e.summary"
        v-for="e in cell.events"
        :event="e"
        :focused="focusedEventId === e.id"
        :active="activeEventId === e.id"
        :onClick="eventClick.bind(null, e)"
        :onDobuleClick="eventDoubleClick.bind(null, e)"
        :mouseover="eventFocused.bind(null, e)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import {
  startOfMonth,
  startOfWeek,
  getDaysInMonth,
  addDays,
  format,
  startOfDay,
  parseISO,
  getMonth,
  subMonths,
  addMonths,
  getDay,
} from 'date-fns';
import EventItem from './components/EventItem.vue';
import { ScheduledEvent } from './interfaces/sheduled-event.interface';

const DAYS_IN_ROW = 7;

interface ScheduleEventCell<T> {
  cellId: string;
  date: Date;
  active: boolean;
  weekend: boolean;
  lastInRow: boolean;
  bottomRow: boolean;
  events: T[];
}

function fillEvents(
  cells: ScheduleEventCell<ScheduledEvent>[],
): ScheduleEventCell<ScheduledEvent | { empty: true }>[] {
  const eventPosMax: Record<string, number> = {};

  cells.forEach((cell) => {
    cell.events.forEach((e, pos) => {
      eventPosMax[e.id] = Math.max(pos + 1, eventPosMax[e.id] || 1);
    });
  });

  return cells.map((cell) => {
    const events: (ScheduledEvent | { empty: true })[] = [...Array(5)].map(() => ({ empty: true }));

    cell.events.forEach((e) => {
      const maxPos = eventPosMax[e.id];

      events[maxPos - 1] = e;
    });
    return {
      ...cell,
      events,
    };
  });
}

function calculateSchedulerCells(
  startOf: Date,
  rows: number,
  events: ScheduledEvent[],
): ScheduleEventCell<ScheduledEvent | { empty: true }>[] {
  const today = startOfDay(new Date()).getTime();
  let cells: ScheduleEventCell<ScheduledEvent | { empty: true }>[] = [];

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

function normalizeCell(
  cell: ScheduleEventCell<ScheduledEvent | { empty: true }>,
): ScheduleEventCell<ScheduledEvent> {
  const clearCell: ScheduleEventCell<ScheduledEvent> = {
    ...cell,
    events: cell.events.filter((e) => !(e as { empty: boolean }).empty) as ScheduledEvent[],
  };

  return clearCell;
}

function defaultFormatCellDate(d: Date): string {
  return format(d, 'dd MMMM');
}

export default Vue.extend({
  name: 'Scheduler',
  components: {
    EventItem,
  },
  props: {
    formatCellDate: Function,
    events: Array,
    month: String,
  },
  data: () => ({
    schedulerId: `scheduler_${Math.trunc(Math.random() * 100000)}`,
    linesCount: 0,
    startOf: new Date(),
    currentMonth: startOfMonth(new Date()),
    focusedEventId: null as string | null,
    activeEventId: null as string | null,
    cells: [] as ScheduleEventCell<ScheduledEvent | { empty: true }>[],
  }),
  mounted() {
    const month = this.month
      ? parseISO(this.month)
      : new Date();
    this.setMonth(month);
  },
  methods: {
    setMonth(month: Date) {
      const currentMonth = startOfMonth(month);
      const startOfCalendar = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const daysInMonth = getDaysInMonth(currentMonth);

      this.linesCount = Math.ceil(daysInMonth / 7);

      if (getMonth(currentMonth) !== getMonth(startOfCalendar)) {
        this.linesCount += 1;
      }

      this.startOf = startOfCalendar;
      this.currentMonth = currentMonth;
      this.cells = calculateSchedulerCells(
        this.startOf,
        this.linesCount,
        this.sortedEvents,
      );
    },
    formatCellDateFn(cell: ScheduleEventCell<unknown>) {
      if (typeof this.formatCellDate === 'function') {
        return this.formatCellDate(cell.date);
      }

      return defaultFormatCellDate(cell.date);
    },
    cellClick(cell: ScheduleEventCell<ScheduledEvent | { empty: true }>) {
      this.$emit('onCellClick', normalizeCell(cell));
    },
    cellDoubleClick(cell: ScheduleEventCell<ScheduledEvent | { empty: true }>) {
      this.$emit('onCellDoubleClick', normalizeCell(cell));
    },
    eventClick(e: ScheduledEvent) {
      if (e.empty) {
        this.activeEventId = null;
        return;
      }

      this.activeEventId = e.id;

      this.$emit('onEventClick', e);
    },
    eventDoubleClick(e: ScheduledEvent) {
      if (e.empty) {
        return;
      }

      this.$emit('onEventDoubleClick', e);
    },
    eventFocused(e: ScheduledEvent) {
      if (e.empty) {
        this.focusedEventId = null;
        return;
      }

      this.focusedEventId = e.id;
    },
  },
  computed: {
    sortedEvents() {
      return (this.events as ScheduledEvent[]).sort((a, b) => {
        const aFrom = a.from.getTime();
        const bFrom = b.from.getTime();

        if (aFrom > bFrom) {
          return 1;
        }

        if (aFrom < bFrom) {
          return -1;
        }

        return 0;
      });
    },
  },
});
</script>

<style scoped>
.scheduler {
  background: #22242A;
  color: #CECECE;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  user-select: none;
  justify-content: center;
  /* remove this rule */
  min-width: 700px;
}

.scheduler-navigation {
  width: 100%;
  text-align: right;
}

.scheduler-row {
  width: 100%;
}

.scheduler-cell {
  height: 150px;
  width: 14%;
  text-align: right;

  /*  */
  border-left: 1px solid #3B3C40;
  border-top: 1px solid #3B3C40;
}

.scheduler-cell.weekend {
  background: #222324;
}

.scheduler-cell.last-in-row {
  border-right: 1px solid #3B3C40;
}

.scheduler-cell.bottom-row {
  border-bottom: 1px solid #34353a;
}

.scheduler-cell-date {
  display: inline-block;
  margin: 5px 7px 4px 0;
  border-radius: 4px;
  padding: 0 4px;
}

.scheduler-cell-date.active {
  background: rgb(145, 41, 41);
}
</style>
