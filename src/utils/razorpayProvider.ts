import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const RAZORPAY_ENDPOINT = process.env.EXPO_PUBLIC_RAZORPAY_ENDPOINT ?? "";

function buildCreateOrderUrl(endpoint: string) {
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  if (cleanEndpoint.endsWith("/razorpay-create-order")) return cleanEndpoint;
  return `${cleanEndpoint}/razorpay-create-order`;
}

const razorpayProvider = {
  async processPayment({
    amount,
    method,
    feeId,
  }: {
    amount: number;
    method: string;
    feeId?: string;
  }) {
    if (method !== "razorpay") throw new Error("Unsupported method");
    if (!feeId) throw new Error("Missing fee id for Razorpay payment");

    if (!RAZORPAY_ENDPOINT) {
      throw new Error("Missing EXPO_PUBLIC_RAZORPAY_ENDPOINT");
    }

    const redirectUrl = Linking.createURL("payment-return");
    console.log("razorpayProvider: redirectUrl", redirectUrl);

    console.log(
      "razorpayProvider: creating order, endpoint",
      buildCreateOrderUrl(RAZORPAY_ENDPOINT),
    );

    let res: Response;
    try {
      res = await fetch(buildCreateOrderUrl(RAZORPAY_ENDPOINT), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, feeId, callbackUrl: redirectUrl }),
      });
    } catch (err) {
      console.error(
        "razorpayProvider: network/fetch error creating order",
        err,
      );
      throw err;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("razorpayProvider: createOrder failed", res.status, text);
      throw new Error(`Failed to create Razorpay order: ${res.status} ${text}`);
    }

    const data = await res.json();

    if (data.checkoutUrl) {
      console.log("razorpayProvider: received checkoutUrl", data.checkoutUrl);
      try {
        // Use openAuthSessionAsync so the app can be returned to when Razorpay
        // redirects to the provided callback URL.
        const sessionResult = await WebBrowser.openAuthSessionAsync(
          data.checkoutUrl,
          redirectUrl,
        );
        console.log(
          "razorpayProvider: openAuthSessionAsync result",
          sessionResult,
        );
        // attach session result so callers can react to redirect/closure
        data._sessionResult = sessionResult;
      } catch (err) {
        console.error("razorpayProvider: failed to open auth session", err);
      }
    }

    return {
      success: true,
      status: "pending",
      orderId: data.orderId,
      keyId: data.keyId,
      amount: data.amount,
      currency: data.currency,
      transactionReference: null,
      receiptUrl: data.receiptUrl ?? null,
      sessionResult: data._sessionResult ?? null,
    };
  },
};

export default razorpayProvider;
