import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ResetPasswordClient from "./ResetPasswordClient";
import { getAppSessionFromCookies } from "@/lib/auth/get-app-session";

const RESET_FLOW_COOKIE = "reset_password_flow";

export default async function ResetPasswordPage() {
  const appSession = await getAppSessionFromCookies();

  if (appSession) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const hasResetFlow = cookieStore.get(RESET_FLOW_COOKIE)?.value === "1";

  if (!hasResetFlow) {
    redirect("/forgot-password");
  }

  return <ResetPasswordClient />;
}