import { useState, useRef, useCallback } from "react";
import { Play, Square, RotateCcw, Settings, ListChecks, AlertTriangle, Info, Download, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Slider } from "./components/ui/slider";
import { Switch } from "./components/ui/switch";
import { BotHeader } from "./components/BotHeader";
import { QuestionManager, Question } from "./components/QuestionManager";
import { BotConsole, LogEntry, LogLevel } from "./components/BotConsole";
import { StatsPanel } from "./components/StatsPanel";
import { EntryIdGuide } from "./components/EntryIdGuide";

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getTimestamp() {
  return new Date().toLocaleTimeString("id-ID", { hour12: false });
}

const randomAnswers: Record<string, string[]> = {
  text: [
    "Saya sangat puas dengan layanan ini",
    "Pengalaman yang menyenangkan",
    "Cukup baik dan memuaskan",
    "Perlu ditingkatkan lagi",
    "Sudah memenuhi ekspektasi saya",
    "Sangat direkomendasikan",
    "Baik sekali",
    "Lumayan bagus",
  ],
  scale: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
};

const batchYears = ["2020", "2021", "2022", "2023", "2024", "2025"];

const currentGoogleFormId = "1FAIpQLSf3U43zfnmfObbuueRBjy_6UER7FUf7fat1XqIGZpBfKZK5ag";
const currentGoogleFormUrl = `https://docs.google.com/forms/d/e/${currentGoogleFormId}/viewform?usp=publish-editor`;
const currentGoogleFormHiddenFields = {
  fvv: "1",
  partialResponse: '[null,null,"5869694835630925380"]',
  pageHistory: "0,1,2,3,4",
  fbzx: "5869694835630925380",
  submissionTimestamp: "-1",
};

type ParsedGoogleForm = {
  title: string;
  questions: Question[];
  hiddenFields: Record<string, string>;
};

const verbalExampleAnswers = [
  "Komentar bernada seksual yang membuat tidak nyaman.",
  "Candaan yang mengarah ke tubuh atau penampilan.",
  "Panggilan tidak pantas saat berada di lingkungan kampus.",
  "Ucapan menggoda yang terasa mengganggu dan tidak sopan.",
];

const safetySuggestionAnswers = [
  "Perlu sosialisasi rutin, kanal pelaporan yang jelas, dan tindak lanjut yang tegas.",
  "Kampus perlu menyediakan mekanisme pelaporan aman serta edukasi etika komunikasi.",
  "Perbanyak edukasi nilai Pancasila, empati, dan batasan dalam interaksi sehari-hari.",
  "Buat aturan tertulis, pendampingan korban, dan pengawasan lingkungan prodi yang lebih baik.",
];

const landingPageSuggestionAnswers = [
  "Bagian hero sebaiknya dibuat lebih jelas dengan ringkasan layanan BUMDESMA Mulia Mandiri dan tombol aksi yang mudah terlihat.",
  "Informasi produk atau layanan perlu ditata lebih rapi agar pengunjung cepat memahami manfaat BUMDESMA Mulia Mandiri.",
  "Kontak, lokasi, dan ajakan untuk menghubungi pengelola sebaiknya dibuat lebih menonjol di landing page.",
  "Tampilan landing page sudah cukup baik, tetapi bagian testimoni, foto kegiatan, dan informasi unit usaha bisa diperjelas.",
  "Navigasi dan struktur konten perlu dibuat lebih sederhana agar pengunjung mudah menemukan informasi tentang BUMDESMA Mulia Mandiri.",
];

const genericSuggestionAnswers = [
  "Informasinya bisa dibuat lebih ringkas, jelas, dan mudah ditemukan oleh pengguna.",
  "Tampilan sudah cukup baik, tetapi bagian utama perlu dibuat lebih menonjol dan mudah dipahami.",
  "Perlu ditambahkan informasi yang lebih lengkap serta tombol aksi yang jelas.",
  "Susunan konten bisa dirapikan agar pengguna lebih cepat memahami tujuan halaman.",
];

