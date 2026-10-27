function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

async function hmacSha256(secret: string, payload: string) {
  const enc = new TextEncoder();
  const key = enc.encode(secret);
  const data = enc.encode(payload);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const arr = Array.from(new Uint8Array(sig));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
  if (!webhookSecret) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const expected = await hmacSha256(webhookSecret, raw);
  if (!timingSafeEqual(expected, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(raw);

  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) {
      return new Response("Supabase not configured", { status: 500 });
    }

    const feeId = payment.notes?.fee_id ?? payment.notes?.feeId ?? null;
    if (!feeId) {
      return new Response("Missing fee_id in Razorpay payment notes", {
        status: 400,
      });
    }

    const paymentRes = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
      body: JSON.stringify({
        fee_id: feeId,
        amount: payment.amount / 100,
        payment_method: payment.method,
        transaction_reference: payment.id,
        payment_date: new Date(payment.created_at * 1000).toISOString(),
        receipt_url: payment.references?.receipt || null,
      }),
    });

    if (!paymentRes.ok) {
      return new Response(await paymentRes.text(), { status: 500 });
    }

    const feeRes = await fetch(`${supabaseUrl}/rest/v1/fees?id=eq.${feeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
      body: JSON.stringify({ status: "paid" }),
    });

    if (!feeRes.ok) {
      return new Response(await feeRes.text(), { status: 500 });
    }
  }

  return new Response("ok");
});
