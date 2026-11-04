const express = require('express');
const router = express.Router();

const employeeController = require('../src/controllers/employee.controller');

// Get all employees
router.get('/', employeeController.findAll);

// Add an employee
router.post('/', employeeController.create);

// Get one employee by ID
router.get('/:id', employeeController.findById);

// Update an employee
router.put('/:id', employeeController.update);

// Delete an employee
router.delete('/:id', employeeController.delete);

module.exports = router;