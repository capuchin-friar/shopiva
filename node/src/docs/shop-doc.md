````ts 
/**
 * SHOP TABLE SCHEMA
 * 
 * This is a virtual shop that enables entrepreneurs to sell products,
 * manage inventory, handle orders, and process payments through escrow.
 * 
 * Identity & Profile:
 * - id: Unique shop identifier (auto-increment, primary key)
 * - ownerId: Reference to the user who owns this shop (foreign key)
 * - name: Shop display name
 * - slug: URL-friendly unique identifier
 * - description: Shop description/about
 * - logo: Shop logo URL
 * - banner: Shop banner image URL
 * - category: Shop category (electronics, fashion, food, etc.)
 * - tags: Array of tags for discoverability
 * - contactEmail: Shop contact email
 * - contactPhone: Shop contact phone
 * - location: Shop location object {address, city, state, country, zipcode, coordinates}
 * - socialLinks: Social media profiles {facebook, instagram, twitter, website}
 * 
 * Status & Verification:
 * - isActive: Shop active/inactive status
 * - isVerified: Shop verification status (verified shops get trust badge)
 * - status: Shop state (active, suspended, closed, pending_approval)
 * - verificationDocuments: Documents submitted for verification
 *   {
 *     businessLicense: {url: string, verified: boolean, submittedAt: Date},
 *     taxId: {url: string, verified: boolean, submittedAt: Date},
 *     identityProof: {url: string, verified: boolean, submittedAt: Date}
 *   }
 * 
 * Timestamps:
 * - createdAt: Shop creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * INVENTORY/PRODUCTS TABLE SCHEMA
 * 
 * Manages all items available for sale in the shop.
 * 
 * Product Identity:
 * - id: Unique product identifier (auto-increment, primary key)
 * - shopId: Reference to the shop (foreign key)
 * - sku: Stock Keeping Unit (unique per shop)
 * - name: Product name
 * - slug: URL-friendly product identifier
 * - description: Detailed product description
 * - shortDescription: Brief product summary
 * - images: Array of product image URLs
 * - videos: Array of product video URLs
 * - category: Product category
 * - subcategory: Product subcategory
 * - tags: Array of tags for search/filtering
 * - brand: Product brand
 * 
 * Pricing:
 * - price: Current selling price
 * - compareAtPrice: Original price (for showing discounts)
 * - costPrice: Cost to the shop (for profit calculation)
 * - currency: Currency code (USD, EUR, NGN, etc.)
 * - taxable: Whether product is taxable
 * - taxRate: Tax percentage if applicable
 * 
 * Inventory Management:
 * - quantity: Current stock quantity
 * - lowStockThreshold: Alert when stock falls below this
 * - trackInventory: Whether to track inventory levels
 * - allowBackorder: Allow orders when out of stock
 * - inventoryHistory: Stock movement history
 *   [{
 *     type: 'add' | 'remove' | 'adjust' | 'sale' | 'return',
 *     quantity: number,
 *     reason: string,
 *     timestamp: Date,
 *     performedBy: userId
 *   }]
 * 
 * Variants:
 * - hasVariants: Whether product has variants
 * - variants: Array of product variants
 *   [{
 *     id: string,
 *     name: string,
 *     sku: string,
 *     price: number,
 *     quantity: number,
 *     attributes: {color: string, size: string, material: string}
 *   }]
 * 
 * Specifications:
 * - weight: Product weight (for shipping calculation)
 * - dimensions: Product dimensions {length, width, height, unit}
 * - specifications: Key-value pairs of product specs
 * 
 * Status:
 * - status: Product status (active, draft, archived, out_of_stock)
 * - isPublished: Whether product is visible to customers
 * - publishedAt: When product was published
 * - isFeatured: Whether product is featured
 * 
 * Timestamps:
 * - createdAt: Product creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * ORDERS TABLE SCHEMA
 * 
 * Manages all customer orders placed in the shop.
 * 
 * Order Identity:
 * - id: Unique order identifier (auto-increment, primary key)
 * - orderNumber: Human-readable order number (e.g., ORD-2024-001234)
 * - shopId: Reference to the shop (foreign key)
 * - customerId: Reference to the customer (foreign key)
 * 
 * Order Items:
 * - items: Array of ordered products
 *   [{
 *     productId: number,
 *     variantId: string,
 *     name: string,
 *     sku: string,
 *     quantity: number,
 *     unitPrice: number,
 *     totalPrice: number,
 *     image: string
 *   }]
 * 
 * Pricing:
 * - subtotal: Sum of all items before discounts/taxes
 * - discount: Discount amount applied
 * - discountCode: Discount/coupon code used
 * - tax: Tax amount
 * - shippingCost: Shipping/delivery fee
 * - total: Final order total
 * - currency: Currency code
 * 
 * Shipping Details:
 * - shippingAddress: Delivery address
 *   {
 *     fullName: string,
 *     phone: string,
 *     address: string,
 *     city: string,
 *     state: string,
 *     country: string,
 *     zipcode: string,
 *     instructions: string
 *   }
 * - shippingMethod: Selected shipping method
 * - estimatedDelivery: Expected delivery date
 * - trackingNumber: Shipment tracking number
 * - carrier: Shipping carrier/logistics company
 * 
 * Order Status:
 * - status: Order status
 *   ('pending', 'confirmed', 'processing', 'shipped', 'in_transit', 
 *    'out_for_delivery', 'delivered', 'completed', 'cancelled', 'refunded')
 * - statusHistory: Order status timeline
 *   [{
 *     status: string,
 *     timestamp: Date,
 *     note: string,
 *     updatedBy: userId
 *   }]
 * 
 * Timestamps:
 * - orderedAt: When order was placed
 * - confirmedAt: When order was confirmed
 * - shippedAt: When order was shipped
 * - deliveredAt: When order was delivered
 * - completedAt: When buyer confirmed satisfaction
 * - createdAt: Record creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * DEALS/ESCROW TABLE SCHEMA
 * 
 * Manages escrow-based transactions where the shop handles delivery
 * and holds payment until buyer confirms satisfaction.
 * 
 * Deal Identity:
 * - id: Unique deal identifier (auto-increment, primary key)
 * - dealNumber: Human-readable deal number (e.g., DEAL-2024-001234)
 * - orderId: Reference to the order (foreign key)
 * - shopId: Reference to the shop (foreign key)
 * - sellerId: Reference to the seller/shop owner (foreign key)
 * - buyerId: Reference to the buyer/customer (foreign key)
 * 
 * Financial Details:
 * - amount: Total transaction amount
 * - escrowFee: Platform fee for escrow service
 * - netAmount: Amount to be released to seller (amount - escrowFee)
 * - currency: Currency code
 * 
 * Escrow Status:
 * - status: Deal status
 *   ('initiated', 'payment_pending', 'payment_received', 'in_escrow',
 *    'shipped', 'delivered', 'buyer_confirmed', 'released', 
 *    'disputed', 'refunded', 'cancelled')
 * - paymentStatus: Payment status (pending, held, released, refunded)
 * - deliveryStatus: Delivery status (pending, shipped, in_transit, delivered)
 * 
 * Buyer Confirmation:
 * - buyerConfirmation: Buyer's confirmation details
 *   {
 *     confirmed: boolean,
 *     confirmedAt: Date,
 *     satisfactionRating: number (1-5),
 *     notes: string
 *   }
 * - confirmationDeadline: Deadline for buyer to confirm (auto-release after)
 * - autoReleaseEnabled: Whether to auto-release funds after deadline
 * 
 * Dispute Handling:
 * - dispute: Dispute details if any
 *   {
 *     raised: boolean,
 *     raisedBy: 'buyer' | 'seller',
 *     raisedAt: Date,
 *     reason: string,
 *     evidence: [string],
 *     resolution: string,
 *     resolvedAt: Date,
 *     resolvedBy: adminId
 *   }
 * 
 * Timeline:
 * - initiatedAt: When deal was created
 * - paymentReceivedAt: When payment was received into escrow
 * - shippedAt: When item was shipped
 * - deliveredAt: When item was delivered
 * - releasedAt: When funds were released to seller
 * - createdAt: Record creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * PAYMENTS TABLE SCHEMA
 * 
 * Manages all payment transactions for the shop.
 * 
 * Payment Identity:
 * - id: Unique payment identifier (auto-increment, primary key)
 * - transactionId: External payment gateway transaction ID
 * - referenceNumber: Internal payment reference
 * - shopId: Reference to the shop (foreign key)
 * - orderId: Reference to the order (foreign key)
 * - dealId: Reference to the escrow deal (foreign key)
 * - customerId: Reference to the customer (foreign key)
 * 
 * Payment Details:
 * - amount: Payment amount
 * - currency: Currency code
 * - paymentMethod: Payment method used
 *   ('card', 'bank_transfer', 'wallet', 'crypto', 'cash_on_delivery', 'mobile_money')
 * - paymentGateway: Payment processor (stripe, paystack, flutterwave, etc.)
 * 
 * Card Details (if applicable):
 * - cardDetails: Masked card information
 *   {
 *     brand: string,
 *     last4: string,
 *     expiryMonth: number,
 *     expiryYear: number,
 *     fingerprint: string
 *   }
 * 
 * Bank Details (if applicable):
 * - bankDetails: Bank transfer information
 *   {
 *     bankName: string,
 *     accountNumber: string (masked),
 *     accountName: string
 *   }
 * 
 * Payment Status:
 * - status: Payment status
 *   ('pending', 'processing', 'successful', 'failed', 'refunded', 'partially_refunded')
 * - failureReason: Reason for failure if applicable
 * - refundAmount: Amount refunded if applicable
 * - refundReason: Reason for refund
 * 
 * Metadata:
 * - ipAddress: Customer's IP address
 * - userAgent: Customer's browser/device info
 * - metadata: Additional payment data from gateway
 * 
 * Timestamps:
 * - initiatedAt: When payment was initiated
 * - completedAt: When payment was completed
 * - refundedAt: When refund was processed
 * - createdAt: Record creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * REVIEWS TABLE SCHEMA
 * 
 * Stores customer reviews and ratings for the shop and products.
 * 
 * Review Identity:
 * - id: Unique review identifier (auto-increment, primary key)
 * - shopId: Reference to the shop (foreign key)
 * - productId: Reference to the product (foreign key, nullable for shop reviews)
 * - customerId: Reference to the customer (foreign key)
 * - orderId: Reference to the order (foreign key)
 * 
 * Review Content:
 * - type: Review type ('shop', 'product')
 * - rating: Star rating (1-5)
 * - title: Review title/headline
 * - content: Detailed review text
 * - images: Array of review image URLs
 * - videos: Array of review video URLs
 * 
 * Verification:
 * - isVerifiedPurchase: Whether reviewer actually purchased the item
 * - isPurchaseConfirmed: Whether the order was completed
 * 
 * Engagement:
 * - helpfulCount: Number of "helpful" votes
 * - reportCount: Number of reports/flags
 * - replies: Shop owner replies
 *   [{
 *     content: string,
 *     repliedAt: Date,
 *     repliedBy: userId
 *   }]
 * 
 * Status:
 * - status: Review status ('pending', 'approved', 'rejected', 'flagged')
 * - isVisible: Whether review is visible to public
 * - moderationNote: Admin moderation notes
 * 
 * Timestamps:
 * - createdAt: Review creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * SHOP METRICS/PERFORMANCE TABLE SCHEMA
 * 
 * Stores shop performance metrics and analytics.
 * 
 * Metric Identity:
 * - id: Unique metric record identifier (auto-increment, primary key)
 * - shopId: Reference to the shop (foreign key)
 * - period: Metric period ('daily', 'weekly', 'monthly', 'yearly', 'all_time')
 * - periodStart: Start date of the period
 * - periodEnd: End date of the period
 * 
 * Sales Metrics:
 * - totalOrders: Total number of orders
 * - completedOrders: Number of completed orders
 * - cancelledOrders: Number of cancelled orders
 * - totalRevenue: Total revenue generated
 * - netRevenue: Revenue after fees and refunds
 * - averageOrderValue: Average order value
 * - refundRate: Percentage of refunded orders
 * 
 * Product Metrics:
 * - totalProducts: Total number of products
 * - activeProducts: Number of active products
 * - outOfStockProducts: Number of out-of-stock products
 * - topSellingProducts: Array of top selling product IDs
 * - lowPerformingProducts: Array of low performing product IDs
 * 
 * Customer Metrics:
 * - totalCustomers: Total unique customers
 * - newCustomers: New customers in the period
 * - returningCustomers: Returning customers
 * - customerRetentionRate: Percentage of returning customers
 * 
 * Review Metrics:
 * - averageRating: Average shop rating (1-5)
 * - totalReviews: Total number of reviews
 * - positiveReviews: Reviews with rating >= 4
 * - negativeReviews: Reviews with rating <= 2
 * - responseRate: Percentage of reviews responded to
 * - averageResponseTime: Average time to respond to reviews
 * 
 * Fulfillment Metrics:
 * - averageProcessingTime: Average time to process orders
 * - averageShippingTime: Average shipping duration
 * - onTimeDeliveryRate: Percentage of on-time deliveries
 * - deliverySuccessRate: Percentage of successful deliveries
 * 
 * Escrow Metrics:
 * - totalDeals: Total escrow deals
 * - successfulDeals: Successfully completed deals
 * - disputedDeals: Deals with disputes
 * - disputeResolutionRate: Percentage of resolved disputes
 * - averageEscrowDuration: Average time funds held in escrow
 * 
 * Traffic Metrics:
 * - shopViews: Number of shop page views
 * - productViews: Total product page views
 * - conversionRate: Views to orders conversion rate
 * 
 * Timestamps:
 * - calculatedAt: When metrics were calculated
 * - createdAt: Record creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * SHOP POLICIES TABLE SCHEMA
 * 
 * Stores shop policies for delivery, refund, privacy, and terms.
 * 
 * Policy Identity:
 * - id: Unique policy identifier (auto-increment, primary key)
 * - shopId: Reference to the shop (foreign key)
 * 
 * Delivery Policy:
 * - deliveryPolicy: Delivery terms and conditions
 *   {
 *     processingTime: string (e.g., "1-2 business days"),
 *     shippingMethods: [{
 *       name: string,
 *       description: string,
 *       estimatedDays: string,
 *       cost: number,
 *       freeAbove: number
 *     }],
 *     domesticShipping: {available: boolean, regions: [string]},
 *     internationalShipping: {available: boolean, countries: [string]},
 *     restrictions: string,
 *     trackingProvided: boolean
 *   }
 * 
 * Refund Policy:
 * - refundPolicy: Refund and return terms
 *   {
 *     acceptsReturns: boolean,
 *     returnWindow: number (days),
 *     returnConditions: string,
 *     refundMethod: 'original_payment' | 'store_credit' | 'exchange',
 *     restockingFee: number (percentage),
 *     nonRefundableItems: [string],
 *     exchangePolicy: string,
 *     damagedItemsPolicy: string,
 *     refundProcessingTime: string
 *   }
 * 
 * Privacy Policy:
 * - privacyPolicy: Data handling and privacy terms
 *   {
 *     dataCollected: [string],
 *     dataUsage: string,
 *     dataSharingPolicy: string,
 *     dataRetentionPeriod: string,
 *     cookiePolicy: string,
 *     thirdPartyServices: [string],
 *     customerRights: string,
 *     contactForPrivacy: string,
 *     lastUpdated: Date
 *   }
 * 
 * Terms and Conditions:
 * - termsAndConditions: Shop terms of service
 *   {
 *     acceptance: string,
 *     eligibility: string,
 *     accountResponsibilities: string,
 *     orderingProcess: string,
 *     paymentTerms: string,
 *     pricingPolicy: string,
 *     intellectualProperty: string,
 *     limitationOfLiability: string,
 *     disputeResolution: string,
 *     governingLaw: string,
 *     modifications: string,
 *     contactInformation: string,
 *     effectiveDate: Date,
 *     lastUpdated: Date
 *   }
 * 
 * Custom Policies:
 * - customPolicies: Additional shop-specific policies
 *   [{
 *     title: string,
 *     content: string,
 *     isActive: boolean,
 *     createdAt: Date
 *   }]
 * 
 * Timestamps:
 * - createdAt: Record creation timestamp
 * - updatedAt: Last update timestamp
 */


