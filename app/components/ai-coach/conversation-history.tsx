"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Pin, Search, Star, Trash2 } from "lucide-react";
import { EmptyState } from "@/app/components/ui/empty-state";
import { AiCoachPaywall } from "@/app/components/ai-coach/ai-coach-paywall";
import { cards } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  deleteBrewSessionAction,
  duplicateBrewSessionAction,
  listBrewSessionsAction,
} from "@/lib/supabase/ai-coach-module-actions";
import type { AiCoachBrewSession, AiCoachConversation } from "@/types/ai-coach-module";

type ConversationHistoryProps = {
  conversations: AiCoachConversation[];
  isAuthenticated: boolean;
};

export function ConversationHistory({ conversations, isAuthenticated }: ConversationHistoryProps) {
  const { t } = useTranslations();
  const [search, setSearch] = useState("");
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  if (!isAuthenticated) return null;

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("aiCoachModule.searchConversations")}
          className="w-full rounded-full border border-ba-espresso/15 bg-ba-pearl py-2.5 pl-10 pr-4 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-stone-500">{t("aiCoachModule.noConversations")}</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/ai-coach/chat/${conv.id}`}
                className={`${cards.premiumShell} flex items-center gap-3 p-4 text-sm`}
              >
                {conv.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-ba-bronze" />}
                <span className="min-w-0 flex-1 truncate font-medium text-ba-espresso">{conv.title}</span>
                {conv.isFavorite && <Star className="h-3.5 w-3.5 shrink-0 fill-ba-gold text-ba-gold" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type BrewMemoryListProps = {
  initialSessions: AiCoachBrewSession[];
  isAuthenticated: boolean;
};

export function BrewMemoryList({ initialSessions, isAuthenticated }: BrewMemoryListProps) {
  const { t } = useTranslations();
  const [sessions, setSessions] = useState(initialSessions);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return <AiCoachPaywall isAuthenticated={false} />;
  }

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.coffee?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(async () => {
      const res = await listBrewSessionsAction(value || undefined);
      if (res.data?.sessions) setSessions(res.data.sessions);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBrewSessionAction(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const res = await duplicateBrewSessionAction(id);
      if (res.data?.session) setSessions((prev) => [res.data!.session, ...prev]);
    });
  };

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={t("aiCoachModule.searchSessions")}
        className="mb-6 w-full max-w-md rounded-full border border-ba-espresso/15 bg-ba-pearl px-4 py-2.5 text-sm"
      />
      {filtered.length === 0 ? (
        <EmptyState title={t("aiCoachModule.noSessionsTitle")} description={t("aiCoachModule.noSessionsDescription")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((session) => (
            <div key={session.id} className={`${cards.premiumShell} p-5`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-ba-espresso">{session.title}</h3>
                  {session.coffee && <p className="mt-1 text-xs text-stone-500">{session.coffee}</p>}
                  {session.rating && (
                    <p className="mt-1 text-xs text-ba-bronze">{"★".repeat(session.rating)}{"☆".repeat(5 - session.rating)}</p>
                  )}
                </div>
                {session.isFavorite && <Star className="h-4 w-4 fill-ba-gold text-ba-gold" />}
              </div>
              {session.notes && <p className="mt-3 text-sm text-ba-charcoal/80 line-clamp-2">{session.notes}</p>}
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => handleDuplicate(session.id)} disabled={isPending} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-ba-espresso/5">
                  <Copy className="h-3.5 w-3.5" /> {t("aiCoachModule.duplicate")}
                </button>
                <button type="button" onClick={() => handleDelete(session.id)} disabled={isPending} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-stone-500 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" /> {t("aiCoachModule.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
