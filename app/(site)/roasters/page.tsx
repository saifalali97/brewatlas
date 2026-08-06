import { redirect } from "next/navigation";

/** Legacy roasters listing — the Gulf directory now lives under /recipes. */
export default function RoastersPage() {
  redirect("/recipes");
}
