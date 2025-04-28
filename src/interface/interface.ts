export interface AuthRequestBody {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ORGANIZER";
  referral_code?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}
