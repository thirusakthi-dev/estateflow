
export type Employee = {
  id: string;
  name: string;
  email: string;
  role: "SALES_EMPLOYEE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeesResponse = {
  users: Employee[];
};

export type EmployeeResponse = {
  user: Employee;
};

export type CreateEmployeeInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdateEmployeeInput = {
  name?: string;
  email?: string;
};

export type UpdateEmployeeStatusInput = {
  isActive: boolean;
};
