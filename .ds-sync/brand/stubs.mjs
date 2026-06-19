// esbuild plugin: replace Next.js / Clerk runtime imports with browser-safe
// stubs so the marketing components render standalone in claude.ai/design.
// Stubs are written as plain JS (React.createElement, no JSX) so no jsx
// transform config is needed; `react` resolves through the react-global shim
// to window.React.

const MODULES = {
  'next/link': `
import * as React from 'react';
export default function Link(props) {
  var href = props.href, children = props.children;
  var rest = Object.assign({}, props);
  delete rest.href; delete rest.children;
  delete rest.prefetch; delete rest.replace; delete rest.scroll; delete rest.shallow; delete rest.passHref; delete rest.legacyBehavior;
  return React.createElement('a', Object.assign({ href: typeof href === 'string' ? href : (href && href.pathname) || '#' }, rest), children);
}
`,
  'next/image': `
import * as React from 'react';
export default function Image(props) {
  var src = props.src;
  if (typeof src === 'string' && typeof window !== 'undefined' && window.__dsAssets && window.__dsAssets[src]) src = window.__dsAssets[src];
  else if (src && typeof src === 'object' && src.src) src = src.src;
  var rest = Object.assign({}, props);
  ['src','priority','fill','loader','quality','placeholder','blurDataURL','unoptimized','sizes','loading','fetchPriority','overrideSrc'].forEach(function(k){ delete rest[k]; });
  return React.createElement('img', Object.assign({ src: src }, rest));
}
`,
  'next/navigation': `
export function usePathname() { return '/'; }
export function useRouter() { return { push: function(){}, replace: function(){}, back: function(){}, forward: function(){}, refresh: function(){}, prefetch: function(){} }; }
export function useSearchParams() { return new URLSearchParams(); }
export function useParams() { return {}; }
export function useSelectedLayoutSegment() { return null; }
export function useSelectedLayoutSegments() { return []; }
export function redirect() {}
export function permanentRedirect() {}
export function notFound() {}
`,
  '@clerk/nextjs': `
import * as React from 'react';
export function useClerk() { return { signOut: function(){}, openUserProfile: function(){}, openSignIn: function(){}, openSignUp: function(){}, user: null, loaded: true }; }
export function useUser() { return { isSignedIn: false, isLoaded: true, user: null }; }
export function useAuth() { return { isSignedIn: false, isLoaded: true, userId: null, signOut: function(){} }; }
export function ClerkProvider(props) { return props.children; }
export function SignedIn() { return null; }
export function SignedOut(props) { return props.children; }
export function SignInButton(props) { return props.children || null; }
export function SignUpButton(props) { return props.children || null; }
export function UserButton() { return React.createElement('div', { style: { width: 28, height: 28, borderRadius: '50%', background: 'var(--orange)' } }); }
`,
};

export const nextClerkStubs = {
  name: 'next-clerk-stubs',
  setup(b) {
    const filter = new RegExp('^(' + Object.keys(MODULES).map((m) => m.replace(/[/]/g, '\\/')).join('|') + ')$');
    b.onResolve({ filter }, (args) => ({ path: args.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => ({ contents: MODULES[args.path], loader: 'js', resolveDir: process.cwd() }));
  },
};
