import * as employeeService from "./service.js"


// register
// input: firstName and lastName from req.body
// output: success, status code, message, data
export const registerEmployee = async (req, res, next) => {
    try{
        const employee = await employeeService.registerEmployee(req.body);
        res.status(201).json({
            success: true,
            message: "Employee Registered",
            employee
        });
    }
    catch(err){
        next(err);
    }
};
// Photo upload: 
// input: id from req.param, file from req.file
// output: success, status code, message, file path
export const uploadPhoto = async (req, res, next) => {
    try{
        const photoURL = await employeeService.uploadPhoto(req.params.id, req.file);
        res.status(200).json({
            success: true,
            message: "Photo uploaded",
            photoURL
        })
    }
    catch(err){
        next(err);
    }
};
// read one emplyee:
// input: id from req.param
// output: success, status code, message, data
export const getEmployee = async (req, res, next) => {
    try{
        const employee = await employeeService.getEmployee(req.params.id);
        res.status(200).json({
            success: true,
            message: "Employee data fetched",
            employee
        });
    }
    catch(err){
        next(err);
    }
}
// update employee:
// input: id from req.param, data(firstName, lastName, status)from req.body,  photo from req.file
// output: success, status code, message, data
export const updateEmployee = async (req, res, next) => {
    try{
        const employeeId = req.params.id;
        const data = req.body;
        const file = req.file;
        const employee = await employeeService.updateEmployee(employeeId, data, file);
        res.status(200).json({
            success: true,
            message: "Employee data updated",
            employee
        });
    }
    catch(err){
        next(err);
    }
};
// delete employee: 
// input: id from req.param
// output: success, status code, message
export const deleteEmployee = async (req, res, next) => {
    try{
        await employeeService.deleteEmployee(req.params.id);
        res.status(200).json({
            success: true,
            message: "Employee deleted"
        });
    }
    catch(err){
        next(err);
    }
};
// geneate new QR
// input: id from req.param
// output: success, status code, message, qrcode path
export const generateNewQRcode = async (req, res, next) => {
    try{
        const employee = await employeeService.generateNewQRcode(req.params.id);
        res.status(200).json({
            success: true,
            message: "New QR code generated",
            employee
        });
    }
    catch(err){
        next(err);
    }
};
// Read all employees:
// Input: query parameters from req.query
// Supports: pagination, searching, filtering, sorting, field selection
// Output: success, status code, message, data, pagination
export const getEmployees = async (req, res, next) => {
    try {
        const employees = await employeeService.getEmployees({
            page: req.query.page,
            sort: req.query.sort,
            fields: req.query.fields,
            filter: {isActive: req.query.isActive},
            search: req.query.search
        });
    
        res.status(200).json({
            success: true,
            message: "Employees fetched",
            employees
        });
    } catch (err) {
        next(err);
    }
};






