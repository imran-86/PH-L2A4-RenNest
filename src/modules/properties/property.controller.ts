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
export const propertyController = {
    createProperty,
}