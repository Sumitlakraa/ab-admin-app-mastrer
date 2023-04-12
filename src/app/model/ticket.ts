export interface Ticket {
    id: string;

    ticketPNR: string;
    bookingDate: string;
    jounrneyDate: string;

    fromTown: string;
    toTown: string;

    busNumber: string;
    passengerMobile: string;

    normalSeats: number;
    singleSleeperSeats: number;
    sharingSleeperSeats: number;

    paymentStatus: string;
    paymentType: string;

    totalAmountPaid: number;
    discount: number;
    paidByWallet: number;

    ticketStatus: string;



    conductorName: string;
    conductorMobile: number;

    operatorName: string;
    operatorMobile: number;

    pocName: string;
    pocMobile: number;

    cashback: string;
    companyName: string;


}