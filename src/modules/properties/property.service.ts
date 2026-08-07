import { prisma } from "../../lib/prisma";
import { ICreatePropertyPayload, IPropertyQuery, IUpdatePropertyPayload } from "./property.interface";

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

const getAllPropertiesFromDB = async (query: IPropertyQuery) => {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const andConditions: any[] = [];

    // Search term (title, description, location, address, city)
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: query.searchTerm, 
                    mode: 'insensitive' } 
                },
                { description: { contains: query.searchTerm,
                     mode: 'insensitive' }
                },
                { location: { contains: query.searchTerm, 
                    mode: 'insensitive' } 
                },
                { address: { contains: query.searchTerm, 
                    mode: 'insensitive' } 
                },
                { city: { contains: query.searchTerm, 
                    mode: 'insensitive' } 
                },
            ],
        });
    }

   
    if (query.location) {
        andConditions.push({
            location: { contains: query.location, mode: 'insensitive' },
        });
    }

    
    if (query.city) {
        andConditions.push({
            city: { contains: query.city, mode: 'insensitive' },
        });
    }

    if (query.type) {
        andConditions.push({ type: query.type });
    }

  
    if (query.status) {
        andConditions.push({ status: query.status });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        const priceFilter: any = {};
        if (query.minPrice !== undefined){
           priceFilter.gte = query.minPrice;
        } 
        if (query.maxPrice !== undefined){
            priceFilter.lte = query.maxPrice;
        } 
        andConditions.push({ price: priceFilter });
    }

   
    if (query.bedrooms) {
        andConditions.push({ bedrooms: query.bedrooms });
    }

   
    if (query.bathrooms) {
        andConditions.push({ bathrooms: query.bathrooms });
    }

    const properties = await prisma.property.findMany({
        where: {
            AND: andConditions,
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            landlord: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return properties;
};
const getSinglePropertyFromDB = async (propertyId : string) => {
    const property = await prisma.property.findUnique({
        where : {
            id : propertyId
        }
    });
    return property;
};
export const propertyService = {
    createPropertyIntoDB,
    updatePropertyIntoDB,
    deletePropertyFromDB,
    getAllPropertiesFromDB,
    getSinglePropertyFromDB
}