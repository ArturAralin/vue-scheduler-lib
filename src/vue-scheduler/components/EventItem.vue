<template>
  <div
    @click="onClick"
    @dblclick="onDobuleClick"
    @mouseover="mouseover"
    @dragstart="itemDragStart"
    @dragover="itemDragOver"
    @drop="itemDrop($event, cellId)"
    @dragenter.prevent
    @dragover.prevent
    :class="{
      'scheduler-event-item': true,
      'drag-highlight': event.empty && dragMode && dragOver,
    }"
    :style="eventItemStyles"
    draggable="true"
  >
    <div
      v-if="!event.empty"
      :class="{
        'scheduler-event-item-inner': true,
        'filled': true,
        'focused': focused,
        'active': active,
      }"
      :style="eventItemInnerStyles"
    >
      <span>{{summary}}</span>
    </div>
    <div
      v-if="event.empty"
      class="scheduler-event-item-inner empty"
    ></div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default Vue.extend({
  name: 'EventItem',
  data: () => ({
    dragged: null as null | Element,
    drag: false,
  }),
  props: {
    cellId: String,
    event: Object,
    focused: Boolean,
    active: Boolean,
    dragMode: Boolean,

    // events
    onClick: Function,
    onDobuleClick: Function,
    mouseover: Function,
    eventItemDragStart: Function,
    eventItemDragDrop: Function,
    eventItemDragOver: Function,
  },
  methods: {
    itemDragStart() {
      this.drag = true;
      this.eventItemDragStart(this.cellId, this.event.id);
    },
    itemDragOver() {
      this.eventItemDragOver(this.event.cellId);
    },
    itemDrop(e: any) {
      e.preventDefault();
      this.eventItemDragDrop(this.cellId);
    },
  },
  computed: {
    summary(): string {
      if (!this.event.headInCurrentRow && !this.drag) {
        return '‎‎';
      }

      return this.event.summary;
    },
    eventItemInnerStyles() {
      const calculateWidth = (): string => {
        if (this.event.head && this.event.tail) {
          return '94%';
        }

        if (this.event.tail) {
          return '100%';
        }

        if (this.event.headInCurrentRow || !this.event.tailInCurrentRow) {
          return '101%';
        }

        return '100%';
      };

      const calculateBorderRadius = (): string => {
        if (this.event.head && this.event.tail) {
          return '4px';
        }

        if (this.event.head) {
          return '4px 0 0 4px';
        }

        if (this.event.tail) {
          return '0 4px 4px 0';
        }

        return '0px';
      };

      const calculatePadding = (): string => {
        if (this.event.headInCurrentRow) {
          return '0 0 0 6px';
        }

        return '0';
      };

      return {
        width: calculateWidth(),
        'border-radius': calculateBorderRadius(),
        padding: calculatePadding(),
      };
    },
    eventItemStyles() {
      const calculateMargin = (): string => {
        if (this.event.head) {
          return '0 2px 4px 4px';
        }

        if (this.event.tail) {
          return '0 2px 4px -4px';
        }

        return '0 2px 4px 0';
      };

      return {
        margin: calculateMargin(),
      };
    },
  },
});
</script>

<style scoped>
.scheduler-event-item {
  /* display: inline-block; */
  position: relative;
  width: 100%;
  height: 18px;
  text-align: left;
  font-size: 14px;
}

.scheduler-event-item-inner {
  background: #276341;
}

.scheduler-event-item-inner.active {
  background: #2e965b;
}

/* .scheduler-event-item-inner.focused {
  background: violet;
} */
</style>