/**
 * SHOP FOLLOWERS TABLE SCHEMA
 * 
 * Manages users who follow shops to receive updates and notifications.
 * 
 * Follow Identity:
 * - id: Unique follow record identifier (auto-increment, primary key)
 * - shopId: Reference to the shop being followed (foreign key)
 * - userId: Reference to the user who is following (foreign key)
 * 
 * Follow Details:
 * - notificationsEnabled: Whether user wants notifications from this shop
 * - notificationPreferences: Granular notification settings
 *   {
 *     newProducts: boolean,
 *     sales: boolean,
 *     restocks: boolean,
 *     announcements: boolean
 *   }
 * 
 * Engagement:
 * - source: How the user discovered/followed the shop
 *   ('organic', 'referral', 'advertisement', 'search', 'social_media')
 * - referredBy: User ID who referred this follower (if applicable)
 * 
 * Timestamps:
 * - followedAt: When the user followed the shop
 * - unfollowedAt: When the user unfollowed (for soft delete tracking)
 * - createdAt: Record creation timestamp
 * - updatedAt: Last update timestamp
 */


-- ============================================
-- SQL TABLE DEFINITIONS
-- ============================================

CREATE TABLE shops (
  -- Identity & Profile
  id SERIAL PRIMARY KEY,
  ownerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo TEXT,
  banner TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  contactEmail VARCHAR(255),
  contactPhone VARCHAR(20),
  location JSONB DEFAULT '{"address": null, "city": null, "state": null, "country": null, "zipcode": null, "coordinates": null}',
  socialLinks JSONB DEFAULT '{"facebook": null, "instagram": null, "twitter": null, "website": null}',

  -- Status & Verification
  isActive BOOLEAN DEFAULT true,
  isVerified BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('active', 'suspended', 'closed', 'pending_approval')),
  verificationDocuments JSONB DEFAULT '{
    "businessLicense": {"url": null, "verified": false, "submittedAt": null},
    "taxId": {"url": null, "verified": false, "submittedAt": null},
    "identityProof": {"url": null, "verified": false, "submittedAt": null}
  }',

  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  -- Product Identity
  id SERIAL PRIMARY KEY,
  shopId INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  shortDescription VARCHAR(500),
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  brand VARCHAR(100),

  -- Pricing
  price DECIMAL(15, 2) NOT NULL,
  compareAtPrice DECIMAL(15, 2),
  costPrice DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  taxable BOOLEAN DEFAULT true,
  taxRate DECIMAL(5, 2) DEFAULT 0,

  -- Inventory Management
  quantity INTEGER DEFAULT 0,
  lowStockThreshold INTEGER DEFAULT 5,
  trackInventory BOOLEAN DEFAULT true,
  allowBackorder BOOLEAN DEFAULT false,
  inventoryHistory JSONB DEFAULT '[]',

  -- Variants
  hasVariants BOOLEAN DEFAULT false,
  variants JSONB DEFAULT '[]',

  -- Specifications
  weight DECIMAL(10, 2),
  dimensions JSONB DEFAULT '{"length": null, "width": null, "height": null, "unit": "cm"}',
  specifications JSONB DEFAULT '{}',

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock')),
  isPublished BOOLEAN DEFAULT false,
  publishedAt TIMESTAMP,
  isFeatured BOOLEAN DEFAULT false,

  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(shopId, sku)
);

