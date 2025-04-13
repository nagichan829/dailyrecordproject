import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import { ensureAnonymousAuth } from "../../lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    ensureAnonymousAuth().then(setUid).catch(console.error);
  }, []);

  const createProject = async () => {
    console.log("✅ createProject 発火");
    console.log("projectName:", projectName);
    console.log("uid:", uid);
  
    if (!projectName || !uid) {
      console.warn("⚠️ 入力またはログインが不足してます");
      return;
    }
  
    const res = await fetch("/api/createProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, projectName }),
    });
  
    const data = await res.json();
    
    console.log("📦 APIレスポンス:", data); 
  
    if (res.ok && data.id) {
      setStatus("✅ 作成完了！リダイレクト中...");
      router.push(`/project/${data.id}`);
    } else {
      setStatus("⚠️ 作成に失敗しました");
    }
  };
  

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center min-h-screen p-8 sm:p-20`}
    >
      <main className="flex flex-col gap-6 items-center text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold">新しいプロジェクトを作成</h1>

        <input
            type="text"
            id="projectName" // ← ✅ 追加（任意の文字列でOK）
            name="projectName" // ← ✅ 推奨：form連携で便利
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="例：ランニング、英語学習"
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
        />


        <button
          onClick={createProject}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          作成する
        </button>

        {status && <p className="text-sm mt-2">{status}</p>}
      </main>
    </div>
  );
}