type RespondentProfile = {
  name: string;
  gender: "Laki Laki" | "Perempuan";
};

const respondentProfiles: RespondentProfile[] = [
  { name: "Budi Santoso", gender: "Laki Laki" },
  { name: "Andi Pratama", gender: "Laki Laki" },
  { name: "Rizky Maulana", gender: "Laki Laki" },
  { name: "Dimas Saputra", gender: "Laki Laki" },
  { name: "Fajar Nugroho", gender: "Laki Laki" },
  { name: "Agus Setiawan", gender: "Laki Laki" },
  { name: "Bayu Ramadhan", gender: "Laki Laki" },
  { name: "Arief Wibowo", gender: "Laki Laki" },
  { name: "Siti Aisyah", gender: "Perempuan" },
  { name: "Dewi Lestari", gender: "Perempuan" },
  { name: "Rina Wulandari", gender: "Perempuan" },
  { name: "Maya Putri", gender: "Perempuan" },
  { name: "Nadia Safitri", gender: "Perempuan" },
  { name: "Ayu Permatasari", gender: "Perempuan" },
  { name: "Intan Maharani", gender: "Perempuan" },
  { name: "Fitri Handayani", gender: "Perempuan" },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getAnswerOptions(answer: string) {
  return answer.split(",").map((s) => s.trim()).filter(Boolean);
}

function normalizeAnswerOption(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isNameQuestion(q: Question) {
  return q.label.trim().toLowerCase().includes("nama");
}

function isGenderQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return label.includes("jenis kelamin") || label.includes("gender");
}

function isBatchYearQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return label.includes("tahun angkatan") || label.includes("angkatan");
}

function isAgeQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return label.includes("usia") || label.includes("umur");
}

function isVerbalExampleQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return label.includes("contoh") && label.includes("pelecehan verbal");
}

function isSafetySuggestionQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return (
    (label.includes("saran") || label.includes("keamanan") || label.includes("kenyamanan")) &&
    (label.includes("kampus") || label.includes("prodi") || label.includes("pancasila"))
  );
}

function isLandingPageSuggestionQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return (
    label.includes("landing page") ||
    label.includes("bumdesma") ||
    label.includes("mulia mandiri")
  );
}

function isGenericSuggestionQuestion(q: Question) {
  const label = q.label.trim().toLowerCase();
  return label.includes("saran") || label.includes("perbaiki") || label.includes("diperbaiki");
}

function cleanFormText(value: unknown) {
  const raw = String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ");
  const textarea = document.createElement("textarea");
  textarea.innerHTML = raw;
  return textarea.value.replace(/\s+/g, " ").trim();
}

function getFormType(typeCode: number): Question["type"] {
  if (typeCode === 2) return "radio";
  if (typeCode === 3) return "dropdown";
  if (typeCode === 4) return "checkbox";
  if (typeCode === 5) return "scale";
  if (typeCode === 9) return "date";
  return "text";
}

function extractGoogleFormId(url: string) {
  const match = url.match(/\/forms\/d\/e\/([^/]+)/);
  return match?.[1] ?? "";
}

function getGoogleFormsImportUrl(url: string) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname !== "docs.google.com") {
    throw new Error("Link harus berasal dari docs.google.com/forms.");
  }

  if (import.meta.env.DEV) {
    return `/google-forms${parsedUrl.pathname}${parsedUrl.search}`;
  }

  return `/api/import-form?url=${encodeURIComponent(parsedUrl.toString())}`;
}

function extractPublicLoadData(html: string) {
  const marker = "var FB_PUBLIC_LOAD_DATA_ = ";
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("Data Google Form tidak ditemukan.");

  const dataStart = start + marker.length;
  const scriptEnd = html.indexOf(";</script>", dataStart);
  if (scriptEnd === -1) throw new Error("Data Google Form tidak lengkap.");

  return JSON.parse(html.slice(dataStart, scriptEnd));
}