CREATE TABLE orders (
  -- Order Identity
  id SERIAL PRIMARY KEY,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  shopId INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Order Items
  items JSONB NOT NULL,

  -- Pricing
  subtotal DECIMAL(15, 2) NOT NULL,
  discount DECIMAL(15, 2) DEFAULT 0,
  discountCode VARCHAR(50),
  tax DECIMAL(15, 2) DEFAULT 0,
  shippingCost DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Shipping Details
  shippingAddress JSONB NOT NULL,
  shippingMethod VARCHAR(100),
  estimatedDelivery DATE,
  trackingNumber VARCHAR(100),
  carrier VARCHAR(100),

  -- Order Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'in_transit', 
    'out_for_delivery', 'delivered', 'completed', 'cancelled', 'refunded'
  )),
  statusHistory JSONB DEFAULT '[]',

  -- Timestamps
  orderedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmedAt TIMESTAMP,
  shippedAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deals (
  -- Deal Identity
  id SERIAL PRIMARY KEY,
  dealNumber VARCHAR(50) UNIQUE NOT NULL,
  orderId INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shopId INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  sellerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Financial Details
  amount DECIMAL(15, 2) NOT NULL,
  escrowFee DECIMAL(15, 2) DEFAULT 0,
  netAmount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Escrow Status
  status VARCHAR(50) DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'payment_pending', 'payment_received', 'in_escrow',
    'shipped', 'delivered', 'buyer_confirmed', 'released', 
    'disputed', 'refunded', 'cancelled'
  )),
  paymentStatus VARCHAR(50) DEFAULT 'pending' CHECK (paymentStatus IN ('pending', 'held', 'released', 'refunded')),
  deliveryStatus VARCHAR(50) DEFAULT 'pending' CHECK (deliveryStatus IN ('pending', 'shipped', 'in_transit', 'delivered')),

  -- Buyer Confirmation
  buyerConfirmation JSONB DEFAULT '{"confirmed": false, "confirmedAt": null, "satisfactionRating": null, "notes": null}',
  confirmationDeadline TIMESTAMP,
  autoReleaseEnabled BOOLEAN DEFAULT true,

  -- Dispute Handling
  dispute JSONB DEFAULT '{"raised": false, "raisedBy": null, "raisedAt": null, "reason": null, "evidence": [], "resolution": null, "resolvedAt": null, "resolvedBy": null}',

  -- Timeline
  initiatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paymentReceivedAt TIMESTAMP,
  shippedAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  releasedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  -- Payment Identity
  id SERIAL PRIMARY KEY,
  transactionId VARCHAR(255) UNIQUE,
  referenceNumber VARCHAR(100) UNIQUE NOT NULL,
  shopId INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  orderId INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  dealId INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  customerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Payment Details
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  paymentMethod VARCHAR(50) NOT NULL CHECK (paymentMethod IN (
    'card', 'bank_transfer', 'wallet', 'crypto', 'cash_on_delivery', 'mobile_money'
  )),
  paymentGateway VARCHAR(50),

  -- Card Details
  cardDetails JSONB DEFAULT '{"brand": null, "last4": null, "expiryMonth": null, "expiryYear": null, "fingerprint": null}',

  -- Bank Details
  bankDetails JSONB DEFAULT '{"bankName": null, "accountNumber": null, "accountName": null}',

  -- Payment Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'successful', 'failed', 'refunded', 'partially_refunded'
  )),
  failureReason TEXT,
  refundAmount DECIMAL(15, 2),
  refundReason TEXT,

  -- Metadata
  ipAddress VARCHAR(45),
  userAgent TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  initiatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP,
  refundedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop_reviews (
  id BIGSERIAL PRIMARY KEY,

  -- Relations
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,

  -- Review content
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(120),
  comment TEXT,

  -- Moderation
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One review per order per user
  UNIQUE (shop_id, reviewer_id, order_id)
);

