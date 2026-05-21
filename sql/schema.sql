CREATE DATABASE IF NOT EXISTS employee_directory
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE employee_directory;

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empId VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  department VARCHAR(50) NOT NULL,
  position VARCHAR(100) NOT NULL,
  hireDate DATE NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT chk_employee_salary CHECK (salary BETWEEN 1500 AND 50000),
  CONSTRAINT chk_employee_active CHECK (active IN (0, 1))
) ENGINE=InnoDB;

INSERT INTO employees
  (empId, name, email, department, position, hireDate, salary, active)
VALUES
  (
    'EMP101',
    'Lina Tan Mei Ling',
    'lina.tan@myhrpilot.test',
    'HR',
    'People Operations Executive',
    '2021-04-12',
    4300.00,
    1
  ),
  (
    'EMP102',
    'Daniel Lim Wei Jian',
    'daniel.lim@myhrpilot.test',
    'IT',
    'Systems Analyst',
    '2020-09-28',
    6900.00,
    1
  ),
  (
    'EMP103',
    'Farah Nadia Ismail',
    'farah.ismail@myhrpilot.test',
    'Finance',
    'Accounts Officer',
    '2022-02-07',
    5100.00,
    1
  ),
  (
    'EMP104',
    'Jason Goh Kai Sheng',
    'jason.goh@myhrpilot.test',
    'Marketing',
    'Brand Coordinator',
    '2023-06-19',
    3900.00,
    1
  ),
  (
    'EMP105',
    'Mira Aisyah Rahman',
    'mira.rahman@myhrpilot.test',
    'Operations',
    'Logistics Supervisor',
    '2019-11-04',
    6200.00,
    1
  ),
  (
    'EMP106',
    'Kumar Rajendran',
    'kumar.rajendran@myhrpilot.test',
    'IT',
    'Network Administrator',
    '2018-08-21',
    7400.00,
    0
  ),
  (
    'EMP107',
    'Chloe Ng Hui Wen',
    'chloe.ng@myhrpilot.test',
    'Finance',
    'Payroll Specialist',
    '2024-01-15',
    4800.00,
    1
  );
