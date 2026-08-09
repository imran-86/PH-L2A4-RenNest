export interface ICreateReviewPayload {
    rating: number;
    comment?: string;
    propertyId: string;
    rentalRequestId: string;
}