import express from "express";
import * as employeeController from "./controller.js";
import upload from "../../config/multer.js";

const router = express.Router();

router.post("/employees", employeeController.registerEmployee);
//router.get("/employees");
router.get("/employees/:id", employeeController.getEmployee);
router.patch("/employees/:id", employeeController.updateEmployee);
router.delete("/employees/:id", employeeController.deleteEmployee);

router.post("/employees/:id/photo", upload.single("photo"), employeeController.uploadPhoto);
router.post("/employees/:id/qrcode", employeeController.generateNewQRcode);
router.get("/employees/statistics", employeeController.employeesStatistics);

export default router;