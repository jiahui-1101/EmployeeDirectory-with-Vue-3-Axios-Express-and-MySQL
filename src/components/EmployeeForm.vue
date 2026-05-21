<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  editingEmployee: {
    type: Object,
    default: null
  },
  serverErrors: {
    type: Object,
    default: () => ({})
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations']
const empIdPattern = /^EMP[0-9]{3,5}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function blankEmployee() {
  return {
    empId: '',
    name: '',
    email: '',
    department: '',
    position: '',
    hireDate: '',
    salary: null,
    active: true
  }
}

const form = ref(blankEmployee())
const errors = ref({})
const isEditing = computed(() => Boolean(props.editingEmployee))

watch(
  () => props.editingEmployee,
  (employee) => {
    form.value = employee
      ? {
          ...employee,
          active: Boolean(employee.active),
          salary: Number(employee.salary)
        }
      : blankEmployee()
    errors.value = {}
  },
  { immediate: true }
)

watch(
  () => props.serverErrors,
  (nextErrors) => {
    if (nextErrors && Object.keys(nextErrors).length) {
      errors.value = { ...errors.value, ...nextErrors }
    }
  },
  { deep: true }
)

function validateForm() {
  const nextErrors = {}
  const empId = form.value.empId.trim().toUpperCase()
  const name = form.value.name.trim()
  const email = form.value.email.trim()
  const position = form.value.position.trim()

  if (!empIdPattern.test(empId)) {
    nextErrors.empId = 'Use EMP followed by 3 to 5 digits, for example EMP108.'
  }

  if (name.length < 3) {
    nextErrors.name = 'Name must be at least 3 characters.'
  }

  if (!emailPattern.test(email)) {
    nextErrors.email = 'Enter a valid email address.'
  }

  if (!departments.includes(form.value.department)) {
    nextErrors.department = 'Choose a department.'
  }

  if (!position) {
    nextErrors.position = 'Position is required.'
  }

  if (!form.value.hireDate) {
    nextErrors.hireDate = 'Hire date is required.'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(`${form.value.hireDate}T00:00:00`)
    if (Number.isNaN(selectedDate.getTime())) {
      nextErrors.hireDate = 'Choose a valid hire date.'
    } else if (selectedDate > today) {
      nextErrors.hireDate = 'Hire date cannot be in the future.'
    }
  }

  if (
    form.value.salary === null ||
    Number.isNaN(Number(form.value.salary)) ||
    Number(form.value.salary) < 1500 ||
    Number(form.value.salary) > 50000
  ) {
    nextErrors.salary = 'Salary must be between RM 1,500 and RM 50,000.'
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function submitForm() {
  if (!validateForm()) return

  emit('save', {
    empId: form.value.empId.trim().toUpperCase(),
    name: form.value.name.trim(),
    email: form.value.email.trim().toLowerCase(),
    department: form.value.department,
    position: form.value.position.trim(),
    hireDate: form.value.hireDate,
    salary: Number(form.value.salary),
    active: Boolean(form.value.active)
  })

  if (!isEditing.value) {
    form.value = blankEmployee()
  }
}

function cancelEdit() {
  emit('cancel')
  form.value = blankEmployee()
  errors.value = {}
}
</script>

<template>
  <form class="employee-form" novalidate @submit.prevent="submitForm">
    <div class="section-heading">
      <p class="eyebrow">{{ isEditing ? 'Update record' : 'New employee' }}</p>
      <h2>{{ isEditing ? 'Edit Employee' : 'Add Employee' }}</h2>
    </div>

    <div class="form-grid">
      <label class="form-field">
        <span>Employee ID</span>
        <input
          v-model.trim="form.empId"
          type="text"
          placeholder="EMP108"
          :class="{ invalid: errors.empId }"
        />
        <small v-if="errors.empId">{{ errors.empId }}</small>
      </label>

      <label class="form-field">
        <span>Full Name</span>
        <input
          v-model.trim="form.name"
          type="text"
          placeholder="Employee full name"
          :class="{ invalid: errors.name }"
        />
        <small v-if="errors.name">{{ errors.name }}</small>
      </label>

      <label class="form-field">
        <span>Email</span>
        <input
          v-model.trim="form.email"
          type="email"
          placeholder="name@myhrpilot.test"
          :class="{ invalid: errors.email }"
        />
        <small v-if="errors.email">{{ errors.email }}</small>
      </label>

      <label class="form-field">
        <span>Department</span>
        <select v-model="form.department" :class="{ invalid: errors.department }">
          <option value="">Select department</option>
          <option v-for="department in departments" :key="department" :value="department">
            {{ department }}
          </option>
        </select>
        <small v-if="errors.department">{{ errors.department }}</small>
      </label>

      <label class="form-field">
        <span>Position</span>
        <input
          v-model.trim="form.position"
          type="text"
          placeholder="Job title"
          :class="{ invalid: errors.position }"
        />
        <small v-if="errors.position">{{ errors.position }}</small>
      </label>

      <label class="form-field">
        <span>Hire Date</span>
        <input
          v-model="form.hireDate"
          type="date"
          :class="{ invalid: errors.hireDate }"
        />
        <small v-if="errors.hireDate">{{ errors.hireDate }}</small>
      </label>

      <label class="form-field">
        <span>Salary (RM)</span>
        <input
          v-model.number="form.salary"
          type="number"
          min="1500"
          max="50000"
          step="100"
          placeholder="4500"
          :class="{ invalid: errors.salary }"
        />
        <small v-if="errors.salary">{{ errors.salary }}</small>
      </label>

      <label class="status-toggle">
        <input v-model="form.active" type="checkbox" />
        <span>Currently active employee</span>
      </label>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Employee' }}
      </button>
      <button
        v-if="isEditing"
        class="btn-secondary"
        type="button"
        :disabled="saving"
        @click="cancelEdit"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
