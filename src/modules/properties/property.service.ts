import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload } from "./property.interface";

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
export const propertyService = {
    createPropertyIntoDB,
}