import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { InstallTabs } from "./components/InstallTabs";
import { useCopyFeedback } from "./hooks/useCopyFeedback";
import { useSiteCatalog } from "./hooks/useSiteCatalog";
import { filterSkillsByQuery } from "./lib/filterSkills";

const GITHUB_PREFIX = "https://github.com/" as const;

function Shell({
  children,
  live,
  gitHubHref,
}: {
  children: ReactNode;
  live: string;
  /** 仅在 catalog 加载完成后提供，用于侧栏 GitHub 链接。 */
  gitHubHref?: string;
}) {
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
      <a className="skip-link" href="#skills">
        跳到技能目录
      </a>
      <div className="layout">
        <aside
          id="rail"
          className={navOpen ? "is-open" : undefined}
          aria-label="章节导航"
        >
          <p className="rail-title">Linglong</p>
          <nav>
            <a href="#overview" onClick={closeNav}>
              概览
            </a>
            <a href="#install" onClick={closeNav}>
              安装
            </a>
            <a href="#plugins" onClick={closeNav}>
              插件
            </a>
            <a href="#skills" onClick={closeNav}>
              目录
            </a>
            <a href="#quality" onClick={closeNav}>
              校验
            </a>
            {gitHubHref ? (
              <a
                href={gitHubHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeNav}
              >
                GitHub
              </a>
            ) : null}
          </nav>
        </aside>
        <div className="main-col">
          <div className="topbar">
            <span className="topbar-title">Linglong</span>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={navOpen}
              aria-controls="rail"
              onClick={() => setNavOpen((o) => !o)}
            >
              菜单
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

/** GitHub repo link from `owner/repo` slug. */
function repoHome(repository: string) {
  return `${GITHUB_PREFIX}${repository}`;
}

export default function App() {
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

  if (state.status === "loading") {
    return (
      <Shell live={live}>
        <main className="page-main">
          <div className="wrap">
            <p className="lede state-msg">正在加载 catalog…</p>
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
                无法加载 <code>catalog.json</code>：{state.message}
              </p>
              <p className="note">
                本地开发请先运行：{" "}
                <code>
                  python3 scripts/build_site.py --export-public-only
                </code>{" "}
                然后在 <code>site/web</code> 执行 <code>npm run dev</code>。
              </p>
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  const c = state.data;
  const gh = repoHome(c.repository);

  return (
    <Shell live={live} gitHubHref={gh}>
      <header className="site">
        <div className="wrap">
          <div className="brand">
            <h1>{c.marketTitle}</h1>
            <span className="tag">玲珑 · Claude Code</span>
          </div>
          <p className="lede">{c.metaDescription}</p>
          <div className="meta-bar">
            <span>
              仓库 <code>{c.repository}</code>
            </span>
            <span>
              分支 <code>{c.sourceBranch}</code>
            </span>
            <span>
              构建 <code>{c.generatedAt}</code>
            </span>
            {c.version ? (
              <span>
                Manifest <code>v{c.version}</code>
              </span>
            ) : null}
          </div>
        </div>
      </header>
      <main className="page-main">
        <div className="wrap">
          <section id="overview" aria-labelledby="ov-h">
            <h2 id="ov-h">概览</h2>
            <div className="panel">
              <p className="note tight">
                本页列出 manifest 中的全部 skill，并提供安装说明与一键复制。数据来自{" "}
                <code>.claude-plugin/marketplace.json</code> 与各插件{" "}
                <code>SKILL.md</code>。
              </p>
              <p className="note">
                可下载机器可读{" "}
                <a href={`${import.meta.env.BASE_URL}manifest.json`}>
                  manifest.json
                </a>{" "}
                做自动化集成。
              </p>
            </div>
          </section>

          <section id="install" aria-labelledby="in-h">
            <h2 id="in-h">安装</h2>
            <InstallTabs catalog={c} onCopy={(t) => void copyText(t)} />
          </section>

          <section id="plugins" aria-labelledby="pl-h">
            <h2 id="pl-h">插件</h2>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>插件</th>
                    <th>说明</th>
                    <th>Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {c.plugins.map((p) => (
                    <tr key={p.name}>
                      <td>
                        <code>{p.name}</code>
                      </td>
                      <td>{p.description}</td>
                      <td>{p.skillCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="skills" aria-labelledby="sk-h">
            <h2 id="sk-h">Skill 目录</h2>
            <div className="skill-toolbar">
              <label htmlFor="skill-filter">筛选</label>
              <input
                type="search"
                id="skill-filter"
                name="q"
                placeholder="按名称、路径、描述搜索…"
                autoComplete="off"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
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
                      源码
                    </a>
                    {s.bundleUrl ? (
                      <>
                        <a href={s.bundleUrl}>Raw .skill</a>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => void copyText(s.bundleUrl)}
                        >
                          复制 URL
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="quality" aria-labelledby="qa-h">
            <h2 id="qa-h">本地校验</h2>
            <div className="panel">
              <p className="note">
                贡献者：推送前请运行与 Husky 相同的检查。
              </p>
              <pre className="code-block">
                {`pip install -r requirements-dev.txt
npm install
npm run check`}
              </pre>
              <div className="copy-row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => void copyText("npm run check")}
                >
                  复制
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="site">
        <div className="wrap">
          <p>
            <a href={gh}>{c.repository}</a> · 分支{" "}
            <code>{c.sourceBranch}</code> · <a href="#overview">回顶部</a>
          </p>
        </div>
      </footer>
    </Shell>
  );
}
