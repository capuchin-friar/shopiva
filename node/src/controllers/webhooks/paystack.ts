import { error } from "console";
import crypto from "crypto"
import paystackTools from "../../utils/paystack.js";
import { db } from "../../config/database.js";
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
  
    const event = JSON.parse(rawBody.toString());
    // process only successful charges
    if (event.event !== "charge.success") {
      res.status(200).send("Ignored");
      return;
    }

    const { metadata, reference } = event.data;
    const { isSinglePurchase } = metadata;

    const paymentVerificationHandler = 
      await paystackTools.verifyPayment(reference);
    const isPaymentVerified = paymentVerificationHandler.data.status;

    if(!isPaymentVerified){
      res.status(401).send("Payment not verified");
      return;
    }

    // const result = (await db()).pool(
    //   `SELECT COUNT(*) as count FROM orders WHERE reference = $1`,[reference]
    // );
    // const count = result.rows[0]?.count || 0;
    // if(count > 0){
    //   res.status(200);
    //   return;
    // }



    // if(isSinglePurchase){

    // }

    // if(!isSinglePurchase){

    // }

    // do something
  
  } catch (error) {
    res.status(500).send("Webhook error");
    return;
  }
}