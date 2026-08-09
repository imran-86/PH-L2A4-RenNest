import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { landlordService } from "./lanlord.service";
import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { log } from "console";
const getLandlordRentalRequests = catchAsync(async (req: Request, res: Response,next : NextFunction) => {
  

        const landlordId = req.user?.id;

        const query = {
            status: req.query.status as any,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const rentalRequests = await landlordService.getLandlordRentalRequestsFromDB(landlordId as string, query);

        res.status(200).json({
            success: true,
            message: 'Rental requests fetched successfully',
            data: rentalRequests,
        });
    
});
const updateRentalRequestStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const landlordId = req.user?.id;

        const { requestId } = req.params;
        console.log("Request ID:", requestId);
        const { status } = req.body;

        if (!status || ![RentalRequestStatus.APPROVED, RentalRequestStatus.REJECTED].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be APPROVED or REJECTED',
            });
        }

        const updatedRequest = await landlordService.updateRentalRequestStatus(requestId as string, landlordId as string, status);

        const statusMessage = status === RentalRequestStatus.APPROVED ? 'approved' : 'rejected';

        res.status(200).json({
            success: true,
            message: `Rental request ${statusMessage} successfully`,
            data: updatedRequest,
        });
    } catch (error: any) {
        if (error.message === 'Rental request not found') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === 'You are not authorized to update this request') {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message.includes('already')) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update rental request',
        });
    }
});
const getPropertyRentalHistory = async (req: Request, res: Response) => {
    try {
        const landlordId = req.user?.id;

        if (!landlordId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: 'Property ID is required',
            });
        }

        const result = await landlordService.getPropertyRentalHistoryFromDB(propertyId as string, landlordId);

        res.status(200).json({
            success: true,
            message: 'Rental history and reviews fetched successfully',
            data: result,
        });
    } catch (error: any) {
        if (error.message === 'Property not found or you are not the owner') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch rental history',
        });
    }
};


export const landlordController = {
    getLandlordRentalRequests,
    updateRentalRequestStatus,
    getPropertyRentalHistory
};
