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

export interface IShowEvent {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  start_date: Date;
  Pay: boolean;
  ticket_types: {
    price: number;
  }[];
  organizer: {
    first_name: string;
    last_name: string;
    avatar?: string | null;
  };
}