CREATE INDEX idx_shop_reviews_shop_id ON shop_reviews(shop_id);
CREATE INDEX idx_shop_reviews_rating ON shop_reviews(shop_id, rating);
CREATE INDEX idx_shop_reviews_visible ON shop_reviews(shop_id)
WHERE is_hidden = FALSE;

CREATE TABLE shop_review_metrics (
  shop_id BIGINT PRIMARY KEY REFERENCES shops(id) ON DELETE CASCADE,

  review_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,

  rating_1_count INTEGER NOT NULL DEFAULT 0,
  rating_2_count INTEGER NOT NULL DEFAULT 0,
  rating_3_count INTEGER NOT NULL DEFAULT 0,
  rating_4_count INTEGER NOT NULL DEFAULT 0,
  rating_5_count INTEGER NOT NULL DEFAULT 0,

  last_reviewed_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE shop_metrics_summary (
  shop_id BIGINT PRIMARY KEY REFERENCES shops(id),
  total_orders INTEGER,
  total_revenue DECIMAL(15,2),
  average_rating DECIMAL(3,2),
  total_reviews INTEGER,
  conversion_rate DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE shop_policies (
  -- Policy Identity
  id SERIAL PRIMARY KEY,
  shopId INTEGER UNIQUE NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Delivery Policy
  deliveryPolicy JSONB DEFAULT '{
    "processingTime": null,
    "shippingMethods": [],
    "domesticShipping": {"available": true, "regions": []},
    "internationalShipping": {"available": false, "countries": []},
    "restrictions": null,
    "trackingProvided": true
  }',

  -- Refund Policy
  refundPolicy JSONB DEFAULT '{
    "acceptsReturns": true,
    "returnWindow": 30,
    "returnConditions": null,
    "refundMethod": "original_payment",
    "restockingFee": 0,
    "nonRefundableItems": [],
    "exchangePolicy": null,
    "damagedItemsPolicy": null,
    "refundProcessingTime": null
  }',

  -- Privacy Policy
  privacyPolicy JSONB DEFAULT '{
    "dataCollected": [],
    "dataUsage": null,
    "dataSharingPolicy": null,
    "dataRetentionPeriod": null,
    "cookiePolicy": null,
    "thirdPartyServices": [],
    "customerRights": null,
    "contactForPrivacy": null,
    "lastUpdated": null
  }',

  -- Terms and Conditions
  termsAndConditions JSONB DEFAULT '{
    "acceptance": null,
    "eligibility": null,
    "accountResponsibilities": null,
    "orderingProcess": null,
    "paymentTerms": null,
    "pricingPolicy": null,
    "intellectualProperty": null,
    "limitationOfLiability": null,
    "disputeResolution": null,
    "governingLaw": null,
    "modifications": null,
    "contactInformation": null,
    "effectiveDate": null,
    "lastUpdated": null
  }',

  -- Custom Policies
  customPolicies JSONB DEFAULT '[]',

  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop_followers (
  -- Follow Identity
  id SERIAL PRIMARY KEY,
  shopId INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Follow Details
  notificationsEnabled BOOLEAN DEFAULT true,
  notificationPreferences JSONB DEFAULT '{
    "newProducts": true,
    "sales": true,
    "restocks": true,
    "announcements": true
  }',

  -- Engagement
  source VARCHAR(50) DEFAULT 'organic' CHECK (source IN (
    'organic', 'referral', 'advertisement', 'search', 'social_media'
  )),
  referredBy INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  followedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unfollowedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(shopId, userId)
);


