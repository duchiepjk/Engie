import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database, Shield, FileCode, Server } from 'lucide-react';

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportGuideModal: React.FC<ExportGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSnippet = `# .env.local (Next.js 14 / NextAuth / Prisma PostgreSQL)
GOOGLE_CLIENT_ID="1234567890-xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your_google_secret_here"

DATABASE_URL="postgresql://postgres:password@localhost:5432/english_db?schema=public"

NEXTAUTH_SECRET="super-secret-nextauth-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"`;

  const prismaSnippet = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum Category {
  VOCABULARY
  GRAMMAR
  LISTENING
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  level         String    @default("B1")
  xp            Int       @default(0)
  streak        Int       @default(1)
  accounts      Account[]
  sessions      Session[]
  progress      Progress[]
}

model Lesson {
  id              String     @id @default(cuid())
  title           String
  category        Category
  level           String
  description     String
  durationMinutes Int        @default(15)
  imageUrl        String?
  contentJson     String     // Stores vocabulary / grammar / listening scripts
  quizJson        String     // Stores quiz questions
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  progress        Progress[]
}

model Progress {
  id         String   @id @default(cuid())
  userId     String
  lessonId   String
  score      Int
  total      Int
  completedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson     Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}`;

  const nextAuthSnippet = `// app/api/auth/[...nextauth]/route.ts (Next.js 14 App Router)
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role || "USER";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };`;

  const commandsSnippet = `# 1. Cài đặt các thư viện cần thiết
npm install next-auth @next-auth/prisma-adapter @prisma/client @google/genai lucide-react motion
npm install -D prisma tsx typescript @types/node

# 2. Khởi tạo & Đẩy Schema Prisma lên PostgreSQL
npx prisma db push
npx prisma generate

# 3. Chạy môi trường phát triển Next.js 14 củ cục bộ
npm run dev`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
        id="export-guide-modal"
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Hướng dẫn triển khai Next.js 14 + Prisma + NextAuth</h3>
              <p className="text-xs text-slate-300">Cấu hình biến môi trường và chạy dự án full-stack cục bộ hoặc Vercel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Step 1: Environment Variables */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                1. Cấu hình biến môi trường (.env.local)
              </h4>
              <button
                onClick={() => handleCopy(envSnippet, 'env')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'env' ? 'Đã sao chép' : 'Sao chép .env'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto">
              {envSnippet}
            </pre>
          </div>

          {/* Step 2: Prisma PostgreSQL Schema */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                2. Schema cơ sở dữ liệu PostgreSQL (prisma/schema.prisma)
              </h4>
              <button
                onClick={() => handleCopy(prismaSnippet, 'prisma')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-md"
              >
                {copiedSection === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'prisma' ? 'Đã sao chép' : 'Sao chép Prisma'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-48 overflow-y-auto">
              {prismaSnippet}
            </pre>
          </div>

          {/* Step 3: NextAuth Route Handler */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                3. Route Handler Google OAuth NextAuth.js
              </h4>
              <button
                onClick={() => handleCopy(nextAuthSnippet, 'auth')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-md"
              >
                {copiedSection === 'auth' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'auth' ? 'Đã sao chép' : 'Sao chép Route'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-48 overflow-y-auto">
              {nextAuthSnippet}
            </pre>
          </div>

          {/* Step 4: Run locally & Deploy Vercel */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                4. Lệnh chạy ứng dụng cục bộ & triển khai Vercel
              </h4>
              <button
                onClick={() => handleCopy(commandsSnippet, 'cmd')}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 flex items-center gap-1 font-medium bg-purple-50 dark:bg-purple-950/80 px-2.5 py-1 rounded-md"
              >
                {copiedSection === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'cmd' ? 'Đã sao chép' : 'Sao chép lệnh'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto">
              {commandsSnippet}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Đóng hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
