# Shop-related tables — column names (from migrations)

Tables that reference `shops` or are part of the shop domain.

---

## `shops` — `002_create_shops.sql`

| Field |
|-------|
| `id` |
| `ownerId` |
| `name` |
| `slug` |
| `description` |
| `logo` |
| `banner` |
| `category` |
| `tags` |
| `contactEmail` |
| `contactPhone` |
| `location` |
| `socialLinks` |
| `isActive` |
| `isVerified` |
| `status` |
| `verificationDocuments` |
| `createdAt` |
| `updatedAt` |

> **PostgreSQL note:** Unquoted identifiers are stored lowercase (e.g. `ownerid`, `createdat`). Use `ownerid` / `createdat` in raw SQL unless columns were created with quoted mixed-case names.

---

## `shop_accounts` — `003_create_shop_accounts.sql`

| Field |
|-------|
| `id` |
| `shop_id` |
| `available_balance` |
| `pending_balance` |
| `frozen_balance` |
| `currency` |
| `status` |
| `created_at` |
| `updated_at` |

---

## `shop_policies` — `004_create_shop_policiew.sql`

| Field |
|-------|
| `id` |
| `shopid` |
| `deliverypolicy` |
| `refundpolicy` |
| `custompolicies` |
| `createdat` |
| `updatedat` |

---

## `shop_account_ledger` — `005_create_shop_account_ledger.sql`

| Field |
|-------|
| `id` |
| `shop_account_id` |
| `source_type` |
| `source_id` |
| `amount` |
| `direction` |
| `balance_after` |
| `created_at` |

---

## `shop_payout_accounts` — `006_create_shop_payout_account.sql`

| Field |
|-------|
| `id` |
| `shop_id` |
| `provider` |
| `country_code` |
| `currency` |
| `bank_name` |
| `bank_code` |
| `account_name` |
| `account_number_last4` |
| `provider_recipient_id` |
| `provider_account_id` |
| `is_primary` |
| `status` |
| `verification_method` |
| `verification_failed_reason` |
| `created_at` |
| `updated_at` |

---

## `shop_reviews` — `007_create_shop_reviews.sql`

| Field |
|-------|
| `id` |
| `shop_id` |
| `reviewer_id` |
| `order_id` |
| `rating` |
| `title` |
| `comment` |
| `is_verified_purchase` |
| `is_hidden` |
| `hidden_reason` |
| `created_at` |
| `updated_at` |

---

## `shop_review_metrics` — `008_create_shop_review_metrics.sql`

| Field |
|-------|
| `shop_id` |
| `review_count` |
| `average_rating` |
| `rating_1_count` |
| `rating_2_count` |
| `rating_3_count` |
| `rating_4_count` |
| `rating_5_count` |
| `last_reviewed_at` |
| `updated_at` |

---

## `products` — `012_create_products.sql` (FK to `shops`)

| Field |
|-------|
| `id` |
| `shop_id` |
| `name` |
| `slug` |
| `description` |
| `short_description` |
| `category` |
| `subcategory` |
| `brand` |
| `images` |
| `videos` |
| `tags` |
| `weight` |
| `dimensions` |
| `specifications` |
| `status` |
| `is_published` |
| `published_at` |
| `is_featured` |
| `created_at` |
| `updated_at` |

---

## Migration files (shop-related)

| File | Table(s) |
|------|----------|
| `002_create_shops.sql` | `shops` |
| `003_create_shop_accounts.sql` | `shop_accounts` |
| `004_create_shop_policiew.sql` | `shop_policies` |
| `005_create_shop_account_ledger.sql` | `shop_account_ledger` |
| `006_create_shop_payout_account.sql` | `shop_payout_accounts` |
| `007_create_shop_reviews.sql` | `shop_reviews` |
| `008_create_shop_review_metrics.sql` | `shop_review_metrics` |
| `012_create_products.sql` | `products` (references `shops`) |

`013_create_inventory.sql` is product-related (`inventory.product_id` → `products`), not directly on `shops`.
