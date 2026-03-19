import { defineConfig, presetWind4, presetIcons } from 'unocss';

const mocha = {
  base: '#303446', mantle: '#292c3c', crust: '#232634',
  surface0: '#414559', surface1: '#51576d', surface2: '#626880',
  overlay0: '#737994', overlay1: '#838ba7', overlay2: '#949cbb',
  subtext0: '#a5adce', subtext1: '#b5bfe2',
  text: '#c6d0f5', lavender: '#babbf1', blue: '#8caaee',
  sapphire: '#85c1dc', sky: '#99d1db', teal: '#81c8be',
  green: '#a6d189', yellow: '#e5c890', peach: '#ef9f76',
  maroon: '#ea999c', red: '#e78284', mauve: '#ca9ee6',
  pink: '#f4b8e4', flamingo: '#eebebe', rosewater: '#f2d5cf',
};

const latte = {
  base: '#eff1f5', mantle: '#e6e9ef', crust: '#dce0e8',
  surface0: '#d9dfedff', surface1: '#d0d5e2ff', surface2: '#c7cde1ff',
  overlay0: '#9ca0b0', overlay1: '#8c8fa1', overlay2: '#7c7f93',
  subtext0: '#6c6f85', subtext1: '#5c5f77',
  text: '#4c4f69', lavender: '#7287fd', blue: '#1e66f5',
  sapphire: '#209fb5', sky: '#04a5e5', teal: '#179299',
  green: '#40a02b', yellow: '#df8e1d', peach: '#fe640b',
  maroon: '#e64553', red: '#d20f39', mauve: '#8839ef',
  pink: '#ea76cb', flamingo: '#dd7878', rosewater: '#dc8a78',
};

function generateCssVars(): string {
  const colorKeys = Object.keys(latte) as (keyof typeof latte)[];

  const lightVars = colorKeys.map(k => `  --ctp-${k}: ${latte[k]};`).join('\n');
  const darkVars = colorKeys.map(k => `  --ctp-${k}: ${mocha[k]};`).join('\n');

  return `:root {\n${lightVars}\n}\n.dark {\n${darkVars}\n}`;
}

const ctpColors: Record<string, string> = {};
for (const key of Object.keys(latte)) {
  ctpColors[key] = `var(--ctp-${key})`;
}

