import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";


const registerUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    console.log("Data of register user" , payload);
    const user = await userService.registerUserIntoDB(payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: { user }
    })
})

const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized User',
            });
        }

        const { name, phone } = req.body;

        if (!name && phone === undefined) {
            return res.status(400).json({
                success: false,
                message: 'At least one field (name or phone) is required',
            });
        }

        const updatedUser = await userService.updateUserProfileIntoDb(userId, {
            name,
            phone,
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
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
            message: error.message || 'Failed to update profile',
        });
    }
};


export const userController = {
    registerUser,
    updateUserProfile
}