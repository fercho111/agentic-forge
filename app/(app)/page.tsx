import { requireAppSessionForPage } from "@/lib/auth/require-app-session";
import { createAdminClient } from "@/lib/supabase/admin";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await requireAppSessionForPage();

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(session.user_id);

  return <HomeClient userEmail={data.user?.email ?? null} />;
}