export default defineConfig({
  safelist: [
    'btn-primary-all', 'btn-primary-general', 'btn-primary-off-topic', 'btn-primary-images', 'btn-primary-errores', 'btn-primary-requests',
    'forum-filter-active-all', 'forum-filter-active-general', 'forum-filter-active-off-topic', 'forum-filter-active-images', 'forum-filter-active-errores', 'forum-filter-active-requests'
  ],
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  preflights: [
    { getCSS: () => generateCssVars() },
  ],
  theme: {
    colors: {
      ctp: ctpColors,
    },
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
  },
  shortcuts: {
    'card': 'bg-ctp-surface0 border border-ctp-surface1 rounded-xl p-6 transition-all duration-200 hover:border-ctp-overlay0 hover:shadow-lg hover:-translate-y-1',
    'card-clickable': 'card block no-underline cursor-pointer',
    'card-flat': 'bg-ctp-surface0 border border-ctp-surface1 rounded-xl p-6 transition-all duration-200',
    'dot-online': 'w-2.5 h-2.5 rounded-full bg-ctp-green shadow-sm animate-pulse',
    'dot-offline': 'w-2.5 h-2.5 rounded-full bg-ctp-red shadow-sm',
    'dot-degraded': 'w-2.5 h-2.5 rounded-full bg-ctp-yellow shadow-sm animate-pulse',
    'btn-primary': 'inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-ctp-mauve text-ctp-base hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 no-underline cursor-pointer',
    'btn-primary-all': 'btn-primary bg-ctp-mauve',
    'btn-primary-general': 'btn-primary bg-ctp-blue',
    'btn-primary-off-topic': 'btn-primary bg-ctp-peach',
    'btn-primary-images': 'btn-primary bg-ctp-green',
    'btn-primary-errores': 'btn-primary bg-ctp-red',
    'btn-primary-requests': 'btn-primary bg-ctp-yellow',
    'btn-secondary': 'inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-ctp-surface0 text-ctp-text border border-ctp-surface1 hover:bg-ctp-surface1 hover:border-ctp-overlay0 transition-all duration-200 no-underline cursor-pointer',
    'btn-sm': 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs bg-ctp-surface0 text-ctp-subtext0 border border-ctp-surface1 hover:bg-ctp-surface1 hover:text-ctp-text transition-all duration-200 cursor-pointer',
    'badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
    'badge-general': 'badge bg-ctp-blue/15 text-ctp-blue',
    'badge-off-topic': 'badge bg-ctp-peach/15 text-ctp-peach',
    'badge-images': 'badge bg-ctp-green/15 text-ctp-green',
    'badge-errores': 'badge bg-ctp-red/15 text-ctp-red',
    'badge-requests': 'badge bg-ctp-yellow/15 text-ctp-yellow',
    'input': 'w-full px-4 py-2.5 rounded-lg bg-ctp-mantle border border-ctp-surface1 text-ctp-text placeholder-ctp-overlay0 outline-none focus:border-ctp-mauve focus:ring-2 focus:ring-ctp-mauve/25 transition-all duration-200 text-sm',
    'textarea': 'w-full px-4 py-3 rounded-lg bg-ctp-mantle border border-ctp-surface1 text-ctp-text placeholder-ctp-overlay0 outline-none focus:border-ctp-mauve focus:ring-2 focus:ring-ctp-mauve/25 transition-all duration-200 text-sm resize-y min-h-24',
    'nav-link': 'text-sm font-medium text-ctp-subtext0 hover:text-ctp-mauve transition-colors duration-200 no-underline',
    'nav-link-active': 'text-sm font-medium text-ctp-mauve no-underline',
    'post-card': 'bg-ctp-surface0 border border-ctp-surface1 rounded-xl p-5 transition-all duration-200 hover:border-ctp-overlay0 hover:shadow-md cursor-pointer',
    'forum-row': 'block px-4 py-3 bg-ctp-surface0 border-b border-ctp-surface1 hover:bg-ctp-mantle transition-colors duration-150 no-underline cursor-pointer',
    'forum-table-header': 'flex items-center justify-between px-4 py-2.5 bg-ctp-mantle border border-ctp-surface1 rounded-t-lg text-xs font-bold text-ctp-subtext0 uppercase tracking-wide',
    'forum-filter': 'px-3 py-1 rounded text-xs font-medium bg-ctp-surface0 text-ctp-subtext0 border border-ctp-surface1 hover:bg-ctp-surface1 hover:text-ctp-text transition-all duration-150 cursor-pointer',
    'forum-filter-active': 'px-3 py-1 rounded text-xs font-medium bg-ctp-mauve text-ctp-base border border-ctp-mauve cursor-pointer',
    'forum-filter-active-all': 'px-3 py-1 rounded text-xs font-medium bg-ctp-mauve text-ctp-base border border-ctp-mauve cursor-pointer',
    'forum-filter-active-general': 'px-3 py-1 rounded text-xs font-medium bg-ctp-blue text-ctp-base border border-ctp-blue cursor-pointer',
    'forum-filter-active-off-topic': 'px-3 py-1 rounded text-xs font-medium bg-ctp-peach text-ctp-base border border-ctp-peach cursor-pointer',
    'forum-filter-active-images': 'px-3 py-1 rounded text-xs font-medium bg-ctp-green text-ctp-base border border-ctp-green cursor-pointer',
    'forum-filter-active-errores': 'px-3 py-1 rounded text-xs font-medium bg-ctp-red text-ctp-base border border-ctp-red cursor-pointer',
    'forum-filter-active-requests': 'px-3 py-1 rounded text-xs font-medium bg-ctp-yellow text-ctp-base border border-ctp-yellow cursor-pointer',
    'comment-card': 'bg-ctp-mantle border border-ctp-surface0 rounded-lg p-4',
    'avatar': 'w-8 h-8 rounded bg-ctp-mauve/20 text-ctp-mauve flex items-center justify-center font-bold text-xs shrink-0',
    'avatar-sm': 'w-6 h-6 rounded bg-ctp-mauve/20 text-ctp-mauve flex items-center justify-center font-bold text-[10px] shrink-0',
    'modal-overlay': 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
    'modal-content': 'bg-ctp-base border border-ctp-surface1 rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl',
  },
});
