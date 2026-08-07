import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { landlordService } from "./lanlord.service";

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
export const landlordController = {
    getLandlordRentalRequests
};
