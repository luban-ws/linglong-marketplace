import { useCallback, useState } from "react";

/** Announces copy results for screen readers (aria-live). */
export function useCopyFeedback() {
  const [live, setLive] = useState("");

  const copyText = useCallback(async (text: string) => {
    if (!navigator.clipboard?.writeText) {
      setLive("剪贴板不可用");
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      setLive("已复制");
      return true;
    } catch {
      setLive("复制失败");
      return false;
    }
  }, []);

  return { live, copyText };
}
