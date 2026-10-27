Razorpay Integration (Notes)

1. Create a secure backend endpoint (Edge Function / server) to create Razorpay orders using the secret key.

Example (Node/Express) pseudocode:

POST /create-order

- body: { amount, feeId }
- create order via Razorpay REST API, return a `checkoutUrl` or `orderId` to client

2. Configure `EXPO_PUBLIC_RAZORPAY_ENDPOINT` in your `.env` to point to the backend URL.

3. The mobile app opens the returned `checkoutUrl` in the browser. Use webhooks on the server to confirm payment and update the `payments` and `fees` tables.

4. For production, implement signature verification and a webhook that records the payment then updates the fee status.

Supabase Edge Function (recommended) can host the create-order handler and use `RAZORPAY_SECRET` stored in project secrets.
