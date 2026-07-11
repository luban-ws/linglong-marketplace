import { useCallback, useState, type KeyboardEvent } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { CLAUDE_PLUGINS_DOCS_URL } from "../lib/constants";
import {
  buildClaudeInstallCommands,
  buildCliInstallCommands,
  buildCurlInstallCommand,
} from "../lib/installCommands";
import type { SiteCatalog, Skill } from "../types/catalog";

const TAB_QUICK = "quick";
const TAB_PLUGIN = "plugin";
const TAB_COPY = "copy";

type TabId = typeof TAB_QUICK | typeof TAB_PLUGIN | typeof TAB_COPY;

type Props = {
  catalog: SiteCatalog;
  onCopy: (text: string) => void;
};

function tabIdRole(
  id: TabId,
  active: TabId,
): { selected: boolean; tabIndex: number } {
  return {
    selected: active === id,
    tabIndex: active === id ? 0 : -1,
  };
}

/** Install UI aligned with install.sh: marketplace add (git URL) + plugin install. */
export function InstallTabs({ catalog, onCopy }: Props) {
  const { messages: t } = useLocale();
  const [active, setActive] = useState<TabId>(TAB_QUICK);

  const select = useCallback((id: TabId) => {
    setActive(id);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent, tabs: TabId[], index: number) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const nextIndex =
        e.key === "ArrowRight"
          ? Math.min(tabs.length - 1, index + 1)
          : Math.max(0, index - 1);
      const nextId = tabs[nextIndex];
      if (nextId) select(nextId);
    },
    [select],
  );

  const tabs: TabId[] = [TAB_QUICK, TAB_PLUGIN, TAB_COPY];

  const curlCmd = buildCurlInstallCommand(catalog);
  const slashCmd = buildClaudeInstallCommands(catalog);
  const cliCmd = buildCliInstallCommands(catalog);
  const cloneInstallBlock = `git clone ${catalog.cloneUrl}\ncd ${catalog.repoName}\nsh install.sh`;

  const q = tabIdRole(TAB_QUICK, active);
  const p = tabIdRole(TAB_PLUGIN, active);
  const cp = tabIdRole(TAB_COPY, active);

  return (
    <div className="install-tabs">
      <ul className="tablist" role="tablist" aria-label={t.installTabsAria}>
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="tab-quick"
            aria-controls="panel-quick"
            aria-selected={q.selected}
            tabIndex={q.tabIndex}
            onClick={() => select(TAB_QUICK)}
            onKeyDown={(e) => onKeyDown(e, tabs, 0)}
          >
            {t.install.tabs.quick}
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="tab-plugin"
            aria-controls="panel-plugin"
            aria-selected={p.selected}
            tabIndex={p.tabIndex}
            onClick={() => select(TAB_PLUGIN)}
            onKeyDown={(e) => onKeyDown(e, tabs, 1)}
          >
            {t.install.tabs.plugin}
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="tab-copy"
            aria-controls="panel-copy"
            aria-selected={cp.selected}
            tabIndex={cp.tabIndex}
            onClick={() => select(TAB_COPY)}
            onKeyDown={(e) => onKeyDown(e, tabs, 2)}
          >
            {t.install.tabs.copySkills}
          </button>
        </li>
      </ul>

      <div
        role="tabpanel"
        id="panel-quick"
        className={`tabpanel${active === TAB_QUICK ? " is-active" : ""}`}
        hidden={active !== TAB_QUICK}
      >
        <p className="note">
          {t.install.quick.note.replace("{name}", catalog.marketplaceName)}{" "}
          <a
            href="https://code.claude.com/docs/en/cli"
            target="_blank"
            rel="noopener noreferrer"
          >
            Claude Code CLI
          </a>
        </p>
        <h3 className="subhead">{t.install.quick.curlHead}</h3>
        <pre className="code-block">{curlCmd}</pre>
        <div className="copy-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onCopy(curlCmd)}
          >
            {t.install.quick.copyCurl}
          </button>
          <a
            className="btn btn-ghost"
            href={catalog.installScriptRawUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.install.quick.viewScript}
          </a>
        </div>
        <h3 className="subhead">{t.install.quick.cloneHead}</h3>
        <p className="note tight">{t.install.quick.cloneNote}</p>
        <pre className="code-block">{cloneInstallBlock}</pre>
        <h3 className="subhead">{t.install.quick.cliHead}</h3>
        <pre className="code-block">{cliCmd}</pre>
        <div className="copy-row">
          <button type="button" className="btn" onClick={() => onCopy(cliCmd)}>
            {t.install.quick.copyCli}
          </button>
        </div>
      </div>

      <div
        role="tabpanel"
        id="panel-plugin"
        className={`tabpanel${active === TAB_PLUGIN ? " is-active" : ""}`}
        hidden={active !== TAB_PLUGIN}
      >
        <p className="note">{t.install.plugin.note}</p>
        <ul className="install-bullets">
          <li>
            {t.install.plugin.gitSource} <code>{catalog.cloneUrl}</code>
          </li>
          <li>
            {t.install.plugin.stepAdd}:{" "}
            <code>/plugin marketplace add {catalog.cloneUrl}</code>
          </li>
          <li>{t.install.plugin.stepInstall}:</li>
        </ul>
        <pre className="code-block">{slashCmd}</pre>
        <div className="copy-row">
          <button type="button" className="btn btn-primary" onClick={() => onCopy(slashCmd)}>
            {t.install.plugin.copySlash}
          </button>
        </div>
        <p className="note note-spaced">
          {t.install.plugin.docs}{" "}
          <a href={CLAUDE_PLUGINS_DOCS_URL}>Claude Code plugins</a>
        </p>
      </div>

      <div
        role="tabpanel"
        id="panel-copy"
        className={`tabpanel${active === TAB_COPY ? " is-active" : ""}`}
        hidden={active !== TAB_COPY}
      >
        <p className="note">{t.install.copySkills.note}</p>
        {catalog.skills.map((s: Skill) => (
          <div key={s.folder} className="panel copy-panel">
            <h3>
              <code>{s.id}</code>{" "}
              <span className="path-hint">({s.path})</span>
            </h3>
            <pre className="code-block">{s.copyCommand}</pre>
            <div className="copy-row">
              <button
                type="button"
                className="btn"
                onClick={() => onCopy(s.copyCommand)}
              >
                {t.install.copySkills.copyCmd}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
