import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "id";

const dictionary = {
  en: {
    workspace: "Workspace",
    knowledge: "Knowledge",
    production: "Production",
    dashboard: "Dashboard",
    assessment: "Assessment",
    observability: "Observability",
    health: "Health",
    architecture: "Architecture",
    businessLogic: "Business Logic",
    apiDocs: "API Documentation",
    roadmap: "Roadmap",
    about: "About",
    security: "Security",
    dataLayer: "Data Layer",
    project: "Project",
    platformName: "CreditCore Platform",
    portfolioLabel: "Portfolio Platform",
    live: "Live",
    switchRole: "Switch role",
    guest: "Guest",
    footerTagline: "Production-oriented credit decisioning portfolio",
    pageNotFound: "Page not found",
    pageNotFoundDesc: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go home",
    pageLoadError: "This page didn't load",
    pageLoadErrorDesc: "Something went wrong on our end. You can try refreshing or head back home.",
    tryAgain: "Try again",
    language: "Language",
    english: "English",
    indonesian: "Indonesia",
  },
  id: {
    workspace: "Ruang Kerja",
    knowledge: "Pengetahuan",
    production: "Produksi",
    dashboard: "Dasbor",
    assessment: "Asesmen",
    observability: "Observabilitas",
    health: "Kesehatan Sistem",
    architecture: "Arsitektur",
    businessLogic: "Logika Bisnis",
    apiDocs: "Dokumentasi API",
    roadmap: "Peta Jalan",
    about: "Tentang",
    security: "Keamanan",
    dataLayer: "Lapisan Data",
    project: "Proyek",
    platformName: "CreditCore Platform",
    portfolioLabel: "Platform Portofolio",
    live: "Aktif",
    switchRole: "Ganti peran",
    guest: "Tamu",
    footerTagline: "Portofolio platform keputusan kredit berorientasi produksi",
    pageNotFound: "Halaman tidak ditemukan",
    pageNotFoundDesc: "Halaman yang Anda cari tidak tersedia atau telah dipindahkan.",
    goHome: "Ke beranda",
    pageLoadError: "Halaman gagal dimuat",
    pageLoadErrorDesc:
      "Terjadi masalah saat memuat halaman. Coba muat ulang atau kembali ke beranda.",
    tryAgain: "Coba lagi",
    language: "Bahasa",
    english: "English",
    indonesian: "Indonesia",
  },
} as const;

export type TranslationKey = keyof typeof dictionary.en;

