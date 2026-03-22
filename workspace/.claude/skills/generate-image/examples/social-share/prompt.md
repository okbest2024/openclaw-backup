# Social Share Image Demo: OG Image from Source

## Overview

Demonstrates generating a social share / Open Graph image from an existing hero image using
the generate-image skill with img2img, then cropping to exact OG dimensions and optimizing
for web delivery.

## Step 1: Generate at 16:9

Use the source image as a reference and generate at 16:9 aspect ratio with center-weighted
prompting to ensure important content survives the crop. Generate at **2K** for retina-ready output.

### Input

- `inputs/hero.png` - The project's existing hero image

### Prompt

```
A vibrant hero banner for Gemini Skills plugin showcasing AI image generation with art
styles. Modern tech aesthetic with colorful style tile grid in background, clean typography
area at center. Professional, eye-catching, optimized for center crop to social share
format. CENTER all important elements, no content near edges.
```

### Command

```bash
cd skills/generate-image && bun run scripts/generate.ts \
  "A vibrant hero banner for Gemini Skills plugin showcasing AI image generation with art styles. Modern tech aesthetic with colorful style tile grid in background, clean typography area at center. Professional, eye-catching, optimized for center crop to social share format. CENTER all important elements, no content near edges." \
  --input hero.png \
  --aspect 16:9 --size 2K \
  --output social-share.png
```

## Step 2: Crop to OG Dimensions

Crop to exact 1200x630 Open Graph dimensions using `sips`:

```bash
sips -z 630 1200 -c 630 1200 social-share.png --out social-share-og.png
```

## Step 3: Optimize for Web Delivery

Convert to JPEG at 85% quality. Social share images don't need PNG transparency, and JPEG
produces dramatically smaller files:

```bash
sips -s format jpeg -s formatOptions 85 social-share-og.png --out social-share-og.jpg
# 1.2MB PNG -> 289KB JPEG (77% reduction)
```

### Verify

```bash
sips -g pixelWidth -g pixelHeight social-share-og.jpg
# pixelWidth: 1200
# pixelHeight: 630

ls -la social-share-og.jpg
# 289KB - well under 500KB target
```

### Output

- `outputs/social-share-og.jpg` - Final optimized OG image at 1200x630, 289KB

## Key Takeaways

1. **Generate wider, crop tighter** - Always generate at 16:9 then crop to exact social
   media dimensions rather than trying to generate at exact pixel sizes
2. **Center-weighted prompting** - Include "CENTER all important elements" in every social
   media prompt since edges get cropped
3. **Always optimize** - Convert to JPEG at 85% for social images. 77% file size reduction
   with no visible quality loss
4. **Use img2img** - Starting from an existing brand image via `--input` produces more
   cohesive results than generating from scratch
5. **Verify everything** - Confirm dimensions with `sips -g` and file size before publishing

## Common Social Dimensions

| Platform | Dimensions | Aspect | Target File Size |
|----------|-----------|--------|-----------------|
| Open Graph (Facebook, LinkedIn, WhatsApp) | 1200x630 | ~16:9 | <500KB |
| Twitter Card | 1200x628 | ~16:9 | <500KB |
| Instagram Feed | 1080x1080 | 1:1 | <500KB |
| Instagram Story | 1080x1920 | 9:16 | <500KB |
