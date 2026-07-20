"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Copy,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { MarkdownRenderer } from "@/app/components/ai-coach/markdown-renderer";
import { AiCoachPaywall } from "@/app/components/ai-coach/ai-coach-paywall";
import { trackAiCoachEvent } from "@/lib/analytics/ai-coach";
import { streamCoachChatMessage } from "@/lib/ai/coach-chat-stream";
import { cards, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  deleteConversationAction,
  sendChatMessageAction,
  setMessageFeedbackAction,
} from "@/lib/supabase/ai-coach-module-actions";
import type { AiCoachMessage } from "@/types/ai-coach-module";

type AiCoachChatProps = {
  conversationId?: string | null;
  initialMessages?: AiCoachMessage[];
  isAuthenticated: boolean;
  canUseAi: boolean;
  paywallReason?: string;
  quickStart?: string;
  streamingEnabled?: boolean;
};

export function AiCoachChat({
  conversationId: initialConversationId,
  initialMessages = [],
  isAuthenticated,
  canUseAi,
  paywallReason,
  quickStart,
  streamingEnabled = false,
}: AiCoachChatProps) {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<AiCoachMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const [input, setInput] = useState(quickStart ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || !isAuthenticated || !canUseAi) return;

    setInput("");
    setError(null);
    setIsTyping(true);

    const optimisticUser: AiCoachMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId ?? "",
      userId: "",
      role: "user",
      content: message,
      feedback: null,
      metadata: {},
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    if (streamingEnabled) {
      setIsTyping(false);
      const assistantId = `temp-assistant-${Date.now()}`;
      const optimisticAssistant: AiCoachMessage = {
        id: assistantId,
        conversationId: conversationId ?? "",
        userId: "",
        role: "assistant",
        content: "",
        feedback: null,
        metadata: {},
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticAssistant]);

      try {
        const result = await streamCoachChatMessage(message, conversationId, {
          onMeta: (nextConversationId) => setConversationId(nextConversationId),
          onDelta: (delta) => {
            setMessages((prev) =>
              prev.map((entry) =>
                entry.id === assistantId ? { ...entry, content: entry.content + delta } : entry,
              ),
            );
          },
        });
        setConversationId(result.conversationId);
        setMessages(result.messages);
        trackAiCoachEvent("chat_started", { conversationId: result.conversationId });
      } catch (streamError) {
        setError(streamError instanceof Error ? streamError.message : "Something went wrong.");
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id && m.id !== assistantId));
      } finally {
        setIsTyping(false);
      }
      return;
    }

    startTransition(async () => {
      const result = await sendChatMessageAction(message, conversationId);
      setIsTyping(false);
      if (result.error) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
        return;
      }
      if (result.data) {
        setConversationId(result.data.conversationId);
        setMessages(result.data.messages);
        trackAiCoachEvent("chat_started", { conversationId: result.data.conversationId });
      }
    });
  };

  const handleCopy = (content: string) => {
    void navigator.clipboard.writeText(content);
  };

  const handleFeedback = (messageId: string, feedback: "like" | "dislike") => {
    startTransition(async () => {
      await setMessageFeedbackAction(messageId, feedback);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback } : m)));
    });
  };

  const handleDelete = () => {
    if (!conversationId) return;
    startTransition(async () => {
      await deleteConversationAction(conversationId);
      setMessages([]);
      setConversationId(null);
    });
  };

  if (!isAuthenticated) {
    return <AiCoachPaywall isAuthenticated={false} reason={paywallReason} />;
  }

  if (!canUseAi) {
    return <AiCoachPaywall isAuthenticated={true} reason={paywallReason} />;
  }

  return (
    <div className={`${cards.premiumShell} flex h-[min(70vh,640px)] flex-col overflow-hidden`}>
      <div aria-hidden className={cards.premiumSheen} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        {conversationId && (
          <div className="flex items-center justify-end border-b border-ba-espresso/8 px-4 py-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-ba-espresso/5 hover:text-red-600"
              aria-label={t("aiCoachModule.deleteConversation")}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("aiCoachModule.deleteConversation")}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.length === 0 && !isTyping && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm font-medium text-ba-charcoal">{t("aiCoachModule.chatEmptyTitle")}</p>
              <p className="max-w-sm text-sm text-stone-500">{t("aiCoachModule.chatEmptyDescription")}</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-ba-espresso text-ba-pearl"
                      : "border border-ba-espresso/10 bg-ba-pearl"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    msg.content ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <Loader2 className="h-4 w-4 animate-spin text-ba-bronze" />
                        <span>{t("aiCoachModule.typing")}</span>
                      </div>
                    )
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}

                  {msg.role === "assistant" && !msg.id.startsWith("temp-") && (
                    <div className="mt-3 flex items-center gap-1 border-t border-ba-espresso/8 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content)}
                        className="rounded p-1.5 text-stone-400 hover:bg-ba-espresso/5 hover:text-ba-espresso"
                        aria-label={t("aiCoachModule.copyResponse")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, "like")}
                        className={`rounded p-1.5 hover:bg-ba-espresso/5 ${msg.feedback === "like" ? "text-green-600" : "text-stone-400 hover:text-ba-espresso"}`}
                        aria-label={t("aiCoachModule.likeResponse")}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(msg.id, "dislike")}
                        className={`rounded p-1.5 hover:bg-ba-espresso/5 ${msg.feedback === "dislike" ? "text-red-600" : "text-stone-400 hover:text-ba-espresso"}`}
                        aria-label={t("aiCoachModule.dislikeResponse")}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-ba-espresso/10 bg-ba-pearl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-ba-bronze" />
                  <span className="text-sm text-stone-500">{t("aiCoachModule.typing")}</span>
                </div>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="border-t border-ba-espresso/8 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("aiCoachModule.chatPlaceholder")}
              className={`${forms.input} flex-1`}
              disabled={isPending || isTyping}
              aria-label={t("aiCoachModule.chatPlaceholder")}
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending || isTyping}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ba-espresso px-5 text-sm font-medium text-ba-pearl disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("aiCoachModule.sendMessage")}
            </button>
          </form>
          <p className="mt-2 text-xs text-stone-400">{t("aiCoachModule.chatDisclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
