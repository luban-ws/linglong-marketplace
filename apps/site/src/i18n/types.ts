export const LOCALE_ZH = "zh" as const;
export const LOCALE_EN = "en" as const;

export type Locale = typeof LOCALE_ZH | typeof LOCALE_EN;

export type Messages = {
  listSep: string;
  htmlLang: string;
  brandTag: string;
  skipLink: string;
  navAria: string;
  installTabsAria: string;
  nav: {
    catalog: string;
    plugins: string;
    install: string;
    overview: string;
    quality: string;
    github: string;
    menu: string;
  };
  loading: string;
  error: {
    loadFailed: string;
    devHint: string;
  };
  hero: {
    lede: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchHint: string;
    popularLabel: string;
    repoBtn: string;
    installBtn: string;
    copyCurlBtn: string;
  };
  stats: {
    plugins: string;
    skills: string;
    version: string;
    branch: string;
    built: string;
  };
  meta: {
    repo: string;
    branch: string;
    built: string;
    manifest: string;
    pages: string;
  };
  overview: {
    title: string;
    highlight: string;
    highlightSuffix: string;
    highlightEnd: string;
    fastest: string;
    pluginHint: string;
    catalogNote: string;
    catalogNoteSuffix: string;
    machineReadable: string;
  };
  install: {
    title: string;
    tabs: {
      quick: string;
      plugin: string;
      copySkills: string;
    };
    quick: {
      note: string;
      curlHead: string;
      copyCurl: string;
      viewScript: string;
      cloneHead: string;
      cloneNote: string;
      cliHead: string;
      copyCli: string;
    };
    plugin: {
      note: string;
      gitSource: string;
      stepAdd: string;
      stepInstall: string;
      copySlash: string;
      docs: string;
    };
    copySkills: {
      note: string;
      copyCmd: string;
    };
  };
  plugins: {
    title: string;
    colPlugin: string;
    colDesc: string;
    colSkills: string;
    skillsUnit: string;
    browse: string;
  };
  skills: {
    title: string;
    filter: string;
    placeholder: string;
    source: string;
    empty: string;
    resultCount: string;
  };
  quality: {
    title: string;
    note: string;
    copy: string;
  };
  footer: {
    branch: string;
    backTop: string;
  };
  copy: {
    unavailable: string;
    success: string;
    failed: string;
  };
  lang: {
    switchToZh: string;
    switchToEn: string;
    label: string;
  };
};
