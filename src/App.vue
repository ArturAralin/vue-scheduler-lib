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
import Vue from 'vue';
import parseISO from 'date-fns/parseISO';
import addMilliseconds from 'date-fns/addMilliseconds';
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
      {
        id: '222вфывыыфв',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 1',
      },
      {
        id: '2221111в',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 2',
      },
      {
        id: '222211221111в',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 3',
      },
      {
        id: '22221выв1221111в',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 4',
      },
      {
        id: '22221ввывыв1221111в',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 5',
      },
      {
        id: '22211121выв1221111в',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 6',
      },
      {
        id: '22211121выв12211чч11в',
        from: parseISO('2021-04-14'),
        to: parseISO('2021-04-14'),
        summary: 'between 7',
      },
    ],
  }),
  methods: {
    eventDragged(dragEvent: any) {
      this.events = this.events.map((e) => {
        if (e.id === dragEvent.eventId) {
          const diff = dragEvent.date.getTime() - e.from.getTime();

          return {
            ...e,
            from: addMilliseconds(e.from, diff),
            to: addMilliseconds(e.to, diff),
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
