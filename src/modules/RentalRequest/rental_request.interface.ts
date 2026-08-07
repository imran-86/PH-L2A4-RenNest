import { RentalRequestStatus } from "../../../generated/prisma/enums";


export interface ICreateRentalRequest{
    propertyId: string;
    moveInDate: Date | string;
    moveOutDate?: Date | string | null;
    message?: string;
}
export interface IRentalRequestQuery {
    status?: RentalRequestStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

