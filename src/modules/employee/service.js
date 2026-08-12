import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import qrcode from "qrcode";
import crypto from "node:crypto";
import { Model, Op } from "sequelize";
import sequelize from "../../database/sequelize.js";

import Employee from "./model.js";
import throwError from "../../utils/throwError.js"
import deleteFile from "../../utils/deleteFile.js";
import Attendance from "../attendance/model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QRcodeDir = path.join(__dirname, "../../../storage/QRcodes");

// Register:
// Input: firstName, lastName
// Output: Employee registered in the database,
// QR code generated, newly registered employee data returned
export const registerEmployee = async ({ firstName, lastName }) => {
    const transaction = await sequelize.transaction();
    console.log("Transaction starts");
    let qrPath = null;
    console.log("qr path ==", qrPath);
    try {
        const { token, tokenHash } = generateToken();
        const employee = await Employee.create(
            {
                firstName,
                lastName,
                QRcodeTokenHash: tokenHash
            },
            { transaction }
        );
        qrPath = await generateQRcode(token);
        await employee.update(
            {
                QRcodePath: qrPath
            },
            { transaction }
        );
        await transaction.commit();

        return {
            id: employee.id,
            fullName: `${employee.firstName} ${employee.lastName}`,
            isActive: employee.isActive,
            QRcodePath: qrPath
        };
    } catch (error) {
        await transaction.rollback();
        if (qrPath) {
            await fs.unlink(qrPath).catch(() => {});
        }
        throw error;
    }
};
// Upload Photo:
// Input: employeeId, file
// Output: Photo uploaded, file path stored in the database,
// and file data returned to the frontend
export const uploadPhoto = async (employeeId, file) => {
    if(!file) throwError("File not found", 400);

    const employee = await Employee.findByPk(employeeId);
    if(!employee) {
        await deleteFile(file.path);
        throwError("Employee not found", 404);
    }

    const oldFilePath = employee.photoURL;
    try{
        await employee.update({
            photoURL: file.path
        });
    }
    catch(err){
        await deleteFile(file.path);
        throw err;
    }
    
    if(oldFilePath){
        await deleteFile(oldFilePath);
    }

    return employee.photoURL;
}
// Get One Employee:
// Input: employeeId
// Output: Full employee data
export const getEmployee = async (employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);

    return {
        id: employee.id,
        fullName: employee.firstName +" "+ employee.lastName,
        photoURL: employee.photoURL,
        isActive: employee.isActive,
        QRcode: employee.QRcodePath
    };
}
// Update One Employee:
// Input: employee new Data
// Output: Employee data updated in the database
export const updateEmployee = async (employeeId, data, file) => {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
        throwError("Employee not found", 404);
    }
    const updateData = {};
    if (data.firstName !== undefined) {
        updateData.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
        updateData.lastName = data.lastName;
    }
    if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
    }
    const oldPhotoPath = employee.photoURL;
    if (file) {
        updateData.photoURL = file.path;
        try {
            await employee.update(updateData);
            if (oldPhotoPath) {
                await deleteFile(oldPhotoPath);
            }
        } catch (err) {
            await deleteFile(file.path);
            throw err;
        }
    } else {
        await employee.update(updateData);
    }
    return {
        id: employee.id,
        fullName: employee.firstName + " " + employee.lastName,
        photoURL: employee.photoURL,
        isActive: employee.isActive,
        QRcode: employee.QRcodePath
    };
};
// Delete Employee:
// Input: employeeId
// Output: Employee deleted from the database
export const deleteEmployee = async (employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);
    
    const {QRcodePath, photoURL} = employee;
    await employee.destroy();
    if(QRcodePath){
        await deleteFile(QRcodePath);
    }
    if(photoURL){
        await deleteFile(photoURL);
    }
}
// Generate New QR:
// Input: employeeId
// Output: New token generated, hashed token replaces the previous one,
// and a new QR code is generated
export const generateNewQRcode = async (employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throwError("Employee not found", 404);

    const { token, tokenHash } = generateToken();
    const newQRcodePath = await generateQRcode(token);

    const oldQRcodePath = employee.QRcodePath;
    try {
        await employee.update({
            QRcodeTokenHash: tokenHash,
            QRcodePath: newQRcodePath
        });
        if (oldQRcodePath) {
            await deleteFile(oldQRcodePath);
        }
    } catch (err) {
        await deleteFile(newQRcodePath);
        throw err;
    }
    return {
        id: employee.id,
        fullName: employee.firstName + " " + employee.lastName,
        photoURL: employee.photoURL,
        isActive: employee.isActive,
        QRcodePath: employee.QRcodePath
    };
};
// Get All Employees:
// Input: pagination, sorting by firstName (ASC by default), isActive filter,
// search by firstName or lastName
// Output: Employee list with pagination metadata
export const getEmployees = async (options = {}) => {
    const {
        page = 1,
        limit = 30,
        isActive,
        search
    } = options;

    const offset = (page - 1) * limit;
    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive;
    }
    if (search) {
        where[Op.or] = [
            {firstName: {[Op.like]: `%${search}%`}},
            {lastName: {[Op.like]: `%${search}%`}}
        ];
    }

    const employees = await Employee.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [["firstName", "ASC"]]
    });

    return {
        page: Number(page),
        limit: Number(limit),
        totalRecords: employees.count,
        totalPages: Math.ceil(employees.count / limit),
        employees: employees.rows
    };
};

// Get Employee Attendance
// Input: EmployeeId
// Output: All Attendance of an Employee 
export const getEmployeeAttendances = async (employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);

    const employeeAttendances = await Attendance.findAll({
        where: {
            employeeId
        },
        include: [
            {
                model: Employee,
                attributes: [
                    "id",
                    "firstName",
                    "lastName"
                ]
            }
        ],
        attributes: [
            "date",
            "checkInTime",
            "checkOutTime"
        ]
    });
    if(employeeAttendances.length === 0) throwError("Employee has no attendance", 400);

    return employeeAttendances;
};


// ------------ Helper Functions ---------------

// Generate QR code
async function generateQRcode(token){
    await fs.mkdir(QRcodeDir, {recursive: true});
    const qrPath = path.join(QRcodeDir, `${token}.png`);
    await qrcode.toFile(qrPath, token);
    return qrPath;
}

// Generate Token
function generateToken(){
    const token = crypto.randomBytes(16).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    return {
        token,
        tokenHash
    }
};



