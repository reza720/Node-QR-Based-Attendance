import express from "express";
import employeeRouter from "../modules/employee/router.js";
const router = express.Router();

router.use("/employees", employeeRouter);

export default router;

