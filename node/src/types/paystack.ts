

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

export interface OrderEvents{
    order_id: String,
    stage: "",
    actor_type: "customer" | "vendor",
    actor_id: String,
    outcome: "success" | "failure",
    notes: String,
    meta: String
}

export interface OrderItem{
    order_id: String,
    item_id: String,
    units: Number,
    unit_price: Number,
    total_price: Number,
}