function extractHiddenFields(html: string, pageHistory: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const hiddenFields: Record<string, string> = {};

  doc.querySelectorAll<HTMLInputElement>('input[type="hidden"][name]').forEach((input) => {
    hiddenFields[input.name] = input.value;
  });

  hiddenFields.fvv = hiddenFields.fvv || "1";
  hiddenFields.pageHistory = pageHistory;
  hiddenFields.submissionTimestamp = "-1";

  if (!hiddenFields.partialResponse && hiddenFields.fbzx) {
    hiddenFields.partialResponse = `[null,null,"${hiddenFields.fbzx}"]`;
  }

  return hiddenFields;
}

function extractFormTitle(html: string, dataTitle: unknown) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (
    cleanFormText(dataTitle) ||
    cleanFormText(doc.querySelector('meta[itemprop="name"]')?.getAttribute("content")) ||
    cleanFormText(doc.querySelector("title")?.textContent) ||
    "Google Form"
  );
}

function parseGoogleFormHtml(html: string): ParsedGoogleForm {
  const data = extractPublicLoadData(html);
  const formData = data?.[1];
  const rawItems = formData?.[1];
  if (!Array.isArray(rawItems)) throw new Error("Daftar pertanyaan tidak ditemukan.");

  const title = extractFormTitle(html, formData?.[8]);
  const pageCount = Math.max(1, 1 + rawItems.filter((item: any[]) => Array.isArray(item) && item[3] === 8).length);
  const pageHistory = Array.from({ length: pageCount }, (_, index) => String(index)).join(",");
  const hiddenFields = extractHiddenFields(html, pageHistory);

  const questions = rawItems.flatMap((item: any[], index: number): Question[] => {
    if (!Array.isArray(item)) return [];

    const label = cleanFormText(item[1]);
    const typeCode = Number(item[3]);
    const entryConfig = Array.isArray(item[4]) ? item[4][0] : null;
    const entryId = entryConfig?.[0];
    if (!label || !entryId) return [];

    const options = Array.isArray(entryConfig?.[1])
      ? entryConfig[1].map((option: any[]) => cleanFormText(option?.[0])).filter(Boolean)
      : [];

    return [{
      id: `q${index + 1}`,
      label,
      type: getFormType(typeCode),
      answer: options.join(", "),
      required: Boolean(entryConfig?.[2]),
      useRandom: true,
      entryId: `entry.${entryId}`,
    }];
  });

  if (questions.length === 0) throw new Error("Tidak ada field isian yang bisa diimpor.");

  return { title, questions, hiddenFields };
}

