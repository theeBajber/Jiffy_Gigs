// lib/mpesa.ts
import axios from "axios";

const MPESA_BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage?: string;
}

export async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64",
  );

  const response = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  return response.data.access_token;
}

export function getTimestamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function generatePassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;

  const password = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(password).toString("base64");
}

function normalizePhone(phone: string): string {
  // Remove any spaces, dashes, or plus signs
  let cleaned = phone.replace(/[\s\-\+]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}

export async function initiateSTKPush({
  phoneNumber,
  amount,
  accountReference,
  transactionDesc,
  callbackUrl,
}: STKPushRequest): Promise<STKPushResponse> {
  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const normalizedPhone = normalizePhone(phoneNumber);

  const wholeAmount = Math.round(amount);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: wholeAmount,
    PartyA: normalizedPhone,
    PartyB: shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference.slice(0, 12),
    TransactionDesc: transactionDesc.slice(0, 13),
  };

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

export async function querySTKStatus(checkoutRequestId: string) {
  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
