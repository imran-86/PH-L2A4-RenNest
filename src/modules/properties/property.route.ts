import { Router } from "express";
import { propertyController } from "./property.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/properties", 
    auth(Role.LANDLORD),
    propertyController.createProperty);

router.patch("/:propertyId",
    auth(Role.LANDLORD),
    propertyController.updateProperty);
router.delete("/:propertyId",
    auth(Role.LANDLORD),
    propertyController.deleteProperty);

router.get("/", propertyController.getAllProperties);
router.get("/:propertyId", propertyController.getSingleProperty);



export const propertyRoutes = router;