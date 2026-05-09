

export interface NewOrder{
    order_id: String; 
    customer_id: String; 
    shop_id: String; 
    amount_paid: Number; 
    shipping_fee: Number; 
    tax: Number; 
    charges: Number; 
    total_paid: Number; 
    currency: String; 
    fulfillment_status: String; 
    escrow_status: String; 
    payment_status: String; 
    shipping_address: String; 
    payment_reference: String; 
    shipping_method: String; 
    tracking_number: String; 
}