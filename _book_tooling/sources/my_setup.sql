CREATE DATABASE IF NOT EXISTS company;
USE company;

CREATE TABLE departments (
    dept_id   INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(30) NOT NULL UNIQUE,
    location  VARCHAR(30) DEFAULT 'Remote'
);

CREATE TABLE employees (
    emp_id     INT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    dept_id    INT,
    salary     INT NOT NULL,
    hire_date  DATE NOT NULL,
    manager_id INT,
    email      VARCHAR(100) UNIQUE,
    CHECK (salary > 0),
    FOREIGN KEY (dept_id) REFERENCES departments (dept_id),
    FOREIGN KEY (manager_id) REFERENCES employees (emp_id)
);

INSERT INTO departments (dept_name, location) VALUES
    ('IT', 'Bengaluru'), ('HR', 'Mumbai'), ('Ops', 'Pune'), ('Finance', 'Kolkata');

INSERT INTO employees VALUES
    (101, 'Asha',  1,    85000, '2019-06-12', NULL, 'asha@tcs.com'),
    (102, 'Ravi',  2,    50000, '2021-03-01', 101,  'ravi@gmail.com'),
    (103, 'Neha',  1,    71000, '2020-11-23', 101,  NULL),
    (104, 'Arjun', 2,    62000, '2018-01-15', 101,  'arjun@tcs.com'),
    (105, 'Sam',   3,    55000, '2022-08-30', 104,  'sam@yahoo.com'),
    (106, 'Zoya',  NULL, 48000, '2023-02-10', 104,  'zoya@tcs.com');
