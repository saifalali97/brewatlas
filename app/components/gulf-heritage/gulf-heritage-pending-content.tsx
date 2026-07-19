import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";

type GulfHeritagePendingContentProps = {
  message: string;
};

/** Standard placeholder for unverified Gulf Heritage editorial content. */
export function GulfHeritagePendingContent({ message }: GulfHeritagePendingContentProps) {
  return <GhPendingContent message={message} />;
}
