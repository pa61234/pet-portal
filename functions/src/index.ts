import * as functions from "firebase-functions/v1";

// Sharetribe webhook handler
export const sharetribeWebhook = functions
  .region("asia-northeast3")
  .https.onRequest((req, res) => {
    res.status(200).json({ ok: true });
  });
