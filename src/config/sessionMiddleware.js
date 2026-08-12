import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
import sequelize from "../database/sequelize.js";
import env from "../config/env.js";

const sequelizeStore = connectSessionSequelize(session.Store);
const sessionStore = new sequelizeStore({
    db: sequelize,
    tableName: "sessions"
});
await sessionStore.sync();

const sessionMiddleware = session({
    secret: env.session.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
});

export default sessionMiddleware;


