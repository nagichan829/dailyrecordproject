import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // ← GET対策！
  }

  const { uid, projectName } = req.body;

  try {
    const docRef = await addDoc(collection(db, "projects"), {
      uid,
      projectName,
      createdAt: Timestamp.now(),
    });

    res.status(200).json({ id: docRef.id });
  } catch (error) {
    console.error("プロジェクト作成エラー:", error);
    res.status(500).json({ error: "保存失敗" });
  }
}
