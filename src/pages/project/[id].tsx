import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { Geist, Geist_Mono } from "next/font/google";

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

  // Firestoreからデータを取得
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

  // 今日を完了として登録
  const markTodayComplete = async () => {
    if (!projectId || typeof projectId !== "string") return;

    const today = new Date().toISOString().split("T")[0];

    const ref = doc(db, "projects", projectId);
    await updateDoc(ref, {
      completions: arrayUnion(today),
    });

    setCompletions((prev) => [...new Set([...prev, today])]);
    setStatus("✅ 完了を記録しました！");
  };

  // URLをコピー
  const copyLinkToClipboard = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("✅ リンクをコピーしました！");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (err) {
      setCopyStatus("⚠️ コピーに失敗しました");
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

        {copyStatus && <p className="text-sm mt-1">{copyStatus}</p>}

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
  );
}
