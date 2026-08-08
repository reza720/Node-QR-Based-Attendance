import database from "./database/sequelize.js";
import app from "./app.js";
import env from "./config/env.js";

(async()=> {
    try{
        await database.authenticate();
        await database.sync({alter: true});
        console.log("Database conneted");

        const port = env.server.port || 5000;
        app.listen(port, ()=>{
            console.log(`Server is running on ${port}`);
        });
    }
    catch(err){
        console.error(err);
        process.exit(1);
    }
})();
