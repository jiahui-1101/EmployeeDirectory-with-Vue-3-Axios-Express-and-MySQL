<script setup>
const student = {
  name: 'Wong Jia Hui',
  matric: 'A24CS0312'
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <section>
          <p class="eyebrow">Chapter 8 Individual Assignment</p>
          <h1>Employee Directory</h1>
          <p class="subtitle">
            A single-page HR tool built with Vue 3, Axios, Express and MySQL.
          </p>
        </section>

        <aside class="student-card" aria-label="Student information">
          <strong>{{ student.name }}</strong>
          <span>{{ student.matric }}</span>
        </aside>
      </div>
    </header>

    <main class="app-main">
      <section class="panel">
        <div class="panel-body">
          <h2>Ready for Employee Records</h2>
          <p>
            The employee form, search controls, and directory table will be added in
            the next implementation steps.
          </p>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>Cross Platform Application Development - Chapter 8</p>
    </footer>
  </div>
</template>
