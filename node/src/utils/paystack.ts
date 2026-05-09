import https from "https";
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default class paystackTools {


    static verifyPayment(ref: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.paystack.co',
                port: 443,
                path: `/transaction/verify/${ref}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${SECRET_KEY}`
                }
            };

            https.request(options, res => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (error) {
                        reject(new Error('Failed to parse payment verification response'));
                    }
                });
            }).on('error', (error) => {
                console.error(error);
                reject(new Error('Payment verification error'));
            });
        });
    }
}