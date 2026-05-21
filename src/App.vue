<script setup>
const student = {
  name: 'Wong Jia Hui',
  matric: 'A24CS0312'
}
</script>

<template>
  <main class="app-shell">
    <section>
      <p class="eyebrow">Chapter 8 Individual Assignment</p>
      <h1>Employee Directory</h1>
      <p>
        Vue 3, Axios, Express and MySQL application prepared by
        {{ student.name }} ({{ student.matric }}).
      </p>
    </section>
  </main>
</template>
