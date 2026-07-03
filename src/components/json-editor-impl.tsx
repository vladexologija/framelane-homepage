"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import type { EditorState } from "@codemirror/state";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { syntaxTree } from "@codemirror/language";
import type { SyntaxNode } from "@lezer/common";
import { validateRenderRequest } from "@/lib/renderRequestSchema";
import { collectPreviewIssues } from "@/lib/renderRequestToScene";

// Console-theme CodeMirror instance. Colours reuse the app's CSS variables so the
// editor matches the rest of the console (see globals.css :root tokens).
const consoleTheme = EditorView.theme(
  {
    "&": { background: "var(--bg)", color: "var(--fg-2)", fontSize: "12px", height: "100%" },
    ".cm-content": {
      fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      caretColor: "var(--orange)",
      padding: "12px 0",
    },
    ".cm-gutters": {
      background: "var(--bg-2)",
      color: "var(--fg-dim)",
      border: "none",
      borderRight: "1px solid var(--line)",
    },
    ".cm-activeLine": { background: "rgba(255,255,255,0.03)" },
    ".cm-activeLineGutter": { background: "rgba(255,255,255,0.03)", color: "var(--fg-mute)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection": {
      background: "var(--orange-soft) !important",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-cursor": { borderLeftColor: "var(--orange)" },
    // JSON token colours (mirror the old highlightCurl palette).
    ".ͼb": { color: "#8b9bd4" }, // property names
    ".ͼe": { color: "#cfa978" }, // strings
    ".ͼd": { color: "var(--green)" }, // numbers
    ".ͼc": { color: "var(--orange-hi)" }, // literals (true/false/null)
    ".cm-lintRange-error": { textDecoration: "underline wavy var(--red)" },
    ".cm-lintRange-warning": { textDecoration: "underline wavy var(--orange)" },
  },
  { dark: true },
);

const PUNCT = new Set(["{", "}", "[", "]", ":", ",", "PropertyName", "⚠"]);

/** Best-effort: resolve a validation issue `path` (e.g. "elements.0.source_url")
 *  to a document range via the JSON syntax tree. Returns null → caller falls back. */
function locateJsonPath(state: EditorState, path: string): { from: number; to: number } | null {
  if (!path) return null;
  const tokens = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  const doc = state.doc;
  const tree = syntaxTree(state);
  let node: SyntaxNode | null = tree.topNode.firstChild; // the top-level value
  for (const tok of tokens) {
    if (!node) return null;
    if (node.name === "Object") {
      let match: SyntaxNode | null = null;
      for (let p: SyntaxNode | null = node.firstChild; p; p = p.nextSibling) {
        if (p.name !== "Property") continue;
        const nameNode = p.getChild("PropertyName");
        if (nameNode && doc.sliceString(nameNode.from, nameNode.to).replace(/^"|"$/g, "") === tok) {
          match = p.lastChild; // the property value
          break;
        }
      }
      node = match;
    } else if (node.name === "Array") {
      const idx = Number(tok);
      if (!Number.isInteger(idx)) return null;
      let i = 0;
      let found: SyntaxNode | null = null;
      for (let c: SyntaxNode | null = node.firstChild; c; c = c.nextSibling) {
        if (PUNCT.has(c.name)) continue;
        if (i === idx) { found = c; break; }
        i++;
      }
      node = found;
    } else {
      return null;
    }
  }
  return node ? { from: node.from, to: node.to } : null;
}

// Precise JSON syntax errors.
const syntaxLinter = linter(jsonParseLinter());

// Render-request schema errors + invariant warnings, positioned via the syntax tree.
const schemaLinter = linter((view) => {
  const text = view.state.doc.toString();
  const result = validateRenderRequest(text);
  if (!result.jsonOk) return []; // syntax handled by syntaxLinter
  const docLen = view.state.doc.length;
  const diagnostics: Diagnostic[] = [];
  const issues = [
    ...result.issues,
    // Features the preview drops (unsupported motion, chroma_key) → warnings.
    ...collectPreviewIssues(result.value).map(
      (d) => ({ ...d, severity: "warning" as const }),
    ),
  ];
  for (const issue of issues) {
    if (!issue.path) continue;
    const range = locateJsonPath(view.state, issue.path) ?? { from: 0, to: Math.min(docLen, 1) };
    diagnostics.push({ from: range.from, to: range.to, severity: issue.severity, message: issue.message });
  }
  return diagnostics;
});

const extensions = [json(), syntaxLinter, schemaLinter, lintGutter(), EditorView.lineWrapping];

export default function JsonEditorImpl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={consoleTheme}
      height="100%"
      style={{ height: "100%", overflow: "auto" }}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
    />
  );
}
