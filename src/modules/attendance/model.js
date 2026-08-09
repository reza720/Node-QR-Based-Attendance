import sequelize from "../../database/sequelize.js";
import { DataTypes } from "sequelize";
import Employee from "../employee/model.js";

const Attendance = sequelize.define("Attendance",{
    id:{
        type:DataTypes.INTEGER, 
        autoIncrement:true, 
        primaryKey: true
    },
    employeeId:{
        type:DataTypes.INTEGER, 
        allowNull:false
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    checkInTime:{
        type:DataTypes.TIME,
        allowNull: false
    },
    checkOutTime:{
        type:DataTypes.TIME,
        allowNull: true
    }
},{
    timestamps: true
});

Attendance.belongsTo(Employee, {foreignKey:"employeeId", onDelete:"CASCADE", onUpdate:"CASCADE"});
Employee.hasMany(Attendance, {foreignKey:"employeeId"});

export default Attendance;