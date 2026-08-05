import sequelize from "../../database/sequelize.js";
import { DataTypes } from "sequelize";

const Employee = sequelize.define("Employee",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type:DataTypes.STRING,
        allowNull:false
    },
    photoURL:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    isActive: {
        type:DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    QRcodeTokenHash:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    QRcodePath:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},{
    timestamps: true
});

export default Employee;

