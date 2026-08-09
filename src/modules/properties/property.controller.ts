import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";

const createProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body;
    console.log("Data of create property" , payload);
    const property = await propertyService.createPropertyIntoDB(payload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property created successfully",
        data: { property }
    })
})

const updateProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const propertyId = req.params.propertyId;
    const payload = req.body;
    const landlordId = req.user?.id;
    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }
    const property = await propertyService.updatePropertyIntoDB(propertyId as string, payload,landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: { property }
    })
})

const deleteProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const propertyId = req.params.propertyId;
    const landlordId = req.user?.id;

    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    const property = await propertyService.deletePropertyFromDB(propertyId as string, landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: { property }
    })
})

const getAllProperties = async (req: Request, res: Response) => {
    try {
        
        const query = {
            searchTerm: req.query.searchTerm as string,
            location: req.query.location as string,
            city: req.query.city as string,
            type: req.query.type as any,
            status: req.query.status as any,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
            bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
            bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
            sortBy: req.query.sortBy as string,
            sortOrder: req.query.sortOrder as 'asc' | 'desc',
        };

        const properties = await propertyService.getAllPropertiesFromDB(query);

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
};

const getSingleProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const propertyId = req.params.propertyId;

    const property = await propertyService.getSinglePropertyFromDB(propertyId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property fetched successfully",
        data: { property }
    })
})

export const propertyController = {
    createProperty,
    updateProperty,
    deleteProperty,
    getAllProperties,
    getSingleProperty
}