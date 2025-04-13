import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { Geist, Geist_Mono } from "next/font/google";
import type { CalendarProps } from "react-calendar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ProjectPage() {
  const router = useRouter();
  const { id: projectId } = router.query;

  const [projectName, setProjectName] = useState<string | null>(null);
  const [completions, setCompletions] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [value, setValue] = useState<Date | null>(new Date());

  useEffect(() => {
    if (!projectId || typeof projectId !== "string") return;

    const fetchProject = async () => {
      const ref = doc(db, "projects", projectId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setProjectName(data.projectName || "（名称未設定）");
        setCompletions(data.completions || []);
      } else {
        setStatus("⚠️ プロジェクトが見つかりませんでした");
      }
    };

    fetchProject();
  }, [projectId]);

  const markTodayComplete = async () => {
    if (!projectId || typeof projectId !== "string") return;

    const today = dayjs().format("YYYY-MM-DD");
    const ref = doc(db, "projects", projectId);
    await updateDoc(ref, {
      completions: arrayUnion(today),
    });

    setCompletions((prev) => [...new Set([...prev, today])]);
    setStatus("✅ 完了を記録しました！");
  };

  const copyLinkToClipboard = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("✅ リンクをコピーしました！");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("⚠️ コピーに失敗しました");
    }
  };

 

const handleCalendarChange: CalendarProps["onChange"] = (val) => {
  if (val instanceof Date) {
    setValue(val);
  } else if (Array.isArray(val)) {
    setValue(val[0]);
  } else {
    setValue(null);
  }
};


  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center min-h-screen p-8 sm:p-20`}
    >
      <main className="flex flex-col gap-6 items-center text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold">プロジェクト：{projectName}</h1>

        <button
          onClick={markTodayComplete}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          今日の完了を記録
        </button>

        <button
          onClick={copyLinkToClipboard}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          共有リンクをコピー
        </button>

        {copyStatus && <p className="text-sm">{copyStatus}</p>}

        <h2 className="text-xl font-medium mt-6">📅 カレンダー</h2>
        <div className="w-full">
          <Calendar
            onChange={handleCalendarChange}
            value={value}
            selectRange={false}
            tileClassName={({ date }) => {
              const dateStr = dayjs(date).format("YYYY-MM-DD");
              return completions.includes(dateStr) ? "bg-green-200 font-bold rounded" : "";
            }}
          />
        </div>

        {status && <p className="text-sm mt-4">{status}</p>}
      </main>
    </div>
  );
}

