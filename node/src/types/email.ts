/**
 * EMAIL TYPE DEFINITIONS
 */

export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: EmailAttachment[];
}

export interface EmailAttachment {
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
}

export interface EmailTemplateData {
    [key: string]: string | number | boolean | undefined;
}

export interface WelcomeEmailData {
    fname: string;
    email: string;
}

export interface PasswordResetEmailData {
    fname: string;
    resetLink: string;
    expiresIn: string;
}

export interface VerificationEmailData {
    fname: string;
    verificationCode: string;
    verificationLink?: string;
}

export interface OrderConfirmationEmailData {
    fname: string;
    orderId: string;
    orderTotal: number;
    currency: string;
    items: OrderItem[];
    shippingAddress: string;
}

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface NotificationEmailData {
    fname: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
}

