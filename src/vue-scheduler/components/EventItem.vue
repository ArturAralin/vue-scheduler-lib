<template>
  <div
    @click="onClick"
    @dblclick="onDobuleClick"
    @mouseover="mouseover"
    @dragstart="itemDragStart"
    @dragend="itemDragEnd"
    @dragover="itemDragOver"
    @drop="itemDrop($event, cellId)"
    @dragenter.prevent
    @dragover.prevent
    class="scheduler-event-item"
    :style="eventItemStyles"
    draggable="true"
  >
    <div
      v-if="event.type === 'event'"
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
      v-if="event.type === 'empty'"
      class="scheduler-event-item-inner empty"
    ></div>
    <div
      v-if="event.type === 'info'"
      class="scheduler-event-item-inner info"
    >{{summary}}</div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import '../styles/event-item.scss';

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
    itemDragEnd() {
      this.drag = false;
    },
    itemDragOver() {
      this.eventItemDragOver(this.event.cellId);
    },
    itemDrop(e: MouseEvent) {
      e.preventDefault();
      this.eventItemDragDrop(this.cellId);
    },
  },
  computed: {
    summary(): string {
      if (!this.event.headInCurrentRow && !this.drag && this.event.type !== 'info') {
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
