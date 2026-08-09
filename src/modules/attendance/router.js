import * as attendanceController from "./controller.js";
import express from "express";
const router = express.Router();

router.post("/scan", attendanceController.scanAttendance);
router.get("/today", attendanceController.todayAttendance);
//router.get("/");

