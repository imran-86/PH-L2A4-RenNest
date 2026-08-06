import { Router } from "express";
import { propertyController } from "./property.controller";

const router = Router();

router.post("/properties", propertyController.createProperty);

export const propertyRoutes = router;