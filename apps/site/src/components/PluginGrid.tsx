import { IconPackage } from "./icons";
import type { PluginRow } from "../types/catalog";

type Props = {
  plugins: PluginRow[];
  skillsLabel: string;
  browseLabel: string;
  onBrowse: (pluginName: string) => void;
};

/** Plugin category cards — marketplace directory pattern step 2. */
export function PluginGrid({ plugins, skillsLabel, browseLabel, onBrowse }: Props) {
  return (
    <div className="plugin-grid">
      {plugins.map((plugin) => (
        <article key={plugin.name} className="plugin-card">
          <div className="plugin-card__head">
            <IconPackage className="plugin-card__icon" />
            <h3>
              <code>{plugin.name}</code>
            </h3>
          </div>
          <p className="plugin-card__desc">{plugin.description}</p>
          <div className="plugin-card__foot">
            <span className="plugin-card__count">
              {plugin.skillCount} {skillsLabel}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onBrowse(plugin.name)}
            >
              {browseLabel}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
