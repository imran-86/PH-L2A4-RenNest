import { Router } from "express";
import { adminController } from "./admin.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";


const router = Router();
router.get("/users",
    auth(Role.ADMIN),
    adminController.getAllUsers);
router.patch("/users/:userId",auth(Role.ADMIN),adminController.updateUserStatus);

export const adminRoutes = router;