import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color'),
  category_type: z.enum(['expense', 'income', 'both']).default('expense'),
});

export const expenseSchema = z.object({
  title: z.string().min(1, 'Expense title is required').max(200, 'Title too long'),
  amount: z.number().positive('Amount must be positive'),
  category_id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const incomeSchema = z.object({
  title: z.string().min(1, 'Income title is required').max(200, 'Title too long'),
  amount: z.number().positive('Amount must be positive'),
  category_id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),
  description: z.string().max(500, 'Description too long').optional(),
});

export const reportSchema = z
  .object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid from date'),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid to date'),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: 'From date must be before or equal to to date',
    path: ['toDate'],
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
export type ExpenseForm = z.infer<typeof expenseSchema>;
export type IncomeForm = z.infer<typeof incomeSchema>;
export type ReportForm = z.infer<typeof reportSchema>;
