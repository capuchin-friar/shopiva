import type { InitiateTransfer, NewPaystackRecipient } from "../types/business.js";
import https from "https";
import dotenv from "dotenv";
dotenv.config();

export class paystack {
    static secretKey() {
        const raw = process.env.PAYSTACK_SECRET_KEY || process.env.paystack_secret_key || "";
        const trimmed = String(raw).trim().replace(/^['"]|['"]$/g, "");
        return trimmed.replace(/^Bearer\s+/i, "");
    }

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
            Authorization: `Bearer ${paystack.secretKey()}`,
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

    static async verifyAccountNumber(payload: { account_number: string; bank_code: string }) {
        const { account_number, bank_code } = payload;
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: `/bank/resolve?account_number=${encodeURIComponent(account_number)}&bank_code=${encodeURIComponent(bank_code)}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${paystack.secretKey()}`,
            },
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
                    } catch {
                        reject(new Error("Invalid JSON response from Paystack"));
                    }
                });
            });
            req.on("error", (err) => reject(err));
            req.end();
        });
    }

    static async listBanks() {
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/bank?country=nigeria&currency=NGN",
            method: "GET",
            headers: {
                Authorization: `Bearer ${paystack.secretKey()}`,
            },
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        reject(new Error("Invalid JSON response from Paystack"));
                    }
                });
            });
            req.on("error", (err) => reject(err));
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
            "amount": amount*100,
            "recipient": recipient,
            "reference": reference
        })

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transfer',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystack.secretKey()}`,
                'Content-Type': 'application/json'
            }
        }

        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                let data = ''
    
                res.on('data', (chunk) => {
                    data += chunk
                });
    
                res.on('end', () => {
                    resolve(JSON.parse(data))
                })
            }).on('error', error => {
                reject(error);
            })
            req.write(params)
            req.end()
        })

    }



    static generateRefId(prefix = 'REF') {
        const timestamp = Date.now().toString(36).toUpperCase(); // Encodes current time
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random string
        return `${prefix}-${timestamp}-${randomPart}`;
    }

    /**
     * Verify a Paystack transaction by reference (NGN amounts are in **kobo** in `data.amount`).
     * @see https://paystack.com/docs/api/#transaction-verify
     */
    static async verifyTransaction(reference: string): Promise<Record<string, unknown>> {
        const ref = String(reference ?? "").trim();
        if (!ref) {
            throw new Error("reference is required");
        }
        const secret = paystack.secretKey();
        if (!secret) {
            throw new Error("PAYSTACK_SECRET_KEY is not configured");
        }
        const path = `/transaction/verify/${encodeURIComponent(ref)}`;
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path,
            method: "GET",
            headers: {
                Authorization: `Bearer ${secret}`,
            },
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    try {
                        const parsed = JSON.parse(data) as Record<string, unknown>;
                        resolve(parsed);
                    } catch {
                        reject(new Error("Invalid JSON response from Paystack verify"));
                    }
                });
            });
            req.on("error", (err) => reject(err));
            req.end();
        });
    }

}