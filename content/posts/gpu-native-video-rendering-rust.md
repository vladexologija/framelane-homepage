---
title: I spent a year building a GPU-native video rendering engine in Rust after Remotion broke our production app. Here's what I learned.
date: 2026-06-04
author: Vlad Rill
excerpt: About a year ago we were building a multi-agent video editor. For the rendering layer we picked Remotion. It worked fine initially. But with more advanced usage the problems started stacking up.
---

About a year ago, at my previous job, we were building a multi-agent video editor. For the rendering layer we picked Remotion.

It worked fine initially. But with more advanced usage the problems started stacking up:

- GPU acceleration disabled in cloud environments
- Audio desync
- Colors weren't right
- Animations had jitter at anything above 1080p
- 4K was basically unusable

For basic short-form content it held up. For anything more complex — advanced animations, multi-layer compositing, 4K — users just churned. We lost real customers to it.

After some time I decided to stop patching and start over. The constraint was clear: no browser, no React, no Lambda. GPU-native from the start.

## The architecture I landed on

1. You send a JSON timeline to a message queue
2. A Rust service picks it up, pulls your assets, hands video to FFmpeg for hardware NVDEC decode
3. For each output frame, decoded clips + timeline logic flow into a wgpu-based GPU compositor
4. One pass: clips stacked, captions animated, colour grades applied
5. Finished frames go back through FFmpeg for encode, muxed with mixed audio, MP4 lands in storage

The part I'm most proud of: the exact same Rust compositor, compiled to WebAssembly and running on WebGPU, powers the live browser preview — so what you see while editing is identical to what renders on the server. (This is still blocked on a glyphon/cosmic-text issue I'm working through.)

## The learning curve was real

I'd done Rust before but GPU programming was new territory. LLMs weren't much help in the GPU-specific areas — I mostly had to figure things out myself or pay people who worked in C++/OpenGL and port it. Took longer than I expected. A lot of dead ends.

But I finally have something working.

Running on GCP L4: ~4 seconds to render a 10-second 4K video with captions, animations, and audio.

I'm still adding features — After Effects-style compositing is next — but the core pipeline is solid.

## What it can do today

- Timeline-based JSON API
- GPU shader effects (43 and counting)
- Glyph-level text animations
- Karaoke / word-timed captions
- Multi-layer compositing with z-ordering
- Background removal + text behind people
- LUT color grading
- 4K + HDR output
- MCP server for agent workflows
- WASM browser preview (coming)

I'm opening a small closed beta for teams building AI video products who are hitting the same Remotion/FFmpeg ceilings we did.

If that's you  please register and I'll onboard you personally.

Happy to answer questions about the architecture, the wgpu compositor, the WASM preview approach, or why I made specific technical decisions. Email should be in the footer section. 
