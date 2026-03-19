import api from "./api";
import type {
  AuthResponse,
  PaginatedWeightResponse,
  User,
  WeightEntry,
} from "@/types/api";

export const login = (email: string, password: string): Promise<AuthResponse> =>
  api
    .post<AuthResponse>("/api/auth/login", { email, password })
    .then((r) => r.data);

export const register = (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> =>
  api
    .post<AuthResponse>("/api/auth/register", { name, email, password })
    .then((r) => r.data);

export const getMe = (): Promise<User> =>
  api.get<User>("/api/auth/me").then((r) => r.data);

export const getWeightEntries = (params: {
  page?: number;
  page_size?: number;
  time_filter?: "7d" | "30d" | "3m" | "all";
}): Promise<PaginatedWeightResponse> =>
  api
    .get<PaginatedWeightResponse>("/api/weight", { params })
    .then((r) => r.data);

export const createWeightEntry = (weight_value: number): Promise<WeightEntry> =>
  api.post<WeightEntry>("/api/weight", { weight_value }).then((r) => r.data);

export const updateWeightEntry = (
  id: string,
  weight_value: number,
): Promise<WeightEntry> =>
  api
    .put<WeightEntry>(`/api/weight/${id}`, { weight_value })
    .then((r) => r.data);

export const deleteWeightEntry = (id: string): Promise<void> =>
  api.delete(`/api/weight/${id}`).then(() => undefined);

export const updateProfile = (data: {
  name?: string;
  email?: string;
}): Promise<User> =>
  api.patch<User>("/api/user/profile", data).then((r) => r.data);

export const updatePassword = (
  current_password: string,
  new_password: string,
): Promise<void> =>
  api
    .patch("/api/user/password", { current_password, new_password })
    .then(() => undefined);

export const updatePreferences = (weight_unit: "lbs" | "kg"): Promise<User> =>
  api.patch<User>("/api/user/preferences", { weight_unit }).then((r) => r.data);

export const deleteAccount = (password: string): Promise<void> =>
  api.delete("/api/user/me", { data: { password } }).then(() => undefined);

export const resetPassword = (
  email: string,
  new_password: string,
): Promise<void> =>
  api
    .post("/api/auth/reset-password", { email, new_password })
    .then(() => undefined);
