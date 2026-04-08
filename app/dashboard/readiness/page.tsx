 import { redirect } from "next/navigation";

export default function ReadinessPage() {
  redirect("/dashboard/readiness/overview");
}