<script setup>
import { computed, onMounted, ref } from 'vue'
import EmployeeForm from './components/EmployeeForm.vue'
import EmployeeList from './components/EmployeeList.vue'
import SearchSort from './components/SearchSort.vue'
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee
} from './api/employeeApi.js'

const student = {
  name: 'Wong Jia Hui',
  matric: 'A24CS0312'
}

const employees = ref([])
const editingEmployee = ref(null)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const serverErrors = ref({})
const savedVersion = ref(0)
const filters = ref({
  q: '',
  sortBy: 'empId',
  order: 'asc'
})

const totalActive = computed(() =>
  employees.value.filter((employee) => Boolean(employee.active)).length
)

async function loadEmployees(nextFilters = filters.value) {
  loading.value = true
  errorMessage.value = ''
  filters.value = { ...nextFilters }

  try {
    employees.value = await getEmployees(filters.value)
  } catch (error) {
    errorMessage.value = error.userMessage || 'Unable to load employee records.'
  } finally {
    loading.value = false
  }
}

async function handleSave(employee) {
  saving.value = true
  errorMessage.value = ''
  serverErrors.value = {}

  try {
    if (editingEmployee.value) {
      await updateEmployee(editingEmployee.value.id, employee)
      editingEmployee.value = null
    } else {
      await createEmployee(employee)
    }

    await loadEmployees()
    savedVersion.value += 1
  } catch (error) {
    if (error.response?.status === 400 && error.response.data?.errors) {
      serverErrors.value = error.response.data.errors
    } else {
      errorMessage.value = error.userMessage || 'Unable to save the employee.'
    }
  } finally {
    saving.value = false
  }
}

function handleEdit(employee) {
  editingEmployee.value = { ...employee }
  serverErrors.value = {}
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleCancel() {
  editingEmployee.value = null
  serverErrors.value = {}
}

async function handleDelete(employee) {
  const confirmed = window.confirm(`Delete ${employee.name}? This cannot be undone.`)
  if (!confirmed) return

  errorMessage.value = ''

  try {
    await deleteEmployee(employee.id)
    await loadEmployees()
  } catch (error) {
    errorMessage.value = error.userMessage || 'Unable to delete the employee.'
  }
}

function handleSearch(nextFilters) {
  loadEmployees(nextFilters)
}

onMounted(() => {
  loadEmployees()
})
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
      <div v-if="loading" class="state-loading" role="status">
        Loading employee records...
      </div>

      <div v-if="errorMessage" class="state-error" role="alert">
        <span>{{ errorMessage }}</span>
        <button class="btn-dismiss" type="button" @click="errorMessage = ''">
          Dismiss
        </button>
      </div>

      <section class="panel">
        <div class="panel-body">
          <EmployeeForm
            :editing-employee="editingEmployee"
            :server-errors="serverErrors"
            :saving="saving"
            :saved-version="savedVersion"
            @save="handleSave"
            @cancel="handleCancel"
          />
        </div>
      </section>

      <section class="panel">
        <div class="panel-body">
          <SearchSort
            :total-active="totalActive"
            :total-all="employees.length"
            :loading="loading"
            @search="handleSearch"
          />
        </div>
      </section>

      <EmployeeList
        :employees="employees"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </main>

    <footer class="app-footer">
      <p>Cross Platform Application Development - Chapter 8</p>
    </footer>
  </div>
</template>
