import { useCallback, useState, type KeyboardEvent } from "react";
import { CLAUDE_PLUGINS_DOCS_URL } from "../lib/constants";
import type { SiteCatalog, Skill } from "../types/catalog";

const TAB_MARKETPLACE = "marketplace";
const TAB_CLONE = "clone";
const TAB_COPY = "copy";
const TAB_BUNDLES = "bundles";

type TabId =
  | typeof TAB_MARKETPLACE
  | typeof TAB_CLONE
  | typeof TAB_COPY
  | typeof TAB_BUNDLES;

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

export function InstallTabs({ catalog, onCopy }: Props) {
  const [active, setActive] = useState<TabId>(TAB_MARKETPLACE);

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

  const tabs: TabId[] = [
    TAB_MARKETPLACE,
    TAB_CLONE,
    TAB_COPY,
    TAB_BUNDLES,
  ];

  const cloneBlock = `git clone ${catalog.cloneUrl}\ncd ${catalog.repoName}`;
  const cloneOneLiner = `git clone ${catalog.cloneUrl} && cd ${catalog.repoName}`;

  const m = tabIdRole(TAB_MARKETPLACE, active);
  const c = tabIdRole(TAB_CLONE, active);
  const cp = tabIdRole(TAB_COPY, active);
  const b = tabIdRole(TAB_BUNDLES, active);

  return (
    <div className="install-tabs">
      <ul className="tablist" role="tablist" aria-label="安装方式">
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="tab-marketplace"
            aria-controls="panel-marketplace"
            aria-selected={m.selected}
            tabIndex={m.tabIndex}
            onClick={() => select(TAB_MARKETPLACE)}
            onKeyDown={(e) => onKeyDown(e, tabs, 0)}
          >
            Marketplace
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="tab-clone"
            aria-controls="panel-clone"
            aria-selected={c.selected}
            tabIndex={c.tabIndex}
            onClick={() => select(TAB_CLONE)}
            onKeyDown={(e) => onKeyDown(e, tabs, 1)}
          >
            Clone
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
            ~/.claude/skills
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            role="tab"
            id="tab-bundles"
            aria-controls="panel-bundles"
            aria-selected={b.selected}
            tabIndex={b.tabIndex}
            onClick={() => select(TAB_BUNDLES)}
            onKeyDown={(e) => onKeyDown(e, tabs, 3)}
          >
            .skill 文件
          </button>
        </li>
      </ul>

      <div
        role="tabpanel"
        id="panel-marketplace"
        className={`tabpanel${active === TAB_MARKETPLACE ? " is-active" : ""}`}
        hidden={active !== TAB_MARKETPLACE}
      >
        <p className="note">
          在 Claude Code 中将本仓库添加为 <strong>marketplace</strong>
          ，然后安装插件{" "}
          <code>{catalog.marketplacePluginName}</code>（或 manifest 中的名称）。
        </p>
        <ul className="install-bullets">
          <li>
            添加 marketplace 源：<code>{catalog.repository}</code>
          </li>
          <li>
            Manifest 路径：<code>.claude-plugin/marketplace.json</code>
          </li>
        </ul>
      </div>

      <div
        role="tabpanel"
        id="panel-clone"
        className={`tabpanel${active === TAB_CLONE ? " is-active" : ""}`}
        hidden={active !== TAB_CLONE}
      >
        <p className="note">
          克隆仓库后，可将该目录注册为 Claude Code marketplace，或复制 skill 目录。
        </p>
        <pre className="code-block">{cloneBlock}</pre>
        <div className="copy-row">
          <button
            type="button"
            className="btn"
            onClick={() => onCopy(catalog.cloneUrl)}
          >
            复制 HTTPS 克隆地址
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => onCopy(cloneOneLiner)}
          >
            复制一行命令
          </button>
        </div>
        <p className="note note-spaced">
          文档：{" "}
          <a href={CLAUDE_PLUGINS_DOCS_URL}>Claude Code plugins</a>
        </p>
      </div>

      <div
        role="tabpanel"
        id="panel-copy"
        className={`tabpanel${active === TAB_COPY ? " is-active" : ""}`}
        hidden={active !== TAB_COPY}
      >
        <p className="note">
          在仓库根目录执行，将某个 skill 复制到全局 Claude skills 目录（文件夹名可能与{" "}
          <code>SKILL.md</code> 里的 <code>name:</code> 不同）。
        </p>
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
                复制命令
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        role="tabpanel"
        id="panel-bundles"
        className={`tabpanel${active === TAB_BUNDLES ? " is-active" : ""}`}
        hidden={active !== TAB_BUNDLES}
      >
        <p className="note">
          预构建的 <code>.skill</code> 压缩包位于 <code>plugins/</code>
          。若客户端支持 skill bundle，可下载 raw 文件。
        </p>
        <ul className="bundle-list">
          {catalog.skills.some((s) => s.bundleUrl) ? (
            catalog.skills
              .filter((s) => s.bundleUrl)
              .map((s) => (
                <li key={s.folder}>
                  <a href={s.bundleUrl}>
                    <code>{s.folder}.skill</code>
                  </a>{" "}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => onCopy(s.bundleUrl)}
                  >
                    复制 URL
                  </button>
                </li>
              ))
          ) : (
            <li className="note bundle-empty">
              本次构建未找到 .skill 归档。
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
