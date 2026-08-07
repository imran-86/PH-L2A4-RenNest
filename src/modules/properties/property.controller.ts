import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

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

export const propertyController = {
    createProperty,
    updateProperty,
    deleteProperty,
}