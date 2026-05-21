import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 8000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const method = config.method ? config.method.toUpperCase() : 'GET'
    console.log(`[Employee API] ${method} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 400) {
        error.userMessage = 'Please check the form fields and try again.'
      } else if (status === 404) {
        error.userMessage = 'The employee record could not be found.'
      } else if (status === 409) {
        error.userMessage = data?.error || 'This employee record already exists.'
      } else if (status >= 500) {
        error.userMessage = 'The server could not complete the request.'
      } else {
        error.userMessage = data?.error || 'The request could not be completed.'
      }
    } else if (error.request) {
      error.userMessage = 'Cannot reach the API server. Please start Express on port 3001.'
    } else {
      error.userMessage = 'An unexpected request error occurred.'
    }

    return Promise.reject(error)
  }
)

export async function getEmployees(params = {}) {
  const response = await apiClient.get('/employees', { params })
  return response.data
}

export async function getEmployee(id) {
  const response = await apiClient.get(`/employees/${id}`)
  return response.data
}

export async function createEmployee(employee) {
  const response = await apiClient.post('/employees', employee)
  return response.data
}

export async function updateEmployee(id, employee) {
  const response = await apiClient.put(`/employees/${id}`, employee)
  return response.data
}

export async function deleteEmployee(id) {
  await apiClient.delete(`/employees/${id}`)
}

export default apiClient
