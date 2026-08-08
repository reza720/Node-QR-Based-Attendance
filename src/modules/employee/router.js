import express from "express";
import * as employeeController from "./controller.js";
import upload from "../../config/multer.js";

const router = express.Router();

router.post("/", employeeController.registerEmployee);
router.get("/", employeeController.getEmployees);
router.get("/:id", employeeController.getEmployee);
router.patch("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

router.post("/:id/photo", upload.single("photo"), employeeController.uploadPhoto);
router.post("/:id/qrcode", employeeController.generateNewQRcode);
//router.get("/:id/attendance");

export default router;
