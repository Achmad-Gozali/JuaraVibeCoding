import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import EditReportForm from "./EditReportForm";

export default async function EditReportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient(); // ✅ tambah await di sini

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .eq("reporter_id", user.id)
    .single();

  if (!report) redirect("/dashboard/laporan");

  return <EditReportForm report={report} />;
}
