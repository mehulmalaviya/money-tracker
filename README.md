# Expense Tracker - Multi-Platform Application

A modern, multi-platform expense tracking application built with Vue.js, Quasar Framework, and Supabase.

## Features

- **Multi-Platform**: Web (SPA/PWA), Mobile (Android/iOS), Desktop (Electron)
- **Authentication**: Secure login with Supabase
- **Expense Management**: Create, read, update, delete expenses
- **Category Management**: Organize expenses by categories
- **Reports**: Generate and export PDF reports
- **Multilingual**: Support for English and Gujarati
- **Modern UI**: Clean, shadcn/ui-inspired design
- **Real-time Validation**: Form validation with Zod

## Tech Stack

- **Frontend**: Vue 3, Quasar Framework, TypeScript
- **Backend**: Supabase (Auth + Database)
- **State Management**: Pinia
- **Validation**: Zod
- **Internationalization**: Vue I18n
- **PDF Generation**: jsPDF
- **Build Tool**: Quasar CLI

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Build for Different Platforms

- **Web (SPA)**: `npm run build`
- **PWA**: `npm run build:pwa`
- **Mobile**: `npm run build:mobile`
- **Desktop**: `npm run build:desktop`

## Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only see their own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── forms/          # Form components
├── pages/              # Application pages
├── layouts/            # Layout components
├── stores/             # Pinia stores
├── schemas/            # Zod validation schemas
├── i18n/               # Internationalization files
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
