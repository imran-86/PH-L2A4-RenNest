import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { UserStatus } from "../../../generated/prisma/enums";


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
const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status || ![UserStatus.ACTIVE, UserStatus.BANNED, UserStatus.UNBANNED].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be ACTIVE, BANNED, or UNBANNED',
            });
        }

        const updatedUser = await adminService.updateUserStatusInDb(userId as string, status);

        const statusMessage = status === UserStatus.ACTIVE ? 'unbanned' : 'banned';

        res.status(200).json({
            success: true,
            message: `User ${statusMessage} successfully`,
            data: updatedUser,
        });
    } catch (error: any) {
        if (error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update user status',
        });
    }
});

export const adminController = {
    getAllUsers,
    updateUserStatus,
};