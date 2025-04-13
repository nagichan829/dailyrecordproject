import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { Geist, Geist_Mono } from "next/font/google";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css"; // ← カスタムCSSも忘れず！

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const markComplete = async (target: "today" | "yesterday") => {
    if (!projectId || typeof projectId !== "string") return;

    const date = new Date();
    if (target === "yesterday") {
      date.setDate(date.getDate() - 1);
    }

    const dateStr = date.toISOString().split("T")[0];

    const ref = doc(db, "projects", projectId);
    await updateDoc(ref, {
      completions: arrayUnion(dateStr),
    });

    setCompletions((prev) => [...new Set([...prev, dateStr])]);
    setStatus(`✅ ${target === "today" ? "今日" : "昨日"}の完了を記録しました！`);
  };

  const handleDateChange = (value: any) => {
    if (value instanceof Date || value === null) {
      setSelectedDate(value);
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split("T")[0];
    if (completions.includes(dateStr)) {
      return <div style={{ color: "green", fontSize: "0.8rem" }}>✅</div>;
    }
    return null;
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div
        className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center min-h-screen p-8 sm:p-20`}
      >
        <main className="flex flex-col gap-4 items-center text-center max-w-md w-full">
          <h1 className="text-2xl font-semibold mb-4">プロジェクト：{projectName}</h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => markComplete("today")}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              今日の完了を記録
            </button>
            <button
              onClick={() => markComplete("yesterday")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              昨日の完了を記録
            </button>
          </div>

          <div className="mt-8">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
            />
          </div>

          <h2 className="text-xl font-medium mt-6">完了した日</h2>
          <ul className="text-sm">
            {completions.length === 0 ? (
              <li>まだ記録がありません</li>
            ) : (
              completions.map((date) => <li key={date}>✅ {date}</li>)
            )}
          </ul>

          {status && <p className="text-sm mt-4">{status}</p>}
        </main>
      </div>
    </div>
  );
}
