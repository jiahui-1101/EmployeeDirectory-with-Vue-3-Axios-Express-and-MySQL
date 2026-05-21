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

app.use(cors())
app.use(express.json())

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
