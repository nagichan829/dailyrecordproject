import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/firebaseConfig";
import { collection, doc, addDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { projectId, date } = req.body;

  if (!projectId || !date) {
    return res.status(400).json({ error: "Missing projectId or date" });
  }

  try {
    const projectRef = doc(db, "projects", projectId);
    const completionRef = collection(projectRef, "completions");

    await addDoc(completionRef, {
      date,           // 例: "2025-04-13"
      status: "done"
    });

    res.status(200).json({ message: "Completion recorded successfully" });
  } catch (error) {
    console.error("🔥 addCompletion API エラー:", error);
    res.status(500).json({ error: "Failed to add completion" });
  }
}
