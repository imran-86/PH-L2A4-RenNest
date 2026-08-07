import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload, IUpdatePropertyPayload } from "./property.interface";

const createPropertyIntoDB = async (payload : ICreatePropertyPayload) => {
    const { title, description, type, status, price, location, address, city, bedrooms, bathrooms, areaSqft, amenities, images, landlordId } = payload; 

    const property = await prisma.property.create({
        data : {
            title,
            description,
            type,
            status,
            price,
            location,
            address,
            city,
            bedrooms,
            bathrooms,
            areaSqft,
            amenities,
            images,
            landlordId
        }
    });

    return property;
}
const updatePropertyIntoDB = async (propertyId : string, payload : IUpdatePropertyPayload,landlordId : string) => {
    const property = await prisma.property.findUnique({
        where : {
            id : propertyId,
           
        },
    });
    if(property?.landlordId !== landlordId){
        throw new Error("You are not authorized to update this property.");
    }
    const updatedProperty = await prisma.property.update({
        where : {
            id : propertyId,
        },
        data : payload,
        include : {
            landlord : true,
        }
    });
    return updatedProperty;
}
const deletePropertyFromDB = async (propertyId : string, landlordId : string) => {
    const property = await prisma.property.findUnique({
        where : {
            id : propertyId,
        },
    });
    if(property?.landlordId !== landlordId){
        throw new Error("You are not authorized to delete this property.");
    }
    const deletedProperty = await prisma.property.delete({
        where : {
            id : propertyId,
        },
    });
    return deletedProperty;
}
export const propertyService = {
    createPropertyIntoDB,
    updatePropertyIntoDB,
    deletePropertyFromDB,
}