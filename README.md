# 🍟 Cravexo: AI-Powered Food Discovery

Cravexo is a modern web application designed to eliminate "ordering indecision." Through a conversational AI interface, users interact with **Mr. Fry**, an intelligent food guide that recommends perfect meals based on real-time cravings, mood, budget, and location.

## 🚀 Core Features

- **🤖 Mr. Fry Conversational Agent**: An advanced AI persona powered by **Gemini 2.0 Flash** that understands natural language cravings.
- **🗺️ Intelligent Location Matching**: A multi-tiered matching engine that links recommendations to real-world restaurants in your specific city and area.
- **🛒 Omni-Platform Delivery Engine**: Direct integration with major delivery platforms including:
  - Zomato 🍕
  - Swiggy 🛵
  - Uber Eats 🍱
  - DoorDash 🚗
  - Grubhub 🍔
  - Direct Restaurant Websites 🔗
- **🧠 Personalized Memory**: The AI remembers your past preferences and locations to provide a tailored greeting and smarter suggestions.
- **✨ Interactive Discovery**: Visual tools for selecting vibes, cuisines, spice levels (1-10), and budget ranges.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **AI Orchestration**: Google Gemini 2.0 Flash
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Styling**: Vanilla CSS / Tailwind (Responsive Design)

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/shivambavdankar/Cravexo.git
cd Cravexo
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [www.cravexo.com](https://www.cravexo.com) to start discovering food!

## 📄 License
Internal / Private Project (C) 2026 Cravexo Team.
