import { Router } from "express";
import { adminController } from "./admin.controller";


const router = Router();
router.get("/users",adminController.getAllUsers);

export const adminRoutes = router;