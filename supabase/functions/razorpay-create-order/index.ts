const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const feeId = body.feeId;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!feeId) {
      return new Response(JSON.stringify({ error: "Missing feeId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay keys not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    // Create a Razorpay Payment Link so the app can open a direct checkout URL.
    const callbackUrl = body.callbackUrl ?? null;

    // Only include callback_url if it's a valid http(s) URL. Razorpay rejects
    // non-http(s) schemes (for example custom app schemes like
    // "schoolmanagementsystemapp://..."). If a mobile client sends a
    // non-http callback, omit it here and rely on webhooks or a redirect
    // page that forwards to the app scheme.
    // Use a compact unique reference_id to avoid Razorpay "already exists"
    // errors while staying under Razorpay's 40 character limit. We still
    // include the original `feeId` in `notes` for server-side mapping.
    const uniqueReferenceId = crypto.randomUUID();
    console.log("razorpay-create-order: using reference_id", uniqueReferenceId);

    const payload: Record<string, unknown> = {
      amount: Math.round(amount * 100),
      currency: "INR",
      reference_id: uniqueReferenceId,
      description: `Payment for fee ${feeId}`,
      notes: { fee_id: feeId },
    };

    if (callbackUrl) {
      try {
        const parsed = new URL(callbackUrl);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          payload.callback_url = callbackUrl;
          payload.callback_method = "get";
        } else {
          console.warn(
            "razorpay-create-order: omitting non-http callback_url",
            callbackUrl,
          );
        }
      } catch (e) {
        console.warn("razorpay-create-order: invalid callbackUrl", callbackUrl);
      }
    }

    const linkRes = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!linkRes.ok) {
      const text = await linkRes.text();
      return new Response(
        JSON.stringify({
          error: "Razorpay payment link failed",
          details: text,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await linkRes.json();

    return new Response(
      JSON.stringify({
        checkoutUrl: data.short_url,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
