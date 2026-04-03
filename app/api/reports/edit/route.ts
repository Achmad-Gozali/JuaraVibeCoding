import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportId, ...updateFields } = body;

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'Report ID tidak ditemukan.' },
        { status: 400 }
      );
    }

    // Validasi link_url jika ada
    if (updateFields.link_url && typeof updateFields.link_url === 'string') {
      try {
        new URL(updateFields.link_url);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Format link URL tidak valid.' },
          { status: 400 }
        );
      }
    }

    // Validasi chronology minimal length
    if (updateFields.chronology && updateFields.chronology.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: 'Kronologi minimal 20 karakter.' },
        { status: 400 }
      );
    }

    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, status, reporter_id')
      .eq('id', reportId)
      .eq('reporter_id', user.id)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { success: false, message: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (report.status !== 'withdrawn') {
      return NextResponse.json(
        { success: false, message: 'Hanya laporan berstatus "Sedang Direvisi" yang bisa diedit.' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('reports')
      .update({
        ...updateFields,
        status: 'pending',
      })
      .eq('id', reportId)
      .eq('reporter_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Laporan berhasil diperbarui.' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}