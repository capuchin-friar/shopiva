import { error } from "console";
import crypto from "crypto"
import paystackTools from "../../utils/paystack.js";
import { db } from "../../config/database.js";
import type { NewOrder } from "../../types/paystack.js";
import { upsertNewOrder } from "../../services/webhook/paystack.js";
const secret = process.env.PAYSTACK_SECRET_KEY;

export async function PaystackWebhookController(req: Request, res: Response): Promise<void> {

  try {
    if(!secret){
      res.status(500).send("Missing Paystack secret");
      return;
    }
  
    const rawBody = (req as any ).rawBody;
  
    // validate webhook signature
    const signature = req.headers["x-paystack-signature"] as string;
    const hash = crypto
    .createHmac('sha512', secret as any)
    .update(rawBody)
    .digest('hex');
  
    const isValid =
    signature &&
    Buffer.byteLength(hash) === Buffer.byteLength(signature) &&
    crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  
    if(!isValid){
      res.status(401).send("Invalid signature");
      return;
    }

    const pool = await db();
    const rawEvent = JSON.parse(rawBody.toString());
    const { event: eventType, data: paystackData } = rawEvent;

    // Store all webhook deliveries for audit trail
    await pool.query(
      `
        INSERT INTO paystack_webhook_deliveries(
          id, body_hash, reference, paystack_event, created_at
        ) VALUES(
         DEFAULT, $1, $2, $3, NOW()
        )
      `, [
        crypto.createHash('sha256').update(rawBody).digest('hex'),
        paystackData.reference,
        eventType
      ]
    );

    // Store transaction details
    await pool.query(
      `
        INSERT INTO paystack_transactions(
          id, paystack_charge_id, reference, event, amount, currency, status, channel, customer_email, metadata, paid_at, raw_payload, created_at, updated_at
        ) VALUES(
         DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
      `, [
        paystackData.id,
        paystackData.reference,
        eventType,
        paystackData.amount / 100, // Convert from kobo to main currency unit
        paystackData.currency,
        paystackData.status,
        paystackData.channel,
        paystackData.customer.email,
        JSON.stringify(paystackData.metadata || {}),
        paystackData.paid_at,
        rawBody.toString()
      ]
    );
  
    // Process only successful charges
    if (eventType !== "charge.success") {
      res.status(200).send("Ignored");
      return;
    }

    const { metadata, reference } = paystackData;
    const { isSinglePurchase, shop_id, customer_id, shipping_address, shipping_method, shipping_fee, tax } = metadata || {};

    // Verify payment with Paystack
    const paymentVerificationHandler = await paystackTools.verifyPayment(reference);
    const isPaymentVerified = paymentVerificationHandler.data.status;

    if(!isPaymentVerified){
      res.status(401).send("Payment not verified");
      return;
    }

    // Check if order already exists
    const { rows: existingOrder } = await pool.query(
      `SELECT id FROM orders WHERE payment_reference = $1`,
      [reference]
    );

    if(existingOrder.length > 0){
      res.status(200).json({ message: "Order already processed" });
      return;
    }

    // Create order from Paystack data
    const newOrder: NewOrder = {
      order_id: reference,
      customer_id: customer_id || paystackData.customer.email,
      shop_id: shop_id,
      amount_paid: (paystackData.amount / 100) - (shipping_fee || 0) - (tax || 0),
      shipping_fee: shipping_fee || 0,
      tax: tax || 0,
      charges: paystackData.fees / 100,
      total_paid: paystackData.amount / 100,
      currency: paystackData.currency,
      fulfillment_status: 'pending',
      escrow_status: 'held',
      payment_status: paystackData.status,
      shipping_address: shipping_address || '',
      payment_reference: reference,
      shipping_method: shipping_method || '',
      tracking_number: ''
    };

    if(isSinglePurchase){
      // Handle single purchase order
      await upsertNewOrder(newOrder);
    } else {
      // Handle bulk/multiple items order
      await upsertNewOrder(newOrder);
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    res.status(500).send("Webhook error");
    return;
  }
}