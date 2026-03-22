# Art Styles Demo: Pop Culture Styles

## Overview

Demonstrates the pop culture art style library with generate-image. Each image was generated using `--style` to apply a curated art style with prompt hints and tile reference images.

## Outputs

| Image | Style | Prompt |
|-------|-------|--------|
| `outputs/giger-cathedral.png` | H.R. Giger (`gigr`) | Gothic cathedral interior |
| `outputs/kusama-lion.png` | Yayoi Kusama (`kusm`) | Majestic lion portrait |
| `outputs/murakami-skull.png` | Takashi Murakami (`mrkm`) | Skull with flowers |
| `outputs/spiderverse-samurai.png` | Spider-Verse (`spdr`) | Samurai warrior |
| `outputs/stainedglass-wolf.png` | Stained Glass (`stgl`) | Wolf portrait |
| `outputs/wesanderson-hotel.png` | Wes Anderson (`wesa`) | Grand hotel lobby |
| `outputs/donkey-kong-ukiyoe.png` | Ukiyo-e (`ukiy`) | Donkey Kong in ukiyo-e style |

## Example Command

```bash
cd skills/generate-image && bun run scripts/generate.ts "majestic lion portrait" --style kusm --size 2K --output kusama-lion.png
```

## Key Takeaways

1. **Short codes work** - Use `kusm`, `gigr`, `ukiy` instead of full style IDs
2. **Style tile reference** - Each style has a reference tile image that gets sent to Gemini for visual adherence
3. **Prompt hints prepended** - The style's `promptHints` are automatically prepended to the user's prompt
