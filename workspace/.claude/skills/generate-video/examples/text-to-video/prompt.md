# Text-to-Video Demo: Ocean Waves

## Overview

Demonstrates text-to-video generation using Veo 3.1 with a detailed cinematic prompt covering all six prompt elements: subject, action, style, camera motion, composition, and audio cues.

## Prompt

```
Ocean waves crashing on dark volcanic rocks at golden hour, spray catches warm sunlight creating rainbow mist, low angle shot with camera slowly dollying forward, deep rumbling wave sounds with distant seagull calls
```

## Command

```bash
cd skills/generate-video && bun run scripts/generate.ts \
  "Ocean waves crashing on dark volcanic rocks at golden hour, spray catches warm sunlight creating rainbow mist, low angle shot with camera slowly dollying forward, deep rumbling wave sounds with distant seagull calls" \
  --duration 8 \
  --output ocean-waves.mp4
```

## Output

- `outputs/ocean-waves.mp4` - 8s video at 720p 16:9, 8.4MB
- Generation time: ~67s

## Key Takeaways

1. **Describe the scene cinematically** - Include subject, action, lighting, camera direction, and audio cues in the prompt
2. **Audio cues matter** - Veo 3.1 generates native audio; mentioning sounds in the prompt shapes the soundtrack
3. **Low angle + dolly** - Camera motion descriptions translate directly into video camera movement
4. **Golden hour lighting** - Time-of-day cues strongly influence color palette and mood
