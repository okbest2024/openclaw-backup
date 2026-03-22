# Image-to-Video Demo: Kusama Lion

## Overview

Demonstrates image-to-video generation using an existing styled image as the starting frame. The Kusama-style lion (generated with `--style kusm` from the generate-image skill) is animated with subtle motion that preserves the art style.

## Input

- `inputs/kusama-lion.png` - Kusama-style polka dot lion generated with generate-image skill, center-cropped to **16:9** (critical: input image aspect ratio must match video aspect ratio to avoid pillarboxing)

## Prompt

```
The lion slowly turns its head to face the camera, colorful polka dots shimmer and pulse with light across its fur, soft breeze ruffles the golden mane
```

## Command

```bash
cd skills/generate-video && bun run scripts/generate.ts \
  "The lion slowly turns its head to face the camera, colorful polka dots shimmer and pulse with light across its fur, soft breeze ruffles the golden mane" \
  --input inputs/kusama-lion.png \
  --duration 8 \
  --output kusama-lion.mp4
```

## Output

- `outputs/kusama-lion.mp4` - 8s video at 720p 16:9, 7.7MB
- Generation time: ~67s

## Key Takeaways

1. **Describe the motion, not the image** - The starting frame provides visuals; the prompt describes what happens next
2. **Describe style visually, avoid artist names** - "colorful polka dots shimmer" works; artist names may trigger content filters
3. **Start with subtle motion** - "slowly turns" and "soft breeze" produce more natural results than dramatic transformations
4. **Two-step pipeline** - Generate a styled image first with generate-image, then animate with generate-video for maximum creative control
