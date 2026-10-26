export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SALES_EMPLOYEE";
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type CurrentUserResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
};
