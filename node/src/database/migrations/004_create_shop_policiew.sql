CREATE TABLE IF NOT EXISTS shop_policies (
    id SERIAL PRIMARY KEY,
    shopid INTEGER NOT NULL UNIQUE REFERENCES shops(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    
    deliverypolicy JSONB DEFAULT '{
        "restrictions": null,
        "processingTime": null,
        "shippingMethods": [],
        "domesticShipping": {"regions": [], "available": true},
        "trackingProvided": true,
        "interstateShipping": {"available": false, "countries": []}
    }'::jsonb,
    
    refundpolicy JSONB DEFAULT '{
        "refundMethod": "original_payment",
        "returnWindow": 30,
        "restockingFee": 0,
        "returnConditions": null,
        "damagedItemsPolicy": null,
        "refundProcessingTime": null
    }'::jsonb,
    
    custompolicies JSONB DEFAULT '[]'::jsonb,
    
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create indexes for frequently queried columns
-- Full JSONB indexing
CREATE INDEX idx_shop_policies_deliverypolicy ON shop_policies USING GIN (deliverypolicy);
CREATE INDEX idx_shop_policies_refundpolicy ON shop_policies USING GIN (refundpolicy);
CREATE INDEX idx_shop_policies_custompolicies ON shop_policies USING GIN (custompolicies);
