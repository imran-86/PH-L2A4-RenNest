import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { authService } from "./auth.service";





const loginUser = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body;

    const {accessToken, refreshToken,id,name,email,role} = await authService.loginUser(payload);

    console.log("Access Token : ", accessToken);
    console.log("Refresh Token : ", refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly : true,
        secure : false,
        sameSite : "none",
        maxAge : 1000 * 60 * 60 * 24 // 24 hour or 1 day
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly : true,
        secure : false,
        sameSite : "none",
        maxAge : 1000 * 60 * 60 * 24 * 7 // 7 day
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: { accessToken, refreshToken , id,name,email,role}
    });
});
const getLoggedInUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
     try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No user found',
            });
        }

        const user = await authService.getLoggedInUserFromDB(userId);

        res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch user',
        });
    }
});
export const authController = {
    loginUser,
    getLoggedInUser
}