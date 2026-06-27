#!/usr/bin/env bash
# Rebuild the FrameTake editor library and vendor it into the console.
#
# The editor lives in the sibling repo ../frametake-frontend and ships as a
# prebuilt ES-module bundle (Vite lib build). Next/Turbopack can't consume the
# raw source across the repo boundary (external-root + `#/` alias), so we vendor
# the built artifact into ./vendor (gitignored) and import it from there.
#
# Run this after pulling editor changes. Eventually this is replaced by an
# `@frametake/editor` npm dependency.
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
editor="${here}/../frametake-frontend"

echo "Building editor library in ${editor} ..."
(cd "${editor}" && npm run build:embed)

echo "Vendoring dist-embed → ${here}/vendor/frametake-editor ..."
rm -rf "${here}/vendor/frametake-editor"
mkdir -p "${here}/vendor"
cp -R "${editor}/dist-embed" "${here}/vendor/frametake-editor"

# The scene schema (createEmptyScene + types) is used by the console's own
# render-request mapper; vendor its built dist so Turbopack resolves it in-root
# (via the tsconfig path), same reason as the editor bundle.
echo "Vendoring @frametake/scene-schema → ${here}/vendor/scene-schema ..."
rm -rf "${here}/vendor/scene-schema"
cp -R "${editor}/../frametake-api/packages/scene-schema/dist" "${here}/vendor/scene-schema"

echo "Done."
