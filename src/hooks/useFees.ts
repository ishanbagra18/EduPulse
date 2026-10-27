import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FeesService from "../services/fees";
import * as PaymentsService from "../services/payments";
import paymentProvider from "../utils/paymentProvider";

export function useStudentFees(studentId?: string) {
  return useQuery({
    queryKey: ["fees", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await FeesService.fetchFeesByStudentId(studentId);
      return data ?? [];
    },
    enabled: !!studentId,
  });
}

export function useFees() {
  return useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const { data } = await FeesService.fetchAllFees();
      return data ?? [];
    },
  });
}

export function usePendingFees() {
  return useQuery({
    queryKey: ["pendingFees"],
    queryFn: async () => {
      const { data } = await FeesService.fetchPendingFees();
      return data ?? [];
    },
  });
}

export function useCreateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const r = await FeesService.createFee(payload);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useGenerateMonthlyFees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      month: string;
      amount: number;
      due_date?: string | null;
      class_id?: string | null;
      student_id?: string | null;
    }) => {
      const r = await FeesService.generateMonthlyFees(payload);
      if (r.error) throw r.error;
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useUpdateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const r = await FeesService.updateFee(id, patch);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useDeleteFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await FeesService.deleteFee(id);
      if (r.error) throw r.error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useMarkFeePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ feeId, payment }: { feeId: string; payment: any }) => {
      // process payment via provider (abstract)
      const result: any = await paymentProvider.processPayment({
        ...payment,
        feeId,
      });
      if (!result.success) throw new Error("Payment failed");

      if (payment.method === "razorpay") {
        qc.invalidateQueries({ queryKey: ["fees", feeId] });
        qc.invalidateQueries({ queryKey: ["pendingFees"] });
        return {
          payment: null,
          fee: null,
          order: {
            id: result.orderId,
            keyId: result.keyId,
            amount: result.amount,
            currency: result.currency,
          },
          status: "pending_webhook",
          sessionResult: result.sessionResult ?? null,
        };
      }

      // record payment
      const rec = await PaymentsService.createPaymentRecord({
        fee_id: feeId,
        amount: payment.amount,
        payment_method: payment.method,
        transaction_reference: result.transactionReference,
        payment_date: new Date().toISOString(),
        receipt_url: result.receiptUrl ?? null,
      });
      if (rec.error) throw rec.error;

      // update fee
      const upd = await FeesService.markFeePaid(feeId, { status: "paid" });
      if (upd.error) throw upd.error;
      qc.invalidateQueries({ queryKey: ["fees", feeId] });
      qc.invalidateQueries({ queryKey: ["pendingFees"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
      return { payment: rec.data, fee: upd.data };
    },
  });
}

export async function fetchStudentRecordForUser(userId: string) {
  const r = await FeesService.fetchStudentByUserId(userId);
  return r;
}
