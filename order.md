/**
 * ORDER MANAGEMENT FLOW
 *
 * Core Principle:
 * Buyer payment enters escrow first.
 * Vendor only receives funds after successful completion.
 */

/**
 * -----------------------------------------
 * STAGE 1 — PAYMENT INITIATED
 * -----------------------------------------
 * Buyer places order and completes payment.
 *
 * ACTIONS:
 * - Create escrow transaction
 * - Reserve inventory (optional)
 * - Generate order
 */

status = "PAID";


/**
 * -----------------------------------------
 * STAGE 2 — AWAITING VENDOR RESPONSE
 * -----------------------------------------
 * Vendor must accept/reject within 24 hours.
 */

status = "AWAITING_ACCEPTANCE";


/**
 * CASE 1 — Vendor rejects order
 */
if (vendor.rejectsOrder) {

    /**
     * ACTIONS:
     * - Cancel order
     * - Refund buyer
     * - Close escrow
     */

    status = "CANCELLED";
}


/**
 * CASE 2 — Vendor does not respond within 24hrs
 */
if (acceptanceTimeoutExceeded) {

    /**
     * ACTIONS:
     * - Auto cancel order
     * - Refund buyer
     * - Close escrow
     */

    status = "CANCELLED";
}


/**
 * CASE 3 — Vendor accepts order
 */
if (vendor.acceptsOrder) {

    /**
     * ACTIONS:
     * - Lock order
     * - Begin fulfillment process
     */

    status = "PROCESSING";
}


/**
 * -----------------------------------------
 * STAGE 3 — ORDER FULFILLMENT
 * -----------------------------------------
 * Vendor prepares and dispatches item.
 */

if (vendor.shipsOrder) {

    /**
     * ACTIONS:
     * - Upload tracking info
     * - Add courier details
     * - Notify buyer
     */

    status = "SHIPPED";
}


/**
 * -----------------------------------------
 * STAGE 4 — DELIVERY CONFIRMATION
 * -----------------------------------------
 * Buyer receives item.
 */

if (buyer.confirmsDelivery) {

    /**
     * ACTIONS:
     * - Start 24hr review/protection window
     */

    status = "DELIVERED";
}


/**
 * -----------------------------------------
 * STAGE 5 — REVIEW WINDOW / DISPUTE PERIOD
 * -----------------------------------------
 */


/**
 * CASE 1 — Buyer opens dispute
 */
if (buyer.opensDispute) {

    /**
     * ACTIONS:
     * - Freeze escrow funds
     * - Request evidence from both parties
     */

    status = "DISPUTED";
}


/**
 * Vendor responds to dispute
 */
if (vendor.acceptsDispute) {

    /**
     * Example outcomes:
     * - Partial refund
     * - Full refund
     * - Replacement process
     */

    status = "RESOLVED";
}


if (vendor.rejectsDispute) {

    /**
     * ACTIONS:
     * - Escalate to admin/moderator
     * - Admin reviews evidence
     */

    status = "UNDER_REVIEW";
}


/**
 * Admin final decision
 */
if (admin.rulesInFavorOfBuyer) {

    /**
     * ACTIONS:
     * - Refund buyer
     */

    status = "REFUNDED";
}


if (admin.rulesInFavorOfVendor) {

    /**
     * ACTIONS:
     * - Release escrow funds
     */

    status = "COMPLETED";
}


/**
 * -----------------------------------------
 * CASE 2 — No dispute created
 * -----------------------------------------
 */

if (reviewWindowExpires && !buyer.opensDispute) {

    /**
     * ACTIONS:
     * - Automatically release escrow
     * - Pay vendor
     */

    status = "COMPLETED";
}











stages

1. payment
2. processing
3. shipped/dispatched
4. out_for_delivery
5. delivered