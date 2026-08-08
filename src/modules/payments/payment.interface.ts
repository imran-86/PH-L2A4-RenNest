export interface ICreatePaymentSession {
    rentalRequestId: string;
    propertyId: string;
    tenantId: string;
    tenantEmail: string;
    amount: number;
    propertyTitle: string;
}