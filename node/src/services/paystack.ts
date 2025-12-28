import type { InitiateTransfer, NewPaystackRecipient } from "../types/business.js";
import https from "https";

export class paystack {

    static async createRecipient(payload: NewPaystackRecipient) {

        const {
            name,
            account_number,
            bank_code,
        } = payload

        const params = JSON.stringify({
            type: "nuban",
            name,
            account_number,
            bank_code,
            currency: "NGN"
        });

        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transferrecipient",
            method: "POST",
            headers: {
            Authorization: `Bearer ${process.env.paystack_secret_key}`,
            "Content-Type": "application/json"
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                const parsed = JSON.parse(data);
                resolve(parsed);
                } catch (err) {
                reject(new Error("Invalid JSON response from Paystack"));
                }
            });
            });

            req.on("error", (error) => {
            reject(error);
            });

            req.write(params);
            req.end();
        });
    }


    static async initiateTransfer(payload: InitiateTransfer) {

        const {
            amount, recipient, reason, reference
        } = payload;

        const params = JSON.stringify({
            "source": "balance",
            "reason": reason,
            "amount": amount,
            "recipient": recipient,
            "reference": reference
        })

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transfer',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.paystack_secret_key}`,
                'Content-Type': 'application/json'
            }
        }

        const req = https.request(options, res => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            });

            res.on('end', () => {
                console.log(JSON.parse(data))
            })
        }).on('error', error => {
            console.error(error)
        })

        req.write(params)
        req.end()
    }



    static generateRefId(prefix = 'REF') {
        const timestamp = Date.now().toString(36).toUpperCase(); // Encodes current time
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random string
        return `${prefix}-${timestamp}-${randomPart}`;
    }

}