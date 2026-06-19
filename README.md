# Employee Directory

Name: Wong Jia Hui  
Matric Number: A24CS0312  
Course: Cross Platform Application Development  
Assignment: Chapter 8 - Employee Directory with Vue 3, Axios, Express and MySQL

## Overview

This project is a single-page employee directory for a small HR office. The Vue 3 frontend communicates with an Express REST API through a centralized Axios service, and employee records are stored in MySQL using prepared statements.

## Features

- Add, view, edit, and delete employee records.
- Search employees by name, employee ID, email, or department.
- Sort employees by employee ID, name, hire date, salary, or department.
- Validate form input before sending requests.
- Show inline validation errors, loading state, error banner, empty state, and active/inactive status badges.
- Format salary values in Malaysian Ringgit.
- Use a responsive layout suitable for laptop and tablet screens.

## Requirements

- Node.js
- npm
- Laragon with MySQL running

## Database Setup

1. Open Laragon and start MySQL.
2. Open a MySQL client such as HeidiSQL, phpMyAdmin, or MySQL command line.
3. Run the script in `sql/schema.sql`.
4. The script creates the `employee_directory` database, creates the `employees` table, and inserts seven sample employee records.

The backend uses these default database settings:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=employee_directory
```

If your local MySQL password is different, create `server/.env` using `server/.env.example` as the template.

## Installation

Install dependencies once from the project root:

```bash
npm install
```

## Running the App

Start the Express API:

```bash
npm run server
```

The API runs at:

```text
http://localhost:3001
```

In another terminal, start the Vue app:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5174
```

## Useful API Endpoints

- `GET /employees`
- `GET /employees/:id`
- `GET /employees?q=it`
- `GET /employees?sortBy=salary&order=desc`
- `POST /employees`
- `PUT /employees/:id`
- `DELETE /employees/:id`

## Implementation Notes

- Vue uses the Composition API with `<script setup>`.
- The parent `App.vue` owns employee state, loading state, error messages, current filters, and edit mode.
- Child components communicate through props and emits.
- Axios is configured once in `src/api/employeeApi.js` with request and response interceptors.
- Express uses `mysql2/promise` and prepared statements for all dynamic values.
- Sort columns are whitelisted on the server before being used in `ORDER BY`.
- MySQL date values are returned as strings to keep `hireDate` in `YYYY-MM-DD` format.

## Final Submission

The final ZIP should be named:

```text
Chapter8_A24CS0312_WongJiaHui.zip
```

Do not include `node_modules/` or `dist/` in the ZIP archive.