-- ============================================
-- INDEXES
-- ============================================

-- Shops indexes
CREATE INDEX idx_shops_ownerId ON shops(ownerId);
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_isActive ON shops(isActive);
CREATE INDEX idx_shops_category ON shops(category);
CREATE INDEX idx_shops_createdAt ON shops(createdAt);

-- Products indexes
CREATE INDEX idx_products_shopId ON products(shopId);
CREATE INDEX idx_products_sku ON products(shopId, sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_isPublished ON products(isPublished);
CREATE INDEX idx_products_isFeatured ON products(isFeatured);
CREATE INDEX idx_products_createdAt ON products(createdAt);

-- Orders indexes
CREATE INDEX idx_orders_shopId ON orders(shopId);
CREATE INDEX idx_orders_customerId ON orders(customerId);
CREATE INDEX idx_orders_orderNumber ON orders(orderNumber);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_orderedAt ON orders(orderedAt);
CREATE INDEX idx_orders_createdAt ON orders(createdAt);

-- Deals indexes
CREATE INDEX idx_deals_shopId ON deals(shopId);
CREATE INDEX idx_deals_orderId ON deals(orderId);
CREATE INDEX idx_deals_sellerId ON deals(sellerId);
CREATE INDEX idx_deals_buyerId ON deals(buyerId);
CREATE INDEX idx_deals_dealNumber ON deals(dealNumber);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_paymentStatus ON deals(paymentStatus);
CREATE INDEX idx_deals_createdAt ON deals(createdAt);

-- Payments indexes
CREATE INDEX idx_payments_shopId ON payments(shopId);
CREATE INDEX idx_payments_orderId ON payments(orderId);
CREATE INDEX idx_payments_dealId ON payments(dealId);
CREATE INDEX idx_payments_customerId ON payments(customerId);
CREATE INDEX idx_payments_transactionId ON payments(transactionId);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_createdAt ON payments(createdAt);

-- Reviews indexes
CREATE INDEX idx_reviews_shopId ON reviews(shopId);
CREATE INDEX idx_reviews_productId ON reviews(productId);
CREATE INDEX idx_reviews_customerId ON reviews(customerId);
CREATE INDEX idx_reviews_orderId ON reviews(orderId);
CREATE INDEX idx_reviews_type ON reviews(type);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_createdAt ON reviews(createdAt);

-- Shop Metrics indexes
CREATE INDEX idx_shop_metrics_shopId ON shop_metrics(shopId);
CREATE INDEX idx_shop_metrics_period ON shop_metrics(period);
CREATE INDEX idx_shop_metrics_periodStart ON shop_metrics(periodStart);

-- Shop Policies indexes
CREATE INDEX idx_shop_policies_shopId ON shop_policies(shopId);

-- Shop Followers indexes
CREATE INDEX idx_shop_followers_shopId ON shop_followers(shopId);
CREATE INDEX idx_shop_followers_userId ON shop_followers(userId);
CREATE INDEX idx_shop_followers_source ON shop_followers(source);
CREATE INDEX idx_shop_followers_referredBy ON shop_followers(referredBy);
CREATE INDEX idx_shop_followers_followedAt ON shop_followers(followedAt);
CREATE INDEX idx_shop_followers_createdAt ON shop_followers(createdAt);
