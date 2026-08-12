import * as attendanceController from "./controller.js";
import authRequired from "../../middleware/authRequired.js";
import express from "express";

const router = express.Router();

router.use(authRequired);

router.post("/scan", attendanceController.scanAttendance);
router.get("/today", attendanceController.getTodayAttendance);
router.get("/", attendanceController.getAttendances);

export default router;


