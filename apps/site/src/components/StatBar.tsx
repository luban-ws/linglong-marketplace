type Props = {
  pluginCount: number;
  skillCount: number;
  version: string | null;
  branch: string;
  built: string;
  labels: {
    plugins: string;
    skills: string;
    version: string;
    branch: string;
    built: string;
  };
};

/** Trust / inventory metrics below the hero search. */
export function StatBar({ pluginCount, skillCount, version, branch, built, labels }: Props) {
  return (
    <dl className="stat-bar">
      <div className="stat-pill">
        <dt>{labels.plugins}</dt>
        <dd>{pluginCount}</dd>
      </div>
      <div className="stat-pill">
        <dt>{labels.skills}</dt>
        <dd>{skillCount}</dd>
      </div>
      {version ? (
        <div className="stat-pill">
          <dt>{labels.version}</dt>
          <dd>
            <code>v{version}</code>
          </dd>
        </div>
      ) : null}
      <div className="stat-pill">
        <dt>{labels.branch}</dt>
        <dd>
          <code>{branch}</code>
        </dd>
      </div>
      <div className="stat-pill">
        <dt>{labels.built}</dt>
        <dd>
          <code>{built}</code>
        </dd>
      </div>
    </dl>
  );
}
