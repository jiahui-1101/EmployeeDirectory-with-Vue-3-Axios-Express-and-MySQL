<script setup>
defineProps({
  employees: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const currencyFormatter = new Intl.NumberFormat('ms-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 2
})

function formatSalary(value) {
  return currencyFormatter.format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <section class="panel">
    <div class="panel-body">
      <div class="section-heading">
        <p class="eyebrow">Employee records</p>
        <h2>Directory List</h2>
      </div>

      <div v-if="!employees.length && !loading" class="empty-state">
        No employee records found.
      </div>

      <div v-else class="table-scroll">
        <table class="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Position</th>
              <th>Hire Date</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="employee in employees"
              :key="employee.id"
              :class="{ 'is-inactive': !employee.active }"
            >
              <td>
                <strong>{{ employee.name }}</strong>
                <span class="employee-meta">{{ employee.empId }} - {{ employee.email }}</span>
              </td>
              <td>{{ employee.department }}</td>
              <td>{{ employee.position }}</td>
              <td>{{ formatDate(employee.hireDate) }}</td>
              <td class="salary-cell">{{ formatSalary(employee.salary) }}</td>
              <td>
                <span :class="employee.active ? 'badge badge-active' : 'badge badge-inactive'">
                  {{ employee.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button
                    class="btn-secondary btn-compact"
                    type="button"
                    @click="emit('edit', employee)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn-danger btn-compact"
                    type="button"
                    @click="emit('delete', employee)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
