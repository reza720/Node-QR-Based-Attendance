import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import qrcode from "qrcode";
import crypto from "node:crypto";
import { Op } from "sequelize";

import Employee from "./model.js";
import * as throwError from "../../utils/throwError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QRcodeDir = path.join(__dirname, "../../../storage/QRcodes");

// register: 
// input: firstName, lastName
// output: employee registed in DB, QR generated, data returned
export const registerEmployee = async ({firstName, lastName}) => {
    const {token, tokenHash} = generateToken();
    const qrPath = await generateQRcode(token);

    const employee = await Employee.create({
        firstName, 
        lastName,
        QRcodeTokenHash: tokenHash,
        QRcodePath: qrPath
    });

    return {
        id: employee.id,
        fullName: employee.firstName +" "+ employee.lastName,
        isActive: employee.isActive,
        QRcodePath: employee.QRcodePath
    };
};
// upload photo
// input: employeeId, file
// output: photo is upload and path is stored in db, retunr file back front end
export const uploadPhoto = async (employeeId, file) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);
    if(!file) throwError("File is required", 400);

    await employee.update({
        photoURL: file.path
    });

    return employee.photoURL;
}
// read one emplyee
// input: employee id
// output: full data of employee
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
// update one employee: 
// input: id from params, data(names, photo, isActive) from body
// output: update happend in the DB
export const updateEmployee = async (employeeId, data, file) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);

    const updateData = {};
    if(data.firstName !== undefined){
        updateData.firstName = data.firstName;
    }
    if(data.lastName !== undefined){
        updateData.lastName = data.lastName;
    }
    if(data.isActive !== undefined){
        updateData.isActive = data.isActive;
    }
    if(file){
        updateData.photoURL = file.path;
    }
    
    await employee.update(updateData);

    return {
        id: employee.id,
        fullName: employee.firstName +" "+ employee.lastName,
        photoURL: employee.photoURL,
        isActive: employee.isActive,
        QRcode: employee.QRcodePath
    };
};
// Delete employee
// input: id
// output: deleted in DB
export const deleteEmployee = async (employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);
    
    await employee.destroy();
}
// Generate new QR
// input: employee id
// output: new token generated hashed replaced for the past one, QR generated from new one
export const generateNewQRcode = async (employeeId) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throwError("Employee not found", 404);

    const {token, tokenHash} = generateToken();
    const newQRcodePath = await generateQRcode(token);

    await employee.update({
        QRcodeTokenHash: tokenHash
    });

    return {
        id: employee.id,
        fullName: employee.firstName +" "+ employee.lastName,
        photoURL: employee.photoURL,
        isActive: employee.isActive,
        QRcodePath: newQRcodePath
    };
};
// Read all employees
// input: query parameters, handle all 5 query parameters
// output: employees list + pagination metadata
export const getEmployees = async ({page = 1, sort = "lastName:asc", fields, filter = {}, search}) => {
    // Pagination
    const limit = 25;
    const offset = (page - 1) * limit;
    // Field selection
    const allowedFields = ["id","firstName","lastName","isActive","photoURL","createdAt","updatedAt"];
    let attributes = allowedFields;
    if(fields){
        attributes = fields.split(",").filter(field => allowedFields.includes(field));
    }
    // Filtering
    let where = {};
    if(filter.isActive !== undefined){
        where.isActive = filter.isActive === "true";
    }
    // Searching
    if(search){
        where[Op.or] = [
            {
                firstName:{
                    [Op.like]: `%${search}%`
                }
            },
            {
                lastName:{
                    [Op.like]: `%${search}%`
                }
            }
        ];

    }
    // Sorting
    let order = [["lastName","ASC"]];
    if(sort){
        const [field, direction] = sort.split(":");
        const allowedSortFields = ["lastName","firstName","createdAt","updatedAt"];
        if(allowedSortFields.includes(field)){
            order = [
                [
                    field,
                    direction?.toUpperCase() === "DESC"
                        ? "DESC"
                        : "ASC"
                ]
            ];
        }
    }
    const result = await Employee.findAndCountAll({
        attributes,
        where,
        limit,
        offset,
        order
    });
    return {
        page: Number(page),
        limit,
        totalRecords: result.count,
        totalPages: Math.ceil(result.count / limit),
        data: result.rows
    };
};

// Aggregation
// Input: nothing
// output: statistical Result
export const employeeStatistics = async () => {
    const totalEmployees = await Employee.count();
    const totalActive = await Employee.count({
        where:{
            isActive:true
        }
    });
    return {
        totalEmployees,
        totalActiveEmployees: totalActive
    };
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
