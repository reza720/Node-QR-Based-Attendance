import {Sequelize} from "sequelize";
import env from "./env";

const sequelize = new Sequelize(
    env.database.dbName,
    env.database.dbUser,
    env.database.dbPassword,{
        host: env.database.dbHost,
        dialect: "mysql",
        logging: false
    }
);

export default sequelize;