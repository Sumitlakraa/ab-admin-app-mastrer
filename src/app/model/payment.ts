export interface OperatorInvoice {
    id?: string;
    title: string;
    subtitle: string;
    isPaid: boolean;
    gstText: string;

    totleAmount: number;
    payableamountWithoutGst: number;
    gstAmount: number;
    payableamountWithGst: number;

    date: string;
    operatorId?: string;
    companyName: string;
    operatorNumber: string;
    operatorName: string;

    remarks: string;
    payment_mode: string;
    isVisible: boolean;
}


export interface ApnibusPayment {
    id?: string;
    
    Amount: number;
    date: string;
    payment_date: any;
    operatorId?: string;
    companyName: string;
    operatorNumber: string;
    operatorName: string;

    remarks: string;
    referenceNumber: string;
    isSettle: boolean;
}

