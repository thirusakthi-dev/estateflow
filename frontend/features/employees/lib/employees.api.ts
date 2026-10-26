import { api } from "@/lib/api";

import type {
  CreateEmployeeInput,
  EmployeeResponse,
  EmployeesResponse,
  UpdateEmployeeInput,
  UpdateEmployeeStatusInput,
} from "./employees.types";

export async function getEmployees(): Promise<EmployeesResponse> {
  const response = await api.get("/users");
  return response.data.data;
}

export async function getEmployee(id: string): Promise<EmployeeResponse> {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<EmployeeResponse> {
  const response = await api.post("/users", input);
  return response.data.data;
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<EmployeeResponse> {
  const response = await api.patch(`/users/${id}`, input);
  return response.data.data;
}

export async function updateEmployeeStatus(
  id: string,
  input: UpdateEmployeeStatusInput,
): Promise<EmployeeResponse> {
  const response = await api.patch(`/users/${id}/status`, input);
  return response.data.data;
}
