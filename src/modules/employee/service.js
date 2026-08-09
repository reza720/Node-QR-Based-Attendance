import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import qrcode from "qrcode";
import crypto from "node:crypto";
import { Op } from "sequelize";
import sequelize from "../../database/sequelize.js";

import Employee from "./model.js";
import throwError from "../../utils/throwError.js"
import deleteFile from "../../utils/deleteFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QRcodeDir = path.join(__dirname, "../../../storage/QRcodes");

// register: 
// input: firstName, lastName
// output: employee registed in DB, QR generated, data returned
export const registerEmployee = async ({ firstName, lastName }) => {
    const transaction = await sequelize.transaction();
    let qrPath = null;
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
// upload photo
// input: employeeId, file
// output: photo is upload and path is stored in db, retunr file back front end
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
// Delete employee
// input: id
// output: deleted in DB
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
// Generate new QR
// input: employee id
// output: new token generated hashed replaced for the past one, QR generated from new one
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
// Read all employees
// input: query parameters, handle all 5 query parameters
// output: employees list + pagination metadata
export const getEmployees = async (options = {}) => {
    const {
        page = 1,
        sort = "lastName:asc",
        fields,
        filter = {},
        search
    } = options;

    const { limit, offset } = buildPagination(page);
    const attributes = buildAttributes(fields);
    const where = buildWhere(filter, search);
    const order = buildOrder(sort);
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

// Pagination
const buildPagination = (page) => {
    const limit = 25;
    const offset = (page - 1) * limit;
    return {
        limit,
        offset
    }
};

// Field Selection
const buildAttributes = (fields) => {
    const allowedFields=["id","firstName","lastName","photoURL","isActive","createdAt","updatedAt"];
    if(!fields){
        return allowedFields;
    }

    return fields
        .split(",")
        .map(field => field.trim())
        .filter(field => allowedFields.includes(field));
}

// Filter
const buildFilter = (filter) => {
    const where = {};

    if (filter.isActive !== undefined) {
        where.isActive = filter.isActive === "true";
    }
    return where;
};

// Search
const buildSearch = (search) => {
    if (!search) return {};

    return {
        [Op.or]: [
            {
                firstName: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                lastName: {
                    [Op.like]: `%${search}%`
                }
            }
        ]
    };
};

// Sorting
const buildOrder = (sort) => {
    const allowedSortFields = ["lastName","firstName","createdAt","updatedAt"];

    const [field, direction] = sort.split(":");
    if (!allowedSortFields.includes(field)) {
        return [["lastName", "ASC"]];
    }

    return [[
        field,
        direction?.toUpperCase() === "DESC"
            ? "DESC"
            : "ASC"
    ]];
};



