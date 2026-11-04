'use strict';

const Employee = require('../models/employee.model');

// Get all employees
exports.findAll = function(req, res) {
    Employee.findAll(function(err, employees) {
        if (err) {
            return res.status(500).json({ error: true, message: err.message });
        }
        res.json({ status: 200, data: employees });
    });
};

// Add an employee
exports.create = function(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: true,
            message: 'Please provide all required fields'
        });
    }

    if (Employee.normalizeStatus(req.body.status) === null) {
        return res.status(400).json({
            error: true,
            message: 'Invalid status. Use 1/0, true/false, or "active"/"inactive"'
        });
    }

    const new_employee = new Employee(req.body);

    Employee.create(new_employee, function(err, employee) {
        if (err) {
            return res.status(500).json({ error: true, message: err.message });
        }

        res.json({
            error: false,
            status: 200,
            message: 'Employee added successfully',
            data: employee
        });
    });
};

// Get employee by ID
exports.findById = function(req, res) {
    Employee.findById(req.params.id, function(err, employee) {
        if (err) {
            return res.status(500).json({ error: true, message: err.message });
        }
        res.json({ status: 200, data: employee });
    });
};

// Update employee
exports.update = function(req, res) {
    console.log('UPDATE BODY:', req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: true,
            message: 'Empty body. In Postman use Body > raw > JSON (not form-data)'
        });
    }

    if (Employee.normalizeStatus(req.body.status) === null) {
        return res.status(400).json({
            error: true,
            message: 'Invalid status. Use 1/0, true/false, or "active"/"inactive"'
        });
    }

    Employee.update(req.params.id, req.body, function(err, result) {
        if (err) {
            console.log('UPDATE ERROR:', err);
            return res.status(500).json({ error: true, message: err.message });
        }

        console.log('MYSQL UPDATE RESULT:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: 'Employee not found'
            });
        }

        res.json({
            error: false,
            message: 'Employee successfully updated',
            status: 200,
            affectedRows: result.affectedRows
        });
    });
};

// Delete employee
exports.delete = function(req, res) {
    Employee.delete(req.params.id, function(err, result) {
        if (err) {
            return res.status(500).json({ error: true, message: err.message });
        }

        res.json({
            error: false,
            message: 'Employee successfully deleted',
            status: 200
        });
    });
};