import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { landlordController } from "./landlord.controller";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", auth(Role.LANDLORD), landlordController.getLandlordRentalRequests);
router.patch("/:requestId", auth(Role.LANDLORD), landlordController.updateRentalRequestStatus);
router.get(
    '/:propertyId',
    auth(Role.LANDLORD),
    landlordController.getPropertyRentalHistory
);

export const landlordRoutes = router;