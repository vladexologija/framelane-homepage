// FrameLane brand-kit component registry.
// Off-converter extraction: this repo is a Next.js app, so the component list
// is curated by hand (the converter's .d.ts-export discovery doesn't apply).
export const GLOBAL = 'FrameLane';
export const PKG = 'framelane-homepage';
export const VERSION = '0.1.0';

// name = exported symbol; file = source (repo-relative); group = DS-pane section.
export const COMPONENTS = [
  // Marketing page sections
  { name: 'Hero', file: 'src/components/hero.tsx', group: 'Sections' },
  { name: 'UseCases', file: 'src/components/use-cases.tsx', group: 'Sections' },
  { name: 'Capabilities', file: 'src/components/capabilities.tsx', group: 'Sections' },
  { name: 'HowItWorks', file: 'src/components/how-it-works.tsx', group: 'Sections' },
  { name: 'Comparisons', file: 'src/components/comparisons.tsx', group: 'Sections' },
  { name: 'Workflows', file: 'src/components/workflows.tsx', group: 'Sections' },
  { name: 'Examples', file: 'src/components/examples.tsx', group: 'Sections' },
  { name: 'Testimonials', file: 'src/components/testimonials.tsx', group: 'Sections' },
  { name: 'ScaleBlock', file: 'src/components/scale-block.tsx', group: 'Sections' },
  { name: 'FAQ', file: 'src/components/faq.tsx', group: 'Sections' },
  { name: 'GetStarted', file: 'src/components/get-started.tsx', group: 'Sections' },
  { name: 'CtaBanner', file: 'src/components/cta-banner.tsx', group: 'Sections' },
  // Site chrome
  { name: 'Nav', file: 'src/components/nav.tsx', group: 'Chrome' },
  { name: 'Footer', file: 'src/components/footer.tsx', group: 'Chrome' },
  { name: 'Logo', file: 'src/components/logo.tsx', group: 'Chrome' },
  { name: 'ConsoleSidebar', file: 'src/components/console-sidebar.tsx', group: 'Chrome' },
  // Primitives
  { name: 'CodeTabs', file: 'src/components/code-tabs.tsx', group: 'Primitives' },
  // Decorative / atmosphere
  { name: 'GlobeNetwork', file: 'src/components/globe-network.tsx', group: 'Decoration' },
  { name: 'DotGrid', file: 'src/components/dot-grid.tsx', group: 'Decoration' },
];
