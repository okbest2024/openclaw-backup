# Auto-Image Pipeline Demo: Impressionist Mountain

## Overview

Demonstrates the full `--auto-image` pipeline: a single command that generates a styled starting frame using Nano Banana Pro, then animates it with Veo 3.1. The `--style impr` flag applies Impressionism style to both the image and video prompt.

## Prompt

```
A mountain landscape comes alive with wind sweeping through the valley, clouds drift across peaks, wildflowers sway gently
```

## Command

```bash
cd skills/generate-video && bun run scripts/generate.ts \
  "A mountain landscape comes alive with wind sweeping through the valley, clouds drift across peaks, wildflowers sway gently" \
  --style impr \
  --auto-image \
  --output impressionist-mountain.mp4
```

## What Happens

1. **Style applied**: Impressionism promptHints prepended to prompt
2. **Auto-image generated**: Nano Banana Pro generates a styled 1K starting frame with the Impressionism tile as visual reference
3. **Video generated**: Veo 3.1 animates the starting frame using the styled prompt

## Output

- `outputs/auto-frame.png` - Auto-generated Impressionist starting frame (1.9MB)
- `outputs/impressionist-mountain.mp4` - 8s video at 720p 16:9, 4.4MB
- Generation time: ~52s (image + video)

## Key Takeaways

1. **One command, full pipeline** - `--auto-image` eliminates the manual two-step process
2. **Style consistency** - The same `--style` flag influences both the starting frame and the video generation prompt
3. **169 styles available** - Any style from the library works: `--style cybr`, `--style ukiy`, `--style ghbl`, etc.
4. **Starting frame preserved** - The auto-generated PNG is saved for reference and can be reused
