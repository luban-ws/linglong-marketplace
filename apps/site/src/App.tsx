import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { HeroSearch } from "./components/HeroSearch";
import { IconExternal } from "./components/icons";
import { InstallTabs } from "./components/InstallTabs";
import { LanguageToggle } from "./components/LanguageToggle";
import { PluginGrid } from "./components/PluginGrid";
import { StatBar } from "./components/StatBar";
import { useCopyFeedback } from "./hooks/useCopyFeedback";
import { useSiteCatalog } from "./hooks/useSiteCatalog";
import { useLocale } from "./i18n/LocaleContext";
import { filterSkillsByQuery } from "./lib/filterSkills";
import { buildCurlInstallCommand } from "./lib/installCommands";
import { derivePopularTags } from "./lib/popularTags";
import {
  HERO_SEARCH_INPUT_ID,
  SECTION_INSTALL,
  SECTION_OVERVIEW,
  SECTION_PLUGINS,
  SECTION_QUALITY,
  SECTION_SKILLS,
} from "./lib/sectionIds";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Shell({
  children,
  live,
  gitHubHref,
}: {
  children: ReactNode;
  live: string;
  gitHubHref?: string;
}) {
  const { messages: m } = useLocale();
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  return (
    <>
      <div
        id="aria-live-polite"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {live}
      </div>
      <a className="skip-link" href={`#${SECTION_SKILLS}`}>
        {m.skipLink}
      </a>
      <div className="layout">
        <aside
          id="rail"
          className={navOpen ? "is-open" : undefined}
          aria-label={m.navAria}
        >
          <div className="rail-head">
            <p className="rail-title">Linglong</p>
            <LanguageToggle className="lang-toggle--rail" />
          </div>
          <nav>
            <a href={`#${SECTION_SKILLS}`} onClick={closeNav}>
              {m.nav.catalog}
            </a>
            <a href={`#${SECTION_PLUGINS}`} onClick={closeNav}>
              {m.nav.plugins}
            </a>
            <a href={`#${SECTION_INSTALL}`} onClick={closeNav}>
              {m.nav.install}
            </a>
            <a href={`#${SECTION_OVERVIEW}`} onClick={closeNav}>
              {m.nav.overview}
            </a>
            <a href={`#${SECTION_QUALITY}`} onClick={closeNav}>
              {m.nav.quality}
            </a>
            {gitHubHref ? (
              <a
                href={gitHubHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeNav}
              >
                {m.nav.github}
              </a>
            ) : null}
          </nav>
        </aside>
        <div className="main-col">
          <div className="topbar">
            <span className="topbar-title">Linglong</span>
            <div className="topbar-actions">
              <LanguageToggle />
              <button
                type="button"
                className="nav-toggle"
                aria-expanded={navOpen}
                aria-controls="rail"
                onClick={() => setNavOpen((o) => !o)}
              >
                {m.nav.menu}
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

export default function App() {
  const { messages: m } = useLocale();
  const state = useSiteCatalog();
  const { live, copyText } = useCopyFeedback();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (state.status === "ok") {
      document.title = `${state.data.marketTitle} · Linglong`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", state.data.metaDescription);
    }
  }, [state]);

  const filtered = useMemo(() => {
    if (state.status !== "ok") return [];
    return filterSkillsByQuery(state.data.skills, filter);
  }, [state, filter]);

  const popularTags = useMemo(() => {
    if (state.status !== "ok") return [];
    return derivePopularTags(state.data.plugins);
  }, [state]);

  const applyFilterAndScroll = useCallback((query: string) => {
    setFilter(query);
    scrollToSection(SECTION_SKILLS);
  }, []);

  if (state.status === "loading") {
    return (
      <Shell live={live}>
        <main className="page-main">
          <div className="wrap">
            <p className="lede state-msg">{m.loading}</p>
          </div>
        </main>
      </Shell>
    );
  }

  if (state.status === "error") {
    return (
      <Shell live={live}>
        <main className="page-main">
          <div className="wrap">
            <div className="panel state-error">
              <p className="note">
                {m.error.loadFailed} <code>catalog.json</code>：{state.message}
              </p>
              <p className="note">{m.error.devHint}</p>
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  const c = state.data;
  const curlInstall = buildCurlInstallCommand(c);
  const resultLabel = m.skills.resultCount.replace("{count}", String(filtered.length));

  return (
    <Shell live={live} gitHubHref={c.repositoryUrl}>
      <header className="site">
        <div className="wrap">
          <div className="brand">
            <h1>{c.marketTitle}</h1>
            <span className="tag">{m.brandTag}</span>
          </div>
          <p className="lede">{m.hero.lede}</p>

          <HeroSearch
            id={HERO_SEARCH_INPUT_ID}
            label={m.hero.searchLabel}
            placeholder={m.hero.searchPlaceholder}
            hint={m.hero.searchHint}
            value={filter}
            onChange={setFilter}
            popularLabel={m.hero.popularLabel}
            popularTags={popularTags}
            onPopularSelect={applyFilterAndScroll}
          />

          <StatBar
            pluginCount={c.plugins.length}
            skillCount={c.skills.length}
            version={c.version}
            branch={c.sourceBranch}
            built={c.generatedAt}
            labels={m.stats}
          />

          <div className="hero-actions">
            <a
              className="btn btn-primary"
              href={c.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {m.hero.repoBtn}
            </a>
            <a className="btn btn-ghost" href={`#${SECTION_INSTALL}`}>
              {m.hero.installBtn}
            </a>
            <button
              type="button"
              className="btn"
              onClick={() => void copyText(curlInstall)}
            >
              {m.hero.copyCurlBtn}
            </button>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="wrap">
          <section id={SECTION_SKILLS} aria-labelledby="sk-h">
            <h2 id="sk-h">{m.skills.title}</h2>
            <p className="section-meta">{resultLabel}</p>
            {filtered.length === 0 ? (
              <p className="catalog-empty">{m.skills.empty}</p>
            ) : (
              <div className="skill-grid">
                {filtered.map((s) => (
                  <article
                    key={s.folder}
                    className="card"
                    id={`skill-${s.id.replace(/\s+/g, "-")}`}
                  >
                    <h3>{s.id}</h3>
                    <p className="path-hint">{s.path}</p>
                    <p className="desc">{s.description}</p>
                    <div className="links">
                      <a
                        href={s.folderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {m.skills.source}
                        <IconExternal />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id={SECTION_PLUGINS} aria-labelledby="pl-h">
            <h2 id="pl-h">{m.plugins.title}</h2>
            <PluginGrid
              plugins={c.plugins}
              skillsLabel={m.plugins.skillsUnit}
              browseLabel={m.plugins.browse}
              onBrowse={applyFilterAndScroll}
            />
          </section>

          <section id={SECTION_INSTALL} aria-labelledby="in-h">
            <h2 id="in-h">{m.install.title}</h2>
            <InstallTabs catalog={c} onCopy={(t) => void copyText(t)} />
          </section>

          <section id={SECTION_OVERVIEW} aria-labelledby="ov-h">
            <h2 id="ov-h">{m.overview.title}</h2>
            <div className="panel panel-highlight">
              <p className="note tight">
                {m.overview.highlight}{" "}
                <a href={c.pagesUrl}>GitHub Pages</a>
                {m.overview.highlightSuffix}{" "}
                <a href={c.repositoryUrl}>GitHub</a>
                {m.overview.highlightEnd}
              </p>
              <p className="note tight">{m.overview.fastest}</p>
              <pre className="code-block code-block-compact">{curlInstall}</pre>
              <p className="note tight">{m.overview.pluginHint}</p>
            </div>
            <div className="panel">
              <p className="note tight">
                {m.overview.catalogNote} <code>{c.marketplaceName}</code>
                {m.overview.catalogNoteSuffix}
              </p>
              <p className="note">
                {m.overview.machineReadable}{" "}
                <a href={c.pagesCatalogUrl}>catalog.json</a> ·{" "}
                <a href={c.pagesManifestUrl}>manifest.json</a>
              </p>
            </div>
          </section>

          <section id={SECTION_QUALITY} aria-labelledby="qa-h">
            <h2 id="qa-h">{m.quality.title}</h2>
            <div className="panel">
              <p className="note">{m.quality.note}</p>
              <pre className="code-block">
                {`corepack enable
pnpm install
pnpm check`}
              </pre>
              <div className="copy-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => void copyText("pnpm check")}
                >
                  {m.quality.copy}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="site">
        <div className="wrap">
          <p>
            <a href={c.repositoryUrl}>{c.repository}</a> ·{" "}
            <a href={c.pagesUrl}>GitHub Pages</a> · {m.footer.branch}{" "}
            <code>{c.sourceBranch}</code> ·{" "}
            <a href={`#${SECTION_SKILLS}`}>{m.footer.backTop}</a>
          </p>
        </div>
      </footer>
    </Shell>
  );
}
