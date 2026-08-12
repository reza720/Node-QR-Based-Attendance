import * as userController from "./controller.js";
import express from "express";
import authRequired from "../../middleware/authRequired.js";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", authRequired, userController.logout);
router.patch("/update", authRequired, userController.updateUser);

export default router;