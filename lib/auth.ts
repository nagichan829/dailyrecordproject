import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig"; // このファイルも必要！

export const ensureAnonymousAuth = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        try {
          const result = await signInAnonymously(auth);
          resolve(result.user.uid);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

