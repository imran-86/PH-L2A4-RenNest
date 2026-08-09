import { Router } from "express";
import { adminController } from "./admin.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";


const router = Router();
router.get("/users",
    auth(Role.ADMIN),
    adminController.getAllUsers);
router.patch("/users/:userId",auth(Role.ADMIN),adminController.updateUserStatus);

router.get("/properties",auth(Role.ADMIN),adminController.getAllProperties);
router.get("/rentals",auth(Role.ADMIN),adminController.getAllRentalRequests);
router.post("/create-category",auth(Role.ADMIN),adminController.createCategory)
router.get("/category",)

export const adminRoutes = router;