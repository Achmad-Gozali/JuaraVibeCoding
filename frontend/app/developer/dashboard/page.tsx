import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import DeveloperDashboardClient from './DeveloperDashboardClient';

export default async function DeveloperDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/developer/dashboard');

  return <DeveloperDashboardClient />;
}