import { Router } from "express";
import { propertyController } from "./property.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/properties", 
    auth(Role.LANDLORD),
    propertyController.createProperty);

export const propertyRoutes = router;