const pageTranslations: Record<string, string> = {
  "Credit Decisioning & API Operations": "Keputusan Kredit & Operasional API",
  "Monitor portfolio decisions, scoring quality, REST traffic, reliability, and traceable assessment outcomes from one console.":
    "Pantau keputusan portofolio, kualitas scoring, trafik REST, reliability, dan hasil asesmen yang dapat ditelusuri dari satu konsol.",
  "Total Assessments": "Total Asesmen",
  "All submitted cases": "Semua kasus yang diajukan",
  "Approval Rate": "Tingkat Persetujuan",
  "Manual Review Rate": "Tingkat Tinjauan Manual",
  "Rejected Rate": "Tingkat Penolakan",
  "Average Credit Score": "Rata-rata Skor Kredit",
  "Request Rate": "Laju Request",
  "Error Rate": "Tingkat Error",
  "Assessment Trend": "Tren Asesmen",
  "Risk Grade Distribution": "Distribusi Tingkat Risiko",
  "Decision Distribution": "Distribusi Keputusan",
  "API Reliability": "Reliability API",
  "Success Rate": "Tingkat Keberhasilan",
  "Average Latency": "Rata-rata Latensi",
  "Recent Assessments": "Asesmen Terbaru",
  Borrower: "Debitur",
  Score: "Skor",
  "Risk Grade": "Tingkat Risiko",
  Decision: "Keputusan",
  "New Assessment": "Asesmen Baru",
  "New Credit Assessment": "Asesmen Kredit Baru",
  "Borrower Financial Profile": "Profil Finansial Debitur",
  "Borrower Name": "Nama Debitur",
  "Requested Amount (IDR)": "Jumlah Pengajuan (IDR)",
  "Monthly Income (IDR)": "Pendapatan Bulanan (IDR)",
  "Employment Length (months)": "Masa Kerja (bulan)",
  "Number of Dependents": "Jumlah Tanggungan",
  "Purpose of Loan": "Tujuan Pinjaman",
  "SLIK OJK Status": "Status SLIK OJK",
  "Send empty monthlyIncome": "Kirim monthlyIncome kosong",
  "Submit the form to see the credit decision here.":
    "Kirim formulir untuk melihat keputusan kredit di sini.",
  "Scoring Result": "Hasil Scoring",
  "Enterprise scoring summary from the mock API.":
    "Ringkasan scoring enterprise dari API simulasi.",
  "Single Source of Truth": "Sumber Kebenaran Tunggal",
  "Deterministic Rule-Based Weighted Linear Scoring Model used by the live API.":
    "Model scoring linear berbobot berbasis aturan yang deterministik dan digunakan oleh API aktif.",
  "Variable Normalization & Weights": "Normalisasi Variabel & Bobot",
  "Weighted Scoring Formula": "Formula Scoring Berbobot",
  "Risk Grade & Decision Rules": "Tingkat Risiko & Aturan Keputusan",
  "Hard Gate & Assessment Lifecycle": "Hard Gate & Siklus Hidup Asesmen",
  "Hard Gate:": "Hard Gate:",
  "SLIK Kolektibilitas 3–5 forces score 300, decision REJECTED, reason code RC-OJK-COL3-5.":
    "SLIK Kolektibilitas 3–5 memaksa skor menjadi 300, keputusan REJECTED, dengan reason code RC-OJK-COL3-5.",
  "MANUAL_REVIEW is a non-final state. A Risk Analyst can subsequently transition it to APPROVED or REJECTED through the status endpoint.":
    "MANUAL_REVIEW adalah status non-final. Risk Analyst dapat mengubahnya menjadi APPROVED atau REJECTED melalui endpoint status.",
  "Enterprise Architecture": "Arsitektur Enterprise",
  "Client Layer": "Lapisan Klien",
  Consumers: "Konsumen",
  "CreditCore Web Dashboard (Browser)": "Dasbor Web CreditCore (Browser)",
  Communication: "Komunikasi",
  Protocol: "Protokol",
  "CreditCore Platform Server": "Server CreditCore Platform",
  "Business API": "API Bisnis",
  "Infrastructure API": "API Infrastruktur",
  "Credit Scoring Engine": "Mesin Credit Scoring",
  Service: "Layanan",
  "Variable normalization (0–100)": "Normalisasi variabel (0–100)",
  "Weighted scoring 40/30/20/10": "Scoring berbobot 40/30/20/10",
  "SLIK hard gate + decision policy": "Hard gate SLIK + kebijakan keputusan",
  "Historical mock lookup": "Pencarian data simulasi historis",
  "Regulatory flags": "Penanda regulasi",
  "Observability Logging": "Logging Observabilitas",
  "Structured audit trail": "Jejak audit terstruktur",
  "Request + Correlation ID tracking": "Pelacakan Request + Correlation ID",
  "Latency + status capture": "Pencatatan latensi + status",
  "Mock Assessment Repository": "Repositori Asesmen Simulasi",
  "API Documentation": "Dokumentasi API",
  "Protocol & Required Headers": "Protokol & Header Wajib",
  "Request body": "Body Request",
  "Request Body": "Body Request",
  Response: "Respons",
  "HTTP Status Codes": "Kode Status HTTP",
  "Create a new credit assessment.": "Membuat asesmen kredit baru.",
  "Retrieve the full assessment record.": "Mengambil record asesmen lengkap.",
  "Retrieve the scoring result for an assessment.": "Mengambil hasil scoring untuk suatu asesmen.",
  "Update the processing lifecycle status.": "Memperbarui status siklus pemrosesan.",
  "Health probe.": "Pemeriksaan kesehatan layanan.",
  "Immutable audit trail.": "Jejak audit yang tidak dapat diubah.",
  "Aggregated business metrics.": "Metrik bisnis teragregasi.",
  "Read simulation control state.": "Membaca status kontrol simulasi.",
  "Update status / source overrides.": "Memperbarui override status / sumber.",
  "Error responses keep the CreditCore envelope and include RFC 7807-compatible problem fields:":
    "Respons error mempertahankan envelope CreditCore dan menyertakan field problem yang kompatibel dengan RFC 7807:",
  "System Health": "Kesehatan Sistem",
  "Status code": "Kode status",
  "Service": "Layanan",
  "Latency": "Latensi",
  "Auto-refreshes every 15 seconds.": "Diperbarui otomatis setiap 15 detik.",
  "Probe now": "Periksa sekarang",
  "Round trip from browser": "Waktu pulang-pergi dari browser",
  "Raw response": "Respons mentah",
  "API Logs & Connection": "Log API & Koneksi",
  "Avg Latency": "Rata-rata Latensi",
  "Status Override": "Override Status",
  "Traffic Source": "Sumber Trafik",
  "Target Assessment ID": "ID Asesmen Target",
  "Observability Audit Console": "Konsol Audit Observabilitas",
  "No log entries.": "Belum ada entri log.",
  "Request Headers": "Header Request",
  "Response Headers": "Header Respons",
  "Response Body": "Body Respons",
  "Error Message": "Pesan Error",
  Timestamp: "Waktu",
  Method: "Metode",
  Path: "Path",
  Source: "Sumber",
  Latency: "Latensi",
  "PostgreSQL Integration Plan": "Rencana Integrasi PostgreSQL",
  "In-memory JavaScript store, reset on every server restart.":
    "Penyimpanan JavaScript in-memory, di-reset setiap server restart.",
  "Seeded with 12 sample assessments for demonstration.":
    "Diisi 12 contoh asesmen untuk demonstrasi.",
  Current: "Saat Ini",
  Planned: "Direncanakan",
  "Prisma ORM over PostgreSQL, with the exact same REST response shapes.":
    "Prisma ORM di atas PostgreSQL dengan bentuk respons REST yang tetap sama.",
  "No breaking changes to API contracts or TanStack Start routing.":
    "Tidak ada breaking change pada kontrak API maupun routing TanStack Start.",
  "Migration Approach": "Pendekatan Migrasi",
  "1. Introduce a Prisma schema mirroring the tables above.":
    "1. Tambahkan schema Prisma yang mencerminkan tabel di atas.",
  "2. Swap the in-memory repository functions in": "2. Ganti fungsi repositori in-memory di",
  "for Prisma Client calls, one endpoint at a time.":
    "dengan pemanggilan Prisma Client, satu endpoint setiap tahap.",
  "3. Keep every route handler's request/response contract byte-for-byte identical.":
    "3. Pertahankan kontrak request/response setiap route handler tetap identik.",
  "4. Run the existing Postman collection against both implementations to confirm parity before switching over.":
    "4. Jalankan collection Postman pada kedua implementasi untuk memastikan parity sebelum migrasi penuh.",
  Roadmap: "Peta Jalan",
  Delivered: "Selesai",
  "In progress": "Dalam Proses",
  "Coming Soon": "Segera Hadir",
  Implemented: "Sudah Diimplementasikan",
  "Production Readiness": "Kesiapan Produksi",
  "Security & Production Readiness": "Keamanan & Kesiapan Produksi",
  "JWT Authentication": "Autentikasi JWT",
  "Project Metadata": "Metadata Proyek",
  Purpose: "Tujuan",
  Scope: "Cakupan",
  Stack: "Teknologi",
  "Learning Outcomes": "Hasil Pembelajaran",
  "Portfolio / Academic origin": "Portofolio / Berasal dari proyek akademik",
  "Deterministic mock seed": "Seed simulasi deterministik",
  "Production-oriented credit decisioning portfolio":
    "Portofolio platform keputusan kredit berorientasi produksi",
  "The weighted sub-score is 0–100. Multiplying by 5.5 maps it to 0–550, then the 300-point base produces the 300–850 credit-score range.":
    "Sub-skor berbobot berada pada 0–100. Dikalikan 5,5 menjadi 0–550, lalu basis 300 menghasilkan rentang credit score 300–850.",
  "Primary API version:": "Versi API utama:",
  "routes remain available for backward compatibility.":
    "route tetap tersedia untuk kompatibilitas versi lama.",
  "— optional; generated by server when absent.": "— opsional; dibuat server jika tidak dikirim.",
  "— recommended for POST assessment; duplicate keys replay the original resource for 24 hours.":
    "— direkomendasikan untuk POST assessment; key duplikat mengembalikan resource asli selama 24 jam.",
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (k: TranslationKey) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => {
    const saved = localStorage.getItem("creditcore-language");
    if (saved === "en" || saved === "id") setLanguageState(saved);
  }, []);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem("creditcore-language", next);
    } catch {
      // localStorage unavailable (e.g. private browsing) — language still applies for this session
    }
  };
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = language;
  }, [language]);
  const value = useMemo(
    () => ({ language, setLanguage, t: (key: TranslationKey) => dictionary[language][key] }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const v = useContext(LanguageContext);
  if (!v) throw new Error("useLanguage must be used inside LanguageProvider");
  return v;
}
