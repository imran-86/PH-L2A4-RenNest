import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rentalRequestController } from "./rental_request.controller";

const router = Router();

router.post("/",
    auth(Role.TENANT),
    rentalRequestController.createRentalRequest);

router.get("/",
    auth(Role.TENANT),
    rentalRequestController.getUserRentalRequests);

router.get("/:id",
    auth(Role.TENANT),
    rentalRequestController.getRentalRequestById);

export const rentalRequestRoutes = router;