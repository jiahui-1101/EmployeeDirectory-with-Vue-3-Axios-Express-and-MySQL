<script setup>
import { ref, watch } from 'vue'

defineProps({
  totalActive: {
    type: Number,
    default: 0
  },
  totalAll: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['search'])

const q = ref('')
const sortBy = ref('empId')
const order = ref('asc')

watch([q, sortBy, order], () => {
  emit('search', {
    q: q.value.trim(),
    sortBy: sortBy.value,
    order: order.value
  })
})

function clearFilters() {
  q.value = ''
  sortBy.value = 'empId'
  order.value = 'asc'
}
</script>

<template>
  <div class="directory-controls">
    <div class="headcount">
      <p class="eyebrow">Directory status</p>
      <strong>{{ totalActive }}</strong>
      <span>active of {{ totalAll }} total</span>
    </div>

    <div class="control-grid">
      <label class="search-field">
        <span>Search</span>
        <input
          v-model.trim="q"
          type="search"
          placeholder="Name, ID, email, or department"
          :disabled="loading"
        />
      </label>

      <label class="search-field">
        <span>Sort by</span>
        <select v-model="sortBy" :disabled="loading">
          <option value="empId">Employee ID</option>
          <option value="name">Name</option>
          <option value="hireDate">Hire Date</option>
          <option value="salary">Salary</option>
          <option value="department">Department</option>
        </select>
      </label>

      <label class="search-field">
        <span>Order</span>
        <select v-model="order" :disabled="loading">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>

      <button class="btn-secondary control-button" type="button" @click="clearFilters">
        Clear
      </button>
    </div>
  </div>
</template>
