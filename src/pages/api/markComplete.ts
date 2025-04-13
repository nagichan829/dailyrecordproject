// src/pages/api/markComplete.ts
import { db } from "../../../firebase/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { projectId, date } = req.body;

    const ref = doc(db, "projects", projectId);
    await updateDoc(ref, {
      completions: arrayUnion(date),
    });

    res.status(200).json({ message: "完了記録済み" });
  } catch (err) {
    console.error("完了記録エラー", err);
    res.status(500).json({ error: "完了の記録に失敗しました" });
  }
}
