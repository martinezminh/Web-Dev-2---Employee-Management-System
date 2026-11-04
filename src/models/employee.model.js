'use strict';

var dbConn = require('./../../config/db.config');

// Accepts 1/0, "1"/"0", true/false, "active"/"inactive"
// Returns 1, 0, undefined (not provided) or null (invalid)
function normalizeStatus(value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 1) return 1;
    if (value === false || value === 0) return 0;

    var v = String(value).trim().toLowerCase();
    if (v === '1' || v === 'true' || v === 'active') return 1;
    if (v === '0' || v === 'false' || v === 'inactive') return 0;

    return null;
}

//Employee object create
var Employee = function(employee) {
    this.first_name   = employee.first_name;
    this.last_name    = employee.last_name;
    this.email        = employee.email;
    this.phone        = employee.phone;
    this.organization = employee.organization;
    this.designation  = employee.designation;
    this.salary       = employee.salary;

    var status = normalizeStatus(employee.status);
    this.status = (status === undefined || status === null) ? 1 : status;

    this.created_at = new Date();
    this.updated_at = new Date();
};

Employee.normalizeStatus = normalizeStatus;

//create
Employee.create = function(newEmp, result) {
    dbConn.query("INSERT INTO employees set ?", newEmp, function(err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            console.log(res.insertId);
            result(null, res.insertId);
        }
    });
};

//query a single entry
Employee.findById = function(id, result) {
    dbConn.query("Select * from employees where id = ? ", id, function(err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

//query all entry
Employee.findAll = function(result) {
    dbConn.query("Select * from employees", function(err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            console.log('employees : ', res);
            result(null, res);
        }
    });
};

//update an entry (COALESCE keeps the old value for any field not sent)
Employee.update = function(id, employee, result) {
    dbConn.query(
        "UPDATE employees SET " +
        "first_name=COALESCE(?, first_name), " +
        "last_name=COALESCE(?, last_name), " +
        "email=COALESCE(?, email), " +
        "phone=COALESCE(?, phone), " +
        "organization=COALESCE(?, organization), " +
        "designation=COALESCE(?, designation), " +
        "salary=COALESCE(?, salary), " +
        "status=COALESCE(?, status), " +
        "updated_at=NOW() " +
        "WHERE id = ?",
        [
            employee.first_name,
            employee.last_name,
            employee.email,
            employee.phone,
            employee.organization,
            employee.designation,
            employee.salary,
            normalizeStatus(employee.status),
            id
        ],
        function(err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            } else {
                result(null, res);
            }
        }
    );
};

//remove an entry
Employee.delete = function(id, result) {
    dbConn.query("DELETE FROM employees WHERE id = ?", [id], function(err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

module.exports = Employee;