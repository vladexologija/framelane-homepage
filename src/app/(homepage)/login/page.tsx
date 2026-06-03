import { redirect } from "next/navigation";
import { SITE } from "@/lib/constants";

export default function LoginPage() {
  redirect(SITE.consoleUrl);
}
