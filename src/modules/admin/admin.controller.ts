import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";


const getAllUsers = catchAsync(async (req: Request, res: Response,next: NextFunction) => {
  
    try {
        const query = {
            searchTerm: req.query.searchTerm as string,
            role: req.query.role as any,
            status: req.query.status as any,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const users = await adminService.getAllUsersFromDb(query);

        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch users',
        });
    }

});

export const adminController = {
    getAllUsers,
};