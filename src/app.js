import exprss from "express";
import helmet from "helmet";
import hpp from "hpp";
import {globalErrorHandler} from "./middleware/globalErrorHandler.js";
import sessionMiddleware from "./config/sessionMiddleware.js";
import router from "./routes/index.js";

const app = exprss();

app.use(helmet());
app.use(hpp());
app.use(exprss.json());

app.use(sessionMiddleware);
app.use("/api", router);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use(globalErrorHandler);

export default app;