const defaultQuestions: Question[] = [
  {
    id: "q1",
    label: "Nama",
    type: "text",
    answer: "Budi Santoso",
    required: true,
    useRandom: true,
    entryId: "entry.1952502122",
  },
  {
    id: "q2",
    label: "Jenis Kelamin",
    type: "radio",
    answer: "laki laki, perempuan",
    required: true,
    useRandom: true,
    entryId: "entry.2086452929",
  },
  {
    id: "q3",
    label: "tahun Angkatan",
    type: "text",
    answer: "2023",
    required: true,
    useRandom: true,
    entryId: "entry.2146074180",
  },
  {
    id: "q4",
    label: "Apakah Anda pernah mengalami kekerasan seksual secara verbal di lingkungan Program Studi Sistem Informasi UNP?",
    type: "radio",
    answer: "Ya, Tidak",
    required: true,
    useRandom: true,
    entryId: "entry.1961003650",
  },
  {
    id: "q5",
    label: "Jika Ya, seberapa sering Anda mengalami kekerasan seksual secara verbal di lingkungan prodi?",
    type: "radio",
    answer: "Sering, Kadang-kadang, Jarang, Hanya sekali",
    required: true,
    useRandom: true,
    entryId: "entry.1159536533",
  },
  {
    id: "q6",
    label: "Siapa yang melakukan kekerasan seksual secara verbal tersebut?",
    type: "checkbox",
    answer: "Dosen, Mahasiswa, Staf administrasi",
    required: true,
    useRandom: true,
    entryId: "entry.1929097319",
  },
  {
    id: "q7",
    label: "Di mana biasanya kekerasan seksual secara verbal terjadi?",
    type: "checkbox",
    answer: "ruang kelas, kantin, perpustakaan, parkiran",
    required: true,
    useRandom: true,
    entryId: "entry.1691613786",
  },
  {
    id: "q8",
    label: "Apa jenis kekerasan seksual secara verbal yang Anda alami?",
    type: "checkbox",
    answer: "komentar seksual, candaan seksual, panggilan nama tidak pantas, siulan/cat calling",
    required: true,
    useRandom: true,
    entryId: "entry.1642883716",
  },
  {
    id: "q9",
    label: "bagaimana contoh dari pelecehan verbal tersebut?",
    type: "text",
    answer: "",
    required: false,
    useRandom: true,
    entryId: "entry.1795111635",
  },
  {
    id: "q10",
    label: "seberapa besar pengaruh kesadaran diri dalam penerapan nilai pancasila",
    type: "radio",
    answer: "Sangat Mempengaruhi, Mempengaruhi, Tidak Begitu Mempengaruhi, Tidak Mempengaruhi Sama Sekali",
    required: true,
    useRandom: true,
    entryId: "entry.32891441",
  },
  {
    id: "q11",
    label: "Apakah kejadian kekerasan seksual secara verbal membuat Anda merasa nilai-nilai Pancasila kurang diterapkan di lingkungan prodi?",
    type: "radio",
    answer: "Ya, Tidak",
    required: true,
    useRandom: true,
    entryId: "entry.1608077550",
  },
  {
    id: "q12",
    label: "Seberapa penting Anda merasa pembahasan tentang kekerasan seksual secara verbal perlu dimasukkan lebih mendalam dalam pengajaran nilai-nilai Pancasila?",
    type: "radio",
    answer: "Sangat Penting, Penting, Tidak Begitu Penting, Tidak Penting Sama Sekali",
    required: true,
    useRandom: true,
    entryId: "entry.1261122006",
  },
  {
    id: "q13",
    label: "Apakah menurut Anda pendidikan moral dan etika berdasarkan nilai-nilai Pancasila dapat membantu mengurangi kekerasan seksual secara verbal di lingkungan kampus?",
    type: "radio",
    answer: "Ya, Tidak",
    required: true,
    useRandom: true,
    entryId: "entry.1399930751",
  },
  {
    id: "q14",
    label: "Berikan saran Anda untuk meningkatkan keamanan dan kenyamanan di lingkungan prodi sistem informasi UNP",
    type: "text",
    answer: "",
    required: false,
    useRandom: true,
    entryId: "entry.622552329",
  },
];

