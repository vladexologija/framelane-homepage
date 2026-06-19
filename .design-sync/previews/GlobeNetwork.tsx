// Authored preview for GlobeNetwork (FrameLane brand kit).
// Renders the real bundled component inside a dark page frame — the backdrop
// FrameLane's sections are designed against.
import * as React from 'react';

const NS = (window as any).FrameLane;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--fg)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  );
}

export function Default() {
  const C = NS.GlobeNetwork;
  return (
    <Frame>
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}><C /></div>
    </Frame>
  );
}
