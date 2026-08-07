import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ICreateRentalRequest, IRentalRequestQuery } from "./rental_request.interface";
import { rentalRequestService } from "./rental_request.service";

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
    
    const tenantId = req.user?.id;

    const payload: ICreateRentalRequest = {
            propertyId: req.body.propertyId,
            moveInDate: req.body.moveInDate,
            moveOutDate: req.body.moveOutDate || null,
            message: req.body.message || null,
        };
    const rentalRequest = await rentalRequestService.createRentalRequest(payload, tenantId as string);

    res.status(201).json({
        success: true,
        message: "Rental request created successfully",
        data: rentalRequest,
    });
});

const getUserRentalRequests = async (req: Request, res: Response) => {
    
        const tenantId = req.user?.id;
        const query : IRentalRequestQuery = {
            status: req.query.status as any,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const rentalRequests = await rentalRequestService.getUsersRentalRequestsFromDB(tenantId as string, query);

        res.status(200).json({
            success: true,
            message: 'Rental requests fetched successfully',
            data: rentalRequests,
        });
   
};
const getRentalRequestById = catchAsync(async (req: Request, res: Response) => {
   
        const tenantId = req.user?.id;
        const { id } = req.params;

        const rentalRequest = await rentalRequestService.getRentalRequestByIdFromDB(id as string, tenantId as string);

        res.status(200).json({
            success: true,
            message: 'Rental request details fetched successfully',
            data: rentalRequest,
        });
    
    
});

export const rentalRequestController = {
    createRentalRequest,
    getUserRentalRequests,
    getRentalRequestById
};
