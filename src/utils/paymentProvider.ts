import razorpayProvider from "./razorpayProvider";

const paymentProvider = {
  async processPayment({
    amount,
    method,
    feeId,
  }: {
    amount: number;
    method: string;
    feeId?: string;
  }) {
    if (method === "razorpay")
      return await razorpayProvider.processPayment({ amount, method, feeId });

    // default: simulate immediate success (cash/manual)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionReference: `TXN_${Date.now()}`,
          receiptUrl: null,
        });
      }, 300);
    });
  },
};

export default paymentProvider;
