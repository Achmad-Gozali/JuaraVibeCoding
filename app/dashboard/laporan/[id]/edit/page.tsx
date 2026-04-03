import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import EditReportForm from "./EditReportForm";

// 1. Ubah tipe data params menjadi Promise
export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 2. Lakukan await params untuk mengambil id
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id) // 3. Gunakan id yang sudah di-await tadi
    .eq("reporter_id", user.id)
    .single();

  if (!report) redirect("/dashboard/laporan");

  return <EditReportForm report={report} />;
}