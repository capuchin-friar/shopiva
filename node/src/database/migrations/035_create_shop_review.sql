CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,


    -- Relationships
    shop_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,

    -- Rating
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),

    -- Quick sentiment
    review_tag VARCHAR(50) NOT NULL,

    -- Review content
    -- reason VARCHAR(255) NULL,
    comment TEXT NULL,

    -- Images uploaded by customer
    image_urls JSON NULL,

    -- Moderation
    -- is_hidden BOOLEAN DEFAULT FALSE,
    -- hidden_reason VARCHAR(255) NULL,

    -- Vendor response
    -- vendor_reply TEXT NULL,
    -- vendor_replied_at TIMESTAMP NULL,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    -- INDEX idx_shop_id (shop_id),
    -- INDEX idx_customer_id (customer_id),
    -- INDEX idx_rating (rating),
    -- INDEX idx_created_at (created_at),

    -- FOREIGN KEY (shop_id) REFERENCES shops(id),
    -- FOREIGN KEY (customer_id) REFERENCES customers(id)


);


        -- 'best',
        -- 'good',
        -- 'average',
        -- 'poor',

        
        -- 'terrible'

        
