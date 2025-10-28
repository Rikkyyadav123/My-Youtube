import { Router } from "express";
import { loginuser, registeruser,logoutuser } from "../controller/user.controller.js";
import {upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverimage", maxCount: 1}
    ]),
    registeruser)

router.route("/login").post(loginuser) 
router.route("/logout").post(verifyJWT, logoutuser) 

export default router;
