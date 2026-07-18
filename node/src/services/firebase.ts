// import dotenv from 'dotenv';
// dotenv.config(); // ✅ must come first!

// import admin from 'firebase-admin';
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";


// // Initialize Firebase Admin
// if (!admin.apps.length) {
//   const serviceAccount = JSON.parse(
//     Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8")
//   );

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }
// // Send Notification Function
// export function sendNotification(token, title, body, media, price, product_id) {
//   const message = {
//     token,
//     data: {
//       title,
//       body,
//       media,
//       price,
//       product_id,
//     },
//   };

//   admin
//     .messaging()
//     .send(message)
//     .then((response) => {
//       console.log('Successfully sent:', response);
//     })
//     .catch((error) => {
//       console.error('Error sending:', error.message || error);
//     });
// }

// export async function sendNoticeForNewMsg(token, title, body, room, partner) {
//   const message = {
//     token,
//     notification: {
//       title,
//       body,
//     },
//     data: {
//       title,
//       body,
//       room,
//       partner: JSON.stringify(partner), // must be stringified if object
//     },
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('✅ Successfully sent:', response);
//     return { success: true, response };
//   } catch (error) {
//     console.error('❌ Error sending:', error.message || error);
//     return { success: false, error: error.message || error };
//   }
// }