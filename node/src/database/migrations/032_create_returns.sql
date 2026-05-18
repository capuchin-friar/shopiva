CREATE TABLE returns (
    id SERIAL PRIMARY KEY,

    order_id VARCHAR(50) NOT NULL,

    customer_id VARCHAR NOT NULL,
    shop_id VARCHAR NOT NULL,


    return_shipping_fee VARCHAR(100),
    return_shipping_paid_by VARCHAR(50),


    status VARCHAR(50) NOT NULL DEFAULT 'processing',

    shipping_address TEXT NOT NULL,


    shipping_method VARCHAR(100),

    estimated_delivery_date TIMESTAMP,

    tracking_number VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

