import supabase from "./supabase";

export async function createPaymentRecord(payload: any) {
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function fetchPaymentsForFee(fee_id: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("fee_id", fee_id)
    .order("payment_date", { ascending: false });
  return { data, error };
}
