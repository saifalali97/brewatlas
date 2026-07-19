import { GulfHeritageContentSection } from "@/app/components/gulf-heritage/gulf-heritage-content-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";

type GulfHeritageSlotSectionProps = {
  title: string;
  body: string | null;
  pendingMessage: string;
};

/** Renders a verified content section or a pending placeholder. */
export function GulfHeritageSlotSection({ title, body, pendingMessage }: GulfHeritageSlotSectionProps) {
  return (
    <GulfHeritageContentSection title={title}>
      {body ? <p>{body}</p> : <GulfHeritagePendingContent message={pendingMessage} />}
    </GulfHeritageContentSection>
  );
}
