import { useEffect } from "react";
import { useRouter } from "next/router";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/newproject");
  }, [router]);

  return <p className="text-center mt-20">🔄 リダイレクト中...</p>;
}
