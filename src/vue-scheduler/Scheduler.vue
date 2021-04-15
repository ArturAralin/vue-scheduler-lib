<template>
  <div
    :id="schedulerId"
    class="scheduler"
  >
    <div
      v-bind:key="weekday"
      v-for="(weekday, idx) in weekdays"
      :class="{
        'scheduler-weekday': true,
        'head': idx === 0,
        'tail': idx === (weekdays.length - 1),
      }"
    >
      <span>{{weekday}}</span>
    </div>
    <div
      v-bind:key="cell.cellId"
      v-for="cell in cells"
      @click.self="cellClick(cell)"
      @dblclick.self="cellDoubleClick(cell)"
      :class="{
        'scheduler-cell': true,
        'weekend': cell.weekend,
        'active': cell.active,
        'highlight': eventItemDrag && mouseOverCellId === cell.cellId,
        'shaded': cell.shaded,
        'last-in-row': cell.lastInRow,
        'bottom-row': cell.bottomRow,
      }"
      :data-cell-id="cell.cellId"
    >
    <div
      :class="{
        'scheduler-cell-date': true,
        'active': cell.active,
      }"
    >{{formatCellDateFn(cell)}}</div>
      <EventItem
        v-bind:key="e.id"
        v-for="e in cell.events"
        :cellId="cell.cellId"
        :event="e"
        :dragOverId="Boolean(eventItemDrag)"
        :focused="focusedEventId === e.id"
        :active="activeEventId === e.id"
        :onClick="eventClick.bind(null, e)"
        :onDobuleClick="eventDoubleClick.bind(null, e)"
        :mouseover="eventFocused.bind(null, e)"
        :event-item-drag-start="eventItemDragStart"
        :event-item-drag-drop="eventItemDragDrop"
        :event-item-drag-over="eventItemDragOver"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import getMonth from 'date-fns/getMonth';
import EventItem from './components/EventItem.vue';
import { EmptyEvent, ScheduledEvent, ScheduledEventWithData } from './interfaces/scheduled-event.interface';
import { ScheduleEventCell } from './interfaces/scheduler-event-cell.interface';
import calculateSchedulerCells from './calculate-scheduler-cells';

import './styles/scheduler.scss';

function normalizeCell(
  cell: ScheduleEventCell<ScheduledEvent>,
): ScheduleEventCell<ScheduledEvent> {
  const clearCell: ScheduleEventCell<ScheduledEvent> = {
    ...cell,
    events: cell.events.filter((e) => e.type === 'event'),
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
    weekdays: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    schedulerId: `scheduler_${Math.trunc(Math.random() * 100000)}`,
    linesCount: 0,
    startOf: new Date(),
    currentMonth: startOfMonth(new Date()),
    focusedEventId: null as string | null,
    activeEventId: null as string | null,
    cells: [] as ScheduleEventCell<ScheduledEvent | EmptyEvent>[],
    //
    eventItemDrag: null as null | { cellId: string, eventId: string },
    mouseOverCellId: null as null | string,
  }),
  mounted() {
    const month = this.month
      ? parseISO(this.month)
      : new Date();
    this.setMonth(month);
  },
  watch: {
    events() {
      const month = this.month
        ? parseISO(this.month)
        : new Date();
      this.cells = calculateSchedulerCells(
        month,
        this.startOf,
        this.linesCount,
        this.sortedEvents,
      );
    },
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
        month,
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
    cellClick(cell: ScheduleEventCell<ScheduledEvent >) {
      this.$emit('onCellClick', normalizeCell(cell));
    },
    cellDoubleClick(cell: ScheduleEventCell<ScheduledEvent>) {
      this.$emit('onCellDoubleClick', normalizeCell(cell));
    },
    eventClick(e: ScheduledEvent) {
      if (e.type === 'event') {
        this.activeEventId = e.id;
        this.$emit('onEventClick', e);
        return;
      }

      this.activeEventId = null;
    },
    eventDoubleClick(e: ScheduledEvent) {
      if (e.type === 'event') {
        this.$emit('onEventDoubleClick', e);
      }
    },
    eventFocused(e: ScheduledEvent) {
      if (e.type === 'event') {
        this.focusedEventId = e.id;
        return;
      }

      this.focusedEventId = null;
    },
    // event item drag
    eventItemDragStart(cellId: string, eventId: string) {
      this.eventItemDrag = {
        cellId,
        eventId,
      };
    },
    eventItemDragDrop(newCellId: string) {
      if (this.eventItemDrag && this.eventItemDrag.cellId !== newCellId) {
        const cell = this.cells.find((c) => c.cellId === newCellId);

        if (cell) {
          const { cellId, date } = cell;
          this.$emit('eventDragged', {
            cellId,
            date,
            eventId: this.eventItemDrag.eventId,
          });
        }
      }

      this.eventItemDrag = null;
    },
    eventItemDragOver(cellId: string) {
      this.mouseOverCellId = cellId;
    },
  },
  computed: {
    sortedEvents() {
      return (this.events as ScheduledEventWithData[]).sort((a, b) => {
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
