import type { Metadata } from "next";
import { Gauge, MessageSquareText, Sparkles } from "lucide-react";
import { AiCoachDemo } from "@/app/components/coach/ai-coach-demo";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";

export const metadata: Metadata = {
  title: "AI Coach",
  description:
    "Get an instant Brew Score for any recipe. BrewAtlas AI Coach analyzes ratio, grind, temperature, and technique across 15 metrics and tells you exactly what to adjust.",
  alternates: {
    canonical: "/coach",
  },
};

export default function CoachPage() {
  return (
    <SectionFrame id="ai-coach" ariaLabelledBy="ai-coach-heading" padding="compact">
      <PageHeader
        eyebrow="AI-Powered Coaching"
        title="AI Coach"
        description="Every recipe on BrewAtlas can be analyzed across 15 brewing and sensory metrics — ratio, extraction, grind, temperature, and more — for an instant Brew Score and specific, actionable coaching."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <MetaTile icon={Gauge} label="Brew Score" value="0-100 composite rating" />
        <MetaTile icon={Sparkles} label="15 Metrics" value="Process + sensory analysis" />
        <MetaTile icon={MessageSquareText} label="Coaching Tips" value="Specific, actionable feedback" />
      </div>

      <p className="mb-8 text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
        Try it on a sample recipe
      </p>
      <AiCoachDemo />
    </SectionFrame>
  );
}
