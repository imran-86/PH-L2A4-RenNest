import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register",userController.registerUser);
router.patch("/me",auth(),userController.updateUserProfile)


export const userRoutes = router;