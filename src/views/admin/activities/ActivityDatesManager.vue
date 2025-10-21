<script setup>
import { reactive } from 'vue'
import { VueCal, addDatePrototypes } from 'vue-cal'
import 'vue-cal/style'

// https://antoniandre.github.io/vue-cal/date-prototypes
addDatePrototypes()

const events = reactive([
  {
    start: new Date(),
    end: new Date().addHours(1),
    title: 'Event 1'
  },
  {
    start: new Date().addHours(1),
    end: new Date().addHours(2),
    title: 'Event 2'
  },
  {
    start: new Date().addDays(1),
    end: new Date().addDays(1).addHours(1),
    title: 'Event 3'
  }
])
</script>

<template>
  <vue-cal
    :events="events"
    editable-events
    @ready="({ view }) => view.scrollToCurrentTime()"
  />
</template>

<style>
/* Override vue-cal height. */
.vuecal {height: 100%;}


/* GLOBAL UNRELATED STYLES */
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100vw;
  height: 100vh;
  padding: 12px;
}

#app {height: 100%;}
</style>
