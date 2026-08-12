import express from "express";
import * as employeeController from "./controller.js";
import upload from "../../config/multer.js";
import authRequired from "../../middleware/authRequired.js";

const router = express.Router();

router.use(authRequired);

router.post("/", employeeController.registerEmployee);
router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployee);
router.patch("/:id", upload.single("photo"), employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

router.post("/:id/photo", upload.single("photo"), employeeController.uploadPhoto);
router.post("/:id/qrcode", employeeController.generateNewQRcode);
router.get("/:id/attendance", employeeController.getEmployeeAttendances);

export default router;
