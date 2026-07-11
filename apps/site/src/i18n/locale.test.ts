import { describe, expect, it } from "vitest";
import { getMessages, resolveLocale } from "./locale";
import { LOCALE_EN, LOCALE_ZH } from "./types";

describe("resolveLocale", () => {
  it("prefers stored locale when valid", () => {
    expect(resolveLocale("zh", "en-US")).toBe(LOCALE_ZH);
    expect(resolveLocale("en", "zh-CN")).toBe(LOCALE_EN);
  });

  it("detects Chinese from navigator language", () => {
    expect(resolveLocale(null, "zh-CN")).toBe(LOCALE_ZH);
    expect(resolveLocale(null, "zh-TW")).toBe(LOCALE_ZH);
  });

  it("defaults to English for other languages", () => {
    expect(resolveLocale(null, "en-US")).toBe(LOCALE_EN);
    expect(resolveLocale("fr", "ja-JP")).toBe(LOCALE_EN);
  });
});

describe("getMessages", () => {
  it("returns both locale bundles with nav keys", () => {
    expect(getMessages(LOCALE_ZH).nav.overview).toBe("概览");
    expect(getMessages(LOCALE_EN).nav.overview).toBe("Overview");
  });
});
