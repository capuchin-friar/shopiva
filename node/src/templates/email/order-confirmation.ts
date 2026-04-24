/**
 * ORDER CONFIRMATION EMAIL TEMPLATE
 */

import type { OrderConfirmationEmailData } from "../../types/email.js";
import { baseTemplate } from "./base.js";

export function orderConfirmationTemplate(data: OrderConfirmationEmailData): string {
    const itemsHtml = data.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.currency} ${item.price.toFixed(2)}</td>
        </tr>
    `).join("");

    const content = `
        <h2>Order Confirmed! 🎉</h2>
        <p>Hi ${data.fname},</p>
        <p>Thank you for your order. We're getting it ready for you!</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-weight: 600;">Order #${data.orderId}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
                <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 18px; color: #6366f1;">
                        ${data.currency} ${data.orderTotal.toFixed(2)}
                    </td>
                </tr>
            </tfoot>
        </table>

        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Shipping Address:</p>
            <p style="margin: 0; color: #4b5563;">${data.shippingAddress}</p>
        </div>

        <p style="text-align: center;">
            <a href="#" class="button">Track Your Order</a>
        </p>

        <hr class="divider">
        <p style="font-size: 14px; color: #6b7280;">
            If you have any questions about your order, please contact our support team.
        </p>
    `;

    return baseTemplate(content, `Order #${data.orderId} confirmed - Thank you for your purchase!`);
}

