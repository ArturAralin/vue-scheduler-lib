<template>
  <div id="app">
    <Scheduler
      :events="events"
      @eventDragged="eventDragged"
      month="2021-04"
    />
  </div>
</template>

<script lang="ts">
import { parseISO } from 'date-fns';
import addDays from 'date-fns/addDays';
import getDate from 'date-fns/getDate/index';
import Vue from 'vue';
import Scheduler from './vue-scheduler/Scheduler.vue';

// // eslint-disable-next-line
// // @ts-ignore
// import Scheduler from 'vue-scheduler-lib';
// import 'vue-scheduler-lib/dist/Scheduler.vue.css';

export default Vue.extend({
  name: 'App',
  components: {
    Scheduler,
  },
  data: () => ({
    events: [
      {
        id: '12ssss3',
        from: parseISO('2021-04-16'),
        to: parseISO('2021-04-16'),
        summary: 'Поездка в Тихорецк',
      },
      {
        id: '123',
        from: parseISO('2021-04-09'),
        to: parseISO('2021-04-10'),
        summary: 'first',
      },
      {
        id: '321',
        from: parseISO('2021-04-09'),
        to: parseISO('2021-04-11'),
        summary: 'second',
      },
      {
        id: '1232423',
        from: parseISO('2021-04-09'),
        to: parseISO('2021-04-13'),
        summary: 'really big',
      },
      {
        id: '222',
        from: parseISO('2021-04-10'),
        to: parseISO('2021-04-10'),
        summary: 'between',
      },
    ],
  }),
  methods: {
    eventDragged(dragEvent: any) {
      this.events = this.events.map((e) => {
        if (e.id === dragEvent.eventId) {
          const diff = getDate(dragEvent.date) - getDate(e.from);
          return {
            ...e,
            from: addDays(e.from, diff),
            to: addDays(e.to, diff),
          };
        }

        return e;
      });
    },
  },
});
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
}
</style>