export default function App() {
  const [formUrl, setFormUrl] = useState("");
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [configuredFormUrl, setConfiguredFormUrl] = useState("");
  const [formTitle, setFormTitle] = useState("Belum ada form");
  const [formHiddenFields, setFormHiddenFields] = useState<Record<string, string>>(currentGoogleFormHiddenFields);
  const [formHtml, setFormHtml] = useState("");
  const [isImportingForm, setIsImportingForm] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(5);
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [useRandomDelay, setUseRandomDelay] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0 });
  const [activeTab, setActiveTab] = useState("questions");

  const stopRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = useCallback((message: string, level: LogLevel = "info") => {
    setLogs((prev) => [
      ...prev,
      { id: generateId(), timestamp: getTimestamp(), level, message },
    ]);
  }, []);

  const applyImportedForm = (parsedForm: ParsedGoogleForm, sourceUrl: string) => {
    setQuestions(parsedForm.questions);
    setFormHiddenFields(parsedForm.hiddenFields);
    setConfiguredFormUrl(sourceUrl);
    setFormTitle(parsedForm.title);
    setActiveTab("questions");
  };

  const importFormFromLink = async (showSuccessLog = true): Promise<ParsedGoogleForm | null> => {
    const sourceUrl = formUrl.trim();
    if (!sourceUrl) {
      addLog("URL form tidak boleh kosong.", "error");
      return null;
    }

    setIsImportingForm(true);
    try {
      const response = await fetch(getGoogleFormsImportUrl(sourceUrl));
      if (!response.ok) throw new Error(`Gagal membaca form (${response.status})`);

      const html = await response.text();
      const parsedForm = parseGoogleFormHtml(html);
      applyImportedForm(parsedForm, sourceUrl);
      if (showSuccessLog) {
        addLog(`Form "${parsedForm.title}" berhasil diimpor: ${parsedForm.questions.length} field.`, "success");
      }
      return parsedForm;
    } catch (err: any) {
      addLog(`Impor dari link gagal: ${err?.message ?? "Unknown error"}`, "error");
      addLog("Endpoint import form belum tersedia. Coba deploy ulang, atau tempel HTML/source form lalu klik Impor dari HTML.", "warning");
      return null;
    } finally {
      setIsImportingForm(false);
    }
  };

  const importFormFromHtml = () => {
    if (!formHtml.trim()) {
      addLog("HTML/source form belum ditempel.", "error");
      return;
    }

    try {
      const parsedForm = parseGoogleFormHtml(formHtml);
      applyImportedForm(parsedForm, formUrl.trim());
      addLog(`Form "${parsedForm.title}" berhasil diimpor dari HTML: ${parsedForm.questions.length} field.`, "success");
    } catch (err: any) {
      addLog(`Impor dari HTML gagal: ${err?.message ?? "Unknown error"}`, "error");
    }
  };

  const getAnswer = (q: Question, profile: RespondentProfile): string => {
    if (q.useRandom) {
      if (isNameQuestion(q)) {
        return profile.name;
      }
      if (isGenderQuestion(q)) {
        const opts = getAnswerOptions(q.answer);
        return opts.find((opt) => normalizeAnswerOption(opt) === normalizeAnswerOption(profile.gender)) ?? profile.gender;
      }
      if (isBatchYearQuestion(q)) {
        return pickRandom(batchYears);
      }
      if (isAgeQuestion(q)) {
        return String(Math.floor(Math.random() * 8) + 18);
      }
      if (isVerbalExampleQuestion(q)) {
        return pickRandom(verbalExampleAnswers);
      }
      if (isLandingPageSuggestionQuestion(q)) {
        return pickRandom(landingPageSuggestionAnswers);
      }
      if (isSafetySuggestionQuestion(q)) {
        return pickRandom(safetySuggestionAnswers);
      }
      if (isGenericSuggestionQuestion(q)) {
        return pickRandom(genericSuggestionAnswers);
      }
      if (q.type === "radio" || q.type === "dropdown" || q.type === "checkbox" || q.type === "scale") {
        const opts = getAnswerOptions(q.answer);
        if (opts.length > 0) return pickRandom(opts);
      }
      if (q.type === "scale") {
        return pickRandom(randomAnswers.scale);
      }
      return pickRandom(randomAnswers.text);
    }
    return q.answer;
  };

  // Convert any Google Form URL to the formResponse endpoint
  const getSubmitUrl = (url: string): string => {
    const cleanUrl = url.split("?")[0].replace(/\/$/, "");
    if (cleanUrl.endsWith("/formResponse")) return cleanUrl;
    if (cleanUrl.endsWith("/viewform")) return cleanUrl.replace(/\/viewform$/, "/formResponse");
    return `${cleanUrl}/formResponse`;
  };

  const getQuestionsForForm = (url: string, currentQuestions: Question[]) => {
    if (!url.includes(currentGoogleFormId)) return currentQuestions;

    const hasStaleEntryIds = currentQuestions.some((q) => q.entryId === "entry.883194403");
    const hasNewNameEntryId = currentQuestions.some((q) => q.entryId === "entry.1952502122");
    const hasOldShopeeQuestions = currentQuestions.some((q) => q.label.toLowerCase().includes("shopee"));

    if (hasStaleEntryIds || hasOldShopeeQuestions || !hasNewNameEntryId) {
      return defaultQuestions;
    }

    return currentQuestions;
  };

  // Actually submit to Google Forms using no-cors (bypasses CORS restriction)
  const submitToGoogleForms = async (
    submitUrl: string,
    data: Record<string, string>,
    hiddenFields: Record<string, string>,
  ): Promise<void> => {
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      body.append(key, value);
    }
    for (const [key, value] of Object.entries(hiddenFields)) {
      body.set(key, value);
    }
    // no-cors: request goes through, we just can't read the response
    await fetch(submitUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  };

  const startBot = async () => {
    if (!formUrl.trim()) {
      addLog("URL form tidak boleh kosong!", "error");
      return;
    }

    let activeQuestions = questions;
    let activeHiddenFields = formHiddenFields;

    if (formUrl.trim() !== configuredFormUrl) {
      const parsedForm = await importFormFromLink(false);
      if (!parsedForm) return;
      activeQuestions = parsedForm.questions;
      activeHiddenFields = parsedForm.hiddenFields;
      addLog(`Konfigurasi otomatis disesuaikan dari link: ${parsedForm.questions.length} field.`, "system");
    } else {
      const syncedQuestions = getQuestionsForForm(formUrl.trim(), questions);
      if (syncedQuestions !== questions) {
        setQuestions(syncedQuestions);
        activeQuestions = syncedQuestions;
        addLog("Konfigurasi pertanyaan disinkronkan ke Entry ID form terbaru.", "system");
      }
    }

    if (activeQuestions.length === 0) {
      addLog("Tambahkan minimal satu pertanyaan!", "error");
      return;
    }

    const missingEntryIds = activeQuestions.filter((q) => !q.entryId.trim());
    if (missingEntryIds.length > 0) {
      setActiveTab("questions");
      addLog(
        `Pengiriman otomatis dibatalkan: lengkapi Entry ID untuk ${missingEntryIds.length} pertanyaan.`,
        "error",
      );
      addLog(`Entry ID kosong: ${missingEntryIds.map((q) => q.label).join(", ")}`, "warning");
      return;
    }

    stopRef.current = false;
    setIsRunning(true);
    setCurrentSubmission(0);
    setStats({ total: 0, success: 0, error: 0 });
    setLogs([]);
    setActiveTab("console");

    const submitUrl = getSubmitUrl(formUrl.trim());

    addLog("=".repeat(40), "system");
    addLog("FormBot Auto-Filler v2.0 dimulai", "system");
    addLog(`Target URL: ${submitUrl}`, "system");
    addLog("Mode: PENGIRIMAN OTOMATIS NYATA ke Google Forms", "success");
    addLog(`Jumlah pengiriman: ${submissionCount}`, "system");
    addLog(`Delay: ${useRandomDelay ? "Acak (1-5 detik)" : `${delaySeconds} detik`}`, "system");
    addLog(`Pertanyaan dengan Entry ID: ${activeQuestions.length - missingEntryIds.length}/${activeQuestions.length}`, "system");
    if (activeHiddenFields.pageHistory) {
      addLog(`Metadata halaman: pageHistory=${activeHiddenFields.pageHistory}`, "system");
    }
    addLog("=".repeat(40), "system");

    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i <= submissionCount; i++) {
      if (stopRef.current) {
        addLog("Bot dihentikan oleh pengguna.", "warning");
        break;
      }

      addLog(`--- Pengiriman #${i} dimulai ---`, "info");
      const profile = pickRandom(respondentProfiles);
      addLog(`Profil responden: ${profile.name} (${profile.gender})`, "info");

      // Build form data
      const formData: Record<string, string> = {};

      for (const q of activeQuestions) {
        if (stopRef.current) break;
        const answer = getAnswer(q, profile);

        if (q.entryId.trim()) {
          const key = q.entryId.trim().startsWith("entry.") ? q.entryId.trim() : `entry.${q.entryId.trim()}`;
          formData[key] = answer;
          addLog(`Mengisi "${q.label}" [${key}] -> "${answer}"`, "info");
        } else {
          addLog(`Lewati "${q.label}" (Entry ID kosong)`, "warning");
        }
        await new Promise((r) => setTimeout(r, 60 + Math.random() * 100));
      }

      if (stopRef.current) break;

      addLog(`Mengirimkan form #${i} ke Google...`, "info");

      try {
        await submitToGoogleForms(submitUrl, formData, activeHiddenFields);
        successCount++;
        setStats((prev) => ({ ...prev, total: prev.total + 1, success: prev.success + 1 }));
        addLog(`Form #${i} terkirim ke Google Forms (no-cors mode)`, "success");
      } catch (err: any) {
        errorCount++;
        setStats((prev) => ({ ...prev, total: prev.total + 1, error: prev.error + 1 }));
        addLog(`Form #${i} error: ${err?.message ?? "Unknown error"}`, "error");
      }

      setCurrentSubmission(i);

      if (i < submissionCount && !stopRef.current) {
        const delay = useRandomDelay
          ? Math.floor(Math.random() * 4 + 1)
          : delaySeconds;
        addLog(`Menunggu ${delay} detik...`, "system");
        await new Promise((r) => {
          timeoutRef.current = setTimeout(r, delay * 1000);
        });
      }
    }

    if (!stopRef.current) {
      addLog("=".repeat(40), "system");
      addLog(`Selesai! Berhasil: ${successCount} | Gagal: ${errorCount}`, "success");
      addLog("=".repeat(40), "system");
    }

    setIsRunning(false);
  };

  const stopBot = () => {
    stopRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    addLog("Menghentikan bot...", "warning");
  };

  const resetBot = () => {
    stopRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false);
    setLogs([]);
    setCurrentSubmission(0);
    setStats({ total: 0, success: 0, error: 0 });
    setFormUrl("");
    setConfiguredFormUrl("");
    setFormTitle("Belum ada form");
    setFormHiddenFields(currentGoogleFormHiddenFields);
    setFormHtml("");
    setQuestions(defaultQuestions);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BotHeader isRunning={isRunning} totalSubmitted={stats.total} />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Disclaimer */}
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p>
            <strong>Penting:</strong> Pengiriman otomatis aktif melalui endpoint Google Forms. Gunakan hanya untuk form yang Anda miliki atau punya izin untuk dikelola, dan pastikan penggunaan sesuai dengan kebijakan layanan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="flex flex-col gap-4">
            {/* Form URL */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Info className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-base">Konfigurasi Form</h2>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">URL Google Form</Label>
                <Input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform"
                  disabled={isRunning}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bot akan otomatis mengubah URL ke endpoint <code className="bg-muted px-1 rounded">/formResponse</code>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    onClick={() => void importFormFromLink()}
                    disabled={isRunning || isImportingForm}
                    variant="outline"
                    className="gap-2"
                  >
                    {isImportingForm ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Impor dari Link
                  </Button>
                  <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    Form aktif: <span className="text-foreground">{formTitle}</span> ({questions.length} field)
                  </div>
                </div>
                <details className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">Fallback impor dari HTML/source</summary>
                  <div className="mt-2 flex flex-col gap-2">
                    <Textarea
                      value={formHtml}
                      onChange={(event) => setFormHtml(event.target.value)}
                      placeholder="Tempel source HTML Google Form di sini jika impor dari link gagal"
                      disabled={isRunning}
                      className="min-h-24 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      onClick={importFormFromHtml}
                      disabled={isRunning}
                      variant="outline"
                      className="self-start"
                    >
                      Impor dari HTML
                    </Button>
                  </div>
                </details>
              </div>
              <EntryIdGuide />
            </div>

            {/* Tabs: Questions & Settings */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="w-full">
                <TabsTrigger value="questions" className="flex-1 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5" />
                  Pertanyaan ({questions.length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Pengaturan
                </TabsTrigger>
                <TabsTrigger value="console" className="flex-1 lg:hidden">
                  Konsol
                </TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="mt-3">
                <QuestionManager
                  questions={questions}
                  onChange={setQuestions}
                  disabled={isRunning}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-3">
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-5">
                  {/* Submission Count */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Jumlah Pengiriman</Label>
                      <span className="text-lg text-primary">{submissionCount}</span>
                    </div>
                    <Slider
                      value={[submissionCount]}
                      onValueChange={([v]) => setSubmissionCount(v)}
                      min={1}
                      max={100}
                      step={1}
                      disabled={isRunning}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Delay */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label className="text-sm">Delay Acak</Label>
                        <p className="text-xs text-muted-foreground">Jeda waktu antara pengiriman (1-5 detik)</p>
                      </div>
                      <Switch
                        checked={useRandomDelay}
                        onCheckedChange={setUseRandomDelay}
                        disabled={isRunning}
                      />
                    </div>
                    {!useRandomDelay && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm text-muted-foreground">Delay Tetap (detik)</Label>
                          <span className="text-base text-primary">{delaySeconds}s</span>
                        </div>
                        <Slider
                          value={[delaySeconds]}
                          onValueChange={([v]) => setDelaySeconds(v)}
                          min={1}
                          max={30}
                          step={1}
                          disabled={isRunning}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1s</span>
                          <span>30s</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                    <p className="mb-1">Estimasi waktu total:</p>
                    <p className="text-foreground">
                      ~{useRandomDelay
                        ? `${submissionCount * 1} - ${submissionCount * 5}`
                        : submissionCount * delaySeconds} detik
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="console" className="mt-3 lg:hidden">
                <div className="h-96 rounded-xl overflow-hidden border border-border">
                  <BotConsole
                    logs={logs}
                    isRunning={isRunning}
                    currentSubmission={currentSubmission}
                    totalSubmissions={isRunning || stats.total > 0 ? submissionCount : 0}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isRunning ? (
                <Button onClick={startBot} className="flex-1 h-11 gap-2">
                  <Play className="w-4 h-4" />
                  Mulai Bot
                </Button>
              ) : (
                <Button onClick={stopBot} variant="destructive" className="flex-1 h-11 gap-2">
                  <Square className="w-4 h-4" />
                  Hentikan Bot
                </Button>
              )}
              <Button
                onClick={resetBot}
                variant="outline"
                className="h-11 px-4"
                disabled={isRunning && !stopRef.current}
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <StatsPanel
              totalSubmitted={stats.total}
              successCount={stats.success}
              errorCount={stats.error}
              avgTime={delaySeconds}
            />
          </div>

          {/* Right Panel - Console (desktop) */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="flex-1 rounded-xl overflow-hidden border border-border" style={{ minHeight: 500 }}>
              <BotConsole
                logs={logs}
                isRunning={isRunning}
                currentSubmission={currentSubmission}
                totalSubmissions={isRunning || stats.total > 0 ? submissionCount : 0}
              />
            </div>

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                Cara Penggunaan
              </h3>
              <ol className="text-sm text-muted-foreground flex flex-col gap-1.5 list-decimal list-inside">
                <li>Masukkan URL Google Form</li>
                <li>Klik <strong>Impor dari Link</strong> untuk menyesuaikan field otomatis</li>
                <li>Periksa jawaban acak atau isi jawaban manual bila perlu</li>
                <li>Atur jumlah pengiriman & delay di tab Pengaturan</li>
                <li>Klik <strong>Mulai Bot</strong> - form akan terkirim otomatis.</li>
              </ol>
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800">
                <strong>Teknik:</strong> Menggunakan <code className="bg-green-100 px-1 rounded">fetch</code> dengan <code className="bg-green-100 px-1 rounded">mode: no-cors</code> - request dikirim ke Google meski response tidak bisa dibaca.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
