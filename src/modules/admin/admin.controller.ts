import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { UserStatus } from "../../../generated/prisma/enums";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";


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
const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            searchTerm: req.query.searchTerm as string,
            type: req.query.type as any,
            status: req.query.status as any,
            city: req.query.city as string,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const properties = await adminService.getAllPropertiesForAdmin(query);

        res.status(200).json({
            success: true,
            message: 'Properties fetched successfully',
            data: properties,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch properties',
        });
    }
});


const getAllRentalRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            status: req.query.status as any,
            propertyId: req.query.propertyId as string,
            tenantId: req.query.tenantId as string,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const rentalRequests = await adminService.getAllRentalRequestsForAdmin(query);

        res.status(200).json({
            success: true,
            message: 'Rental requests fetched successfully',
            data: rentalRequests,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch rental requests',
        });
    }
});
const createCategory = catchAsync(async (req : Request,res : Response,next : NextFunction)=>{
    const payload = req.body;
     try{
         const category = await adminService.createCategoryIntoDb(payload)
         sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: { category }
    })

     }catch(error : any){
       if (error.message === "This category is exist in our database , Please create new category") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create user category',
        });
     }
})
const getAllCategory = async(req : Request , res : Response)=>{
   
     try{
         const category = await adminService.getAllCategoryFromDb()
         sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Category fetch successfully",
        data: { category }
    })

     }catch(error : any){
       if (error.message === "We have no category yet , please create category first") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch category',
        });
     }
}
const deleteCategoryById = async(req : Request,res : Response)=>{
    const {categoryId }= req.params
    try{
        const category = await adminService.deleteCategoryByIdFromDb(categoryId as string);
       sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `Category ${category.name} deleted successfully`,
        data: { category }
    })
    }catch(error : any){
        if(error.message === "This category do not exist in our database"){
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
         res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete category',
        });

    }
}
export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentalRequests,
    createCategory,
    getAllCategory,
    deleteCategoryById,
};