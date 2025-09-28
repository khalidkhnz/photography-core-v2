import { redirect } from "next/navigation";
import { auth } from "@/server/auth/server";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/signin");
  }
}
