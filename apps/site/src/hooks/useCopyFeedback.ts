import { useCallback, useState } from "react";
import { useLocale } from "../i18n/LocaleContext";

/** Announces copy results for screen readers (aria-live). */
export function useCopyFeedback() {
  const { messages } = useLocale();
  const [live, setLive] = useState("");

  const copyText = useCallback(
    async (text: string) => {
      if (!navigator.clipboard?.writeText) {
        setLive(messages.copy.unavailable);
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setLive(messages.copy.success);
        return true;
      } catch {
        setLive(messages.copy.failed);
        return false;
      }
    },
    [messages.copy.failed, messages.copy.success, messages.copy.unavailable],
  );

  return { live, copyText };
}
