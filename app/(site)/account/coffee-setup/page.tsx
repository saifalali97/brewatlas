import { redirect } from "next/navigation";

/** Legacy route — forwards to the full My Coffee Setup experience. */
export default function CoffeeSetupRedirectPage() {
  redirect("/account/setup");
}
