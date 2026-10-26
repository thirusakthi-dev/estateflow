import { api } from "@/lib/api";
import type { DashboardData } from "./dashboard.types";

export async function getDashboardSummary(): Promise<DashboardData> {
  const response = await api.get("/dashboard");
  return response.data.data.dashboard;
}
