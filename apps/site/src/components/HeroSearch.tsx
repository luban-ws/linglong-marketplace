import { IconSearch } from "./icons";

type Props = {
  id: string;
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  popularLabel: string;
  popularTags: string[];
  onPopularSelect: (tag: string) => void;
};

/** Marketplace hero search — primary CTA per ui-ux-pro-max directory pattern. */
export function HeroSearch({
  id,
  label,
  placeholder,
  hint,
  value,
  onChange,
  popularLabel,
  popularTags,
  onPopularSelect,
}: Props) {
  return (
    <div className="hero-search">
      <label className="hero-search__label" htmlFor={id}>
        {label}
      </label>
      <div className="hero-search__field">
        <IconSearch className="hero-search__icon" />
        <input
          type="search"
          id={id}
          name="q"
          className="hero-search__input"
          placeholder={placeholder}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <p className="hero-search__hint">{hint}</p>
      {popularTags.length > 0 ? (
        <div className="tag-chips" role="group" aria-label={popularLabel}>
          <span className="tag-chips__label">{popularLabel}</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-chip"
              onClick={() => onPopularSelect(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
