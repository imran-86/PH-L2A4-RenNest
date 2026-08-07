import { Router } from "express";
import { authController } from "./auth.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/login", authController.loginUser);
router.get("/me",
    auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
    authController.getLoggedInUser);


export const authRoutes = router;