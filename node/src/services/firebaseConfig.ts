import admin from "firebase-admin";
import dotenv from "dotenv";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
// import serviceAccount from "../../shopiva-f66b6-firebase-adminsdk-fbsvc-c25ec3e07b.json" with { type: "json" };
dotenv.config();

function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT
    ? resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccountPath && existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, "utf8")
    ) as admin.ServiceAccount & { project_id?: string };

    const projectId =
      serviceAccount.projectId || serviceAccount.project_id;
    if (!projectId) {
      throw new Error(
        "Firebase service account JSON is missing project_id."
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
    console.log(
      `[firebase] initialized from ${process.env.FIREBASE_SERVICE_ACCOUNT} (project ${projectId})`
    );
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    projectId,
  });
  // console.log(`[firebase] initialized from env vars (project ${projectId})`);
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount as any)
  // })
}

initFirebaseAdmin();

export async function sendFcmForActivities(
  token: string,
  title: string,
  body: string,
  media: unknown,
  meta: Record<string, any>
) {
  try {
    const message = {
      token,
      data: {
        title,
        body,
        media: JSON.stringify(media),
        meta: JSON.stringify(meta),
      },
    };

    const response = await admin.messaging().send(message);

    console.log("Successfully sent notification:", response);

    return {
      success: true,
      response,
    };
  } catch (error: any) {
    console.error("Failed to send notification:", error);
    return {
      success: false,
      error: error.message || error,
      code: error.code || error.errorInfo?.code,
      hint:
        error.code === "messaging/third-party-auth-error"
          ? "FCM server auth is fine; this usually means missing/invalid APNs (.p8) for iOS or Web Push certificates in Firebase Console → Project settings → Cloud Messaging. Also confirm the device token belongs to project shopiva-f66b6."
          : undefined,
    };
  }
}

export async function sendFcmForNewMssg(
  token: string,
  title: string,
  body: string,
  meta: Record<string, any>
) {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        title,
        body,
        meta: JSON.stringify(meta),
      },
    };

    const response = await admin.messaging().send(message);

    console.log("Successfully sent notification:", response);

    return {
      success: true,
      response,
    };
  } catch (error: any) {
    console.error("Error sending notification:", error);

    return {
      success: false,
      error: error.message || error,
    };
  }
}
