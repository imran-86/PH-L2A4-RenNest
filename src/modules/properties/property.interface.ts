import { PropertyStatus, PropertyType } from "../../../generated/prisma/enums";
import { PropertyOrderByWithAggregationInput, PropertyWhereInput } from "../../../generated/prisma/models";


export interface ICreatePropertyPayload {
    title: string;
    description: string;
    type: PropertyType;
    status?: PropertyStatus;
    price: number;
    location: string;
    address: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft?: number | null;
    amenities?: string[];
    images?: string[];
    landlordId: string;
}
export interface IUpdatePropertyPayload {
    title?: string;
    description?: string;
    type?: PropertyType;
    status?: PropertyStatus;
    price?: number;
    location?: string;
    address?: string;
    city?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSqft?: number | null;
    amenities?: string[];
    images?: string[];
}
export interface IPropertyQuery extends PropertyWhereInput {
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    sortOrder?: string
    sortBy?: string
}