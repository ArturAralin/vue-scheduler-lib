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
        'highlight': eventItemDrag && mouseOverCellId === cell.cellId,
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
        v-bind:key="e.summary"
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
import {
  startOfMonth,
  startOfWeek,
  getDaysInMonth,
  format,
  parseISO,
  getMonth,
} from 'date-fns';
import EventItem from './components/EventItem.vue';
import { EmptyEvent, ScheduledEvent } from './interfaces/scheduled-event.interface';
import { ScheduleEventCell } from './interfaces/scheduler-event-cell.interface';
import calculateSchedulerCells from './calculate-scheduler-cells';

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
      this.cells = calculateSchedulerCells(
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

.scheduler-cell.highlight {
  background: #55615a48 !important;
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
