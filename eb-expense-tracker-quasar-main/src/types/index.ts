export interface Category {
  id: string;
  name: string;
  icon?: string;
  color: string;
  category_type: 'expense' | 'income' | 'both';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category_id?: string;
  category?: Category;
  date: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  category_id?: string;
  category?: Category;
  date: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  language: 'en' | 'gu';
  theme: 'light' | 'dark';
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
