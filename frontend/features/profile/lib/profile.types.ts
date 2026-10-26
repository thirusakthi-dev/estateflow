export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  role: "ADMIN" | "SALES_EMPLOYEE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProfileResponse = {
  user: Profile;
};

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
