import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";


export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error : ", err);

    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = err.message || "Internal Server Error";
    let errorName = err.name || "Internal Server Error";
    let errorDetails = err.stack;

   
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "You have provided incorrect field type or missing fields";
        errorName = "Prisma Validation Error";
    }

    
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = httpStatus.CONFLICT;
                errorMessage = `Duplicate key error. The value already exists.`;
                errorName = "Duplicate Key Error";
                break;

            case "P2003":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "Foreign key constraint failed. The referenced record does not exist.";
                errorName = "Foreign Key Constraint Error";
                break;

            case "P2025":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "Record not found. The requested resource does not exist.";
                errorName = "Record Not Found";
                break;

            case "P2014":
                statusCode = httpStatus.CONFLICT;
                errorMessage = "The change you are trying to make would violate a required relation.";
                errorName = "Relation Constraint Error";
                break;

            case "P2011":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "Required field is missing or null.";
                errorName = "Missing Required Field";
                break;

            case "P2012":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "Invalid value provided for a field.";
                errorName = "Invalid Field Value";
                break;

            case "P2015":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "A related record could not be found.";
                errorName = "Related Record Not Found";
                break;

            case "P2018":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "The required connected records were not found.";
                errorName = "Connected Record Missing";
                break;

            default:
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Prisma error: ${err.message}`;
                errorName = "Prisma Known Request Error";
        }
    }

    else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = httpStatus.UNAUTHORIZED;
            errorMessage = "Authentication failed against database server. Please check your credentials.";
            errorName = "Database Authentication Error";
        } else if (err.errorCode === "P1001") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Cannot reach database server. Please check your connection string.";
            errorName = "Database Connection Error";
        } else if (err.errorCode === "P1002") {
            statusCode = httpStatus.GATEWAY_TIMEOUT;
            errorMessage = "Database connection timed out. Please try again later.";
            errorName = "Connection Timeout Error";
        } else {
            statusCode = httpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = "Database initialization failed.";
            errorName = "Database Init Error";
        }
    }

    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = "An unknown error occurred during query execution.";
        errorName = "Prisma Unknown Request Error";
    }

    else if (err.name === "JsonWebTokenError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Invalid token. Please login again.";
        errorName = "JWT Error";
    } else if (err.name === "TokenExpiredError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Token expired. Please login again.";
        errorName = "Token Expired";
    }

    else if (err.name === "ZodError") {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = err.issues?.map((issue: any) => issue.message).join(", ") || "Validation error";
        errorName = "Validation Error";
        errorDetails = err.issues;
    }

    else if (err.statusCode) {
        statusCode = err.statusCode;
        errorMessage = err.message;
        errorName = err.name || "Application Error";
    }

    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        name: errorName,
        message: errorMessage,
        error : err.stack
    });
};