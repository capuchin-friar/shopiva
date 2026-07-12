CREATE TABLE products (
    id SERIAL PRIMARY KEY,

    shop_id INT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,

    description TEXT,
    short_description VARCHAR(500),

    category VARCHAR(100),
    subcategory VARCHAR(100),

    brand VARCHAR(100),

    thumbanil_url  VARCHAR(100),
    image_folder_id VARCHAR(100),

    tags TEXT[] DEFAULT '{}',

    weight NUMERIC(10,2),

    dimensions JSONB DEFAULT '{"unit":"cm","width":null,"height":null,"length":null}',

    specifications JSONB DEFAULT '{}',

    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft','active','archived')),

    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,

    is_featured BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_shop ON products(shop_id);