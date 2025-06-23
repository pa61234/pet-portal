import * as functions from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v2/https";
import fetch from "node-fetch";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Get Firebase Functions config
const functionsConfig = functions.config();

// Sharetribe webhook handler
export const sharetribeWebhook = functions
  .region("asia-northeast3")
  .https.onRequest(async (req, res) => {
    try {
      logger.info("Sharetribe webhook received", { body: req.body });
      
      // Handle different Sharetribe events
      const eventType = req.body.event;
      
      switch (eventType) {
        case "transaction/transition/initiate":
          await handleTransactionInitiated(req.body);
          break;
        case "transaction/transition/pay-in-full":
          await handlePaymentCompleted(req.body);
          break;
        default:
          logger.info("Unhandled event type", { eventType });
      }
      
      res.status(200).json({ ok: true });
    } catch (error) {
      logger.error("Sharetribe webhook error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

/* --- Toss 결제 웹훅 ---------------------------------- */
const SHARETRIBE_BASE = "https://flex.sharetribe.com/v1";
const SHARETRIBE_CLIENT_ID = functionsConfig.sharetribe?.client_id;
const SHARETRIBE_CLIENT_SECRET = functionsConfig.sharetribe?.client_secret;

export const tossWebhook = onRequest(
  { region: "asia-northeast3" },
  async (req, res) => {
    logger.info("Toss webhook received", { body: req.body });
    
    // Toss가 보내는 샘플 페이로드: { status:"DONE", orderId:"tx_123" , ... }
    if (req.method !== "POST" || req.body.status !== "DONE") {
      logger.info("Ignoring non-DONE Toss event", { status: req.body.status });
      res.status(200).end(); // 다른 이벤트는 무시
      return;
    }

    try {
      // ① Sharetribe 트랜잭션 capture (예: pay-in-full)
      const txId = req.body.orderId;
      
      const response = await fetch(
        `${SHARETRIBE_BASE}/transactions/${txId}/transition/pay-in-full`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              "Basic " +
              Buffer.from(
                `${SHARETRIBE_CLIENT_ID}:${SHARETRIBE_CLIENT_SECRET}`
              ).toString("base64"),
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Sharetribe API error: ${response.status}`);
      }

      // ② Firestore에 트랜잭션 상태 업데이트
      await db.collection("transactions").doc(txId).set({
        status: "payment_completed",
        paymentMethod: "toss",
        paymentId: req.body.paymentKey,
        amount: req.body.totalAmount,
        updatedAt: new Date(),
        tossData: req.body
      }, { merge: true });

      logger.info("Sharetribe transaction captured and Firestore updated", { txId });
      res.status(200).json({ ok: true });
    } catch (e) {
      logger.error("Toss webhook error", e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* --- RFID 업데이트 함수 ---------------------------------- */
export const rfidUpdate = onRequest(
  { region: "asia-northeast3" },
  async (req, res) => {
    // CORS 설정
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { txId, rfidTag, status, location } = req.body;
      const authHeader = req.headers.authorization;

      // 간단한 인증 (실제로는 더 강력한 인증 필요)
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const token = authHeader.split("Bearer ")[1];
      // TODO: 실제 토큰 검증 로직 구현

      if (!txId || !rfidTag || !status) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Firestore에 RFID 스캔 정보 저장
      await db.collection("transactions").doc(txId).set({
        status: status,
        rfidTag: rfidTag,
        location: location || "unknown",
        scannedAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      // 상태별 추가 처리
      switch (status) {
        case "pickup_started":
          await handlePickupStarted(txId, rfidTag);
          break;
        case "cremation_started":
          await handleCremationStarted(txId, rfidTag);
          break;
        case "cremation_completed":
          await handleCremationCompleted(txId, rfidTag);
          break;
        case "delivery_started":
          await handleDeliveryStarted(txId, rfidTag);
          break;
        case "delivery_completed":
          await handleDeliveryCompleted(txId, rfidTag);
          break;
      }

      logger.info("RFID update successful", { txId, rfidTag, status });
      res.status(200).json({ 
        ok: true, 
        message: "RFID update processed successfully" 
      });
    } catch (error) {
      logger.error("RFID update error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Helper functions for handling different transaction events
async function handleTransactionInitiated(data: any) {
  const txId = data.transaction?.id;
  if (txId) {
    await db.collection("transactions").doc(txId).set({
      status: "initiated",
      createdAt: new Date(),
      updatedAt: new Date(),
      sharetribeData: data
    }, { merge: true });
  }
}

async function handlePaymentCompleted(data: any) {
  const txId = data.transaction?.id;
  if (txId) {
    await db.collection("transactions").doc(txId).set({
      status: "payment_completed",
      updatedAt: new Date(),
      sharetribeData: data
    }, { merge: true });
  }
}

// RFID status handlers
async function handlePickupStarted(txId: string, rfidTag: string) {
  // 픽업 시작 시 알림 발송 로직
  logger.info("Pickup started", { txId, rfidTag });
}

async function handleCremationStarted(txId: string, rfidTag: string) {
  // 화장 시작 시 알림 발송 로직
  logger.info("Cremation started", { txId, rfidTag });
}

async function handleCremationCompleted(txId: string, rfidTag: string) {
  // 화장 완료 시 알림 발송 로직
  logger.info("Cremation completed", { txId, rfidTag });
}

async function handleDeliveryStarted(txId: string, rfidTag: string) {
  // 배송 시작 시 알림 발송 로직
  logger.info("Delivery started", { txId, rfidTag });
}

async function handleDeliveryCompleted(txId: string, rfidTag: string) {
  // 배송 완료 시 알림 발송 로직
  logger.info("Delivery completed", { txId, rfidTag });
}
