import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3001)
const sortColumns = {
  name: 'name',
  hireDate: 'hireDate',
  salary: 'salary',
  department: 'department',
  empId: 'empId'
}
const departments = ['HR', 'IT', 'Finance', 'Marketing', 'Operations']
const empIdPattern = /^EMP[0-9]{3,5}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

app.use(cors())
app.use(express.json())

function normalizeEmployee(body) {
  return {
    empId: String(body.empId || '').trim().toUpperCase(),
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    department: String(body.department || '').trim(),
    position: String(body.position || '').trim(),
    hireDate: String(body.hireDate || '').trim(),
    salary: Number(body.salary),
    active: body.active === false || body.active === 0 || body.active === '0' ? 0 : 1
  }
}

function validateEmployee(employee) {
  const errors = {}

  if (!empIdPattern.test(employee.empId)) {
    errors.empId = 'Employee ID must use EMP followed by 3 to 5 digits.'
  }

  if (employee.name.length < 3) {
    errors.name = 'Name must be at least 3 characters.'
  }

  if (!emailPattern.test(employee.email)) {
    errors.email = 'A valid email address is required.'
  }

  if (!departments.includes(employee.department)) {
    errors.department = 'Please select a valid department.'
  }

  if (!employee.position) {
    errors.position = 'Position is required.'
  }

  if (!employee.hireDate) {
    errors.hireDate = 'Hire date is required.'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(`${employee.hireDate}T00:00:00`)
    if (Number.isNaN(selectedDate.getTime())) {
      errors.hireDate = 'Hire date must be a valid date.'
    } else if (selectedDate > today) {
      errors.hireDate = 'Hire date cannot be in the future.'
    }
  }

  if (Number.isNaN(employee.salary) || employee.salary < 1500 || employee.salary > 50000) {
    errors.salary = 'Salary must be between RM 1,500 and RM 50,000.'
  }

  return errors
}

function sendDuplicateError(error, res) {
  if (error.code !== 'ER_DUP_ENTRY') {
    return false
  }

  const duplicateField = String(error.sqlMessage || '').includes('email')
    ? 'email'
    : 'empId'

  res.status(409).json({
    error: duplicateField === 'email'
      ? 'Email already exists.'
      : 'Employee ID already exists.',
    field: duplicateField
  })
  return true
}

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      service: 'Employee Directory API',
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'Employee Directory API',
      database: 'unavailable'
    })
  }
})

app.get('/employees', async (req, res) => {
  try {
    const { q = '', sortBy = 'empId', order = 'asc' } = req.query
    const params = []
    const conditions = []

    if (String(q).trim()) {
      const like = `%${String(q).trim()}%`
      conditions.push(
        '(name LIKE ? OR empId LIKE ? OR email LIKE ? OR department LIKE ?)'
      )
      params.push(like, like, like, like)
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
    const safeColumn = sortColumns[sortBy] || 'empId'
    const safeOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC'
    const sql = `
      SELECT id, empId, name, email, department, position, hireDate, salary, active
      FROM employees
      ${whereClause}
      ORDER BY ${safeColumn} ${safeOrder}
    `

    const [rows] = await pool.execute(sql, params)
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to load employees.' })
  }
})

app.get('/employees/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, empId, name, email, department, position, hireDate, salary, active
       FROM employees
       WHERE id = ?`,
      [req.params.id]
    )

    if (!rows.length) {
      return res.status(404).json({ error: 'Employee not found.' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to load the employee record.' })
  }
})

app.post('/employees', async (req, res) => {
  const employee = normalizeEmployee(req.body)
  const errors = validateEmployee(employee)

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors })
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO employees
        (empId, name, email, department, position, hireDate, salary, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee.empId,
        employee.name,
        employee.email,
        employee.department,
        employee.position,
        employee.hireDate,
        employee.salary,
        employee.active
      ]
    )

    const [rows] = await pool.execute(
      `SELECT id, empId, name, email, department, position, hireDate, salary, active
       FROM employees
       WHERE id = ?`,
      [result.insertId]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    if (sendDuplicateError(error, res)) return
    console.error(error)
    res.status(500).json({ error: 'Unable to create employee.' })
  }
})

app.put('/employees/:id', async (req, res) => {
  const employee = normalizeEmployee(req.body)
  const errors = validateEmployee(employee)

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors })
  }

  try {
    const [result] = await pool.execute(
      `UPDATE employees
       SET empId = ?,
           name = ?,
           email = ?,
           department = ?,
           position = ?,
           hireDate = ?,
           salary = ?,
           active = ?
       WHERE id = ?`,
      [
        employee.empId,
        employee.name,
        employee.email,
        employee.department,
        employee.position,
        employee.hireDate,
        employee.salary,
        employee.active,
        req.params.id
      ]
    )

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Employee not found.' })
    }

    const [rows] = await pool.execute(
      `SELECT id, empId, name, email, department, position, hireDate, salary, active
       FROM employees
       WHERE id = ?`,
      [req.params.id]
    )

    res.json(rows[0])
  } catch (error) {
    if (sendDuplicateError(error, res)) return
    console.error(error)
    res.status(500).json({ error: 'Unable to update employee.' })
  }
})

app.delete('/employees/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM employees WHERE id = ?',
      [req.params.id]
    )

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Employee not found.' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unable to delete employee.' })
  }
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => {
  console.log(`Employee Directory API running on http://localhost:${port}`)
})
