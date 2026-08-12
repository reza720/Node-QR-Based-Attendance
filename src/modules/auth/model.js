import sequelize from "../../database/sequelize.js";
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true
    },
    passwordHash:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: true
});

export default User;