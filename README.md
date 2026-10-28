# Top 5 Europeus — forças especiais

Vídeo do canal editado em Remotion + GSAP, no estilo da referência `21.mp4`: colagem recortada sobre papel, serifa itálica Didone + sans em caixa alta sincronizadas palavra a palavra com a narração, retícula, RGB split, scanlines, grão e poeira por cima de tudo.

- **Intro** — 87,9 s, 1920×1080, 30 fps. Composição `Intro`.

## Render na nuvem (GitHub Actions)

Todo push em `main` que mexe em `src/`, `public/` ou nas dependências roda o workflow **Render**. Ele gera:

- `Intro_1080p.mp4` — master H.264 CRF 18, áudio 320 kbps
- `Intro_720p_preview.mp4` — prévia leve

Baixe em **Actions → Render → (execução) → Artifacts**. Os arquivos ficam 14 dias. Para renderizar sem mudar nada: **Actions → Render → Run workflow**.

## Rodar localmente

```sh
npm ci
npm run dev                      # Remotion Studio
node scripts/stills.mjs out/stills 3.2 26.6 76.9   # quadros de conferência
```

## Estrutura

| Caminho | O quê |
|---|---|
| `src/intro/scenes.tsx` | As 36 cenas, cada uma com os tempos das palavras da narração |
| `src/intro/sfx.ts` | Trilha de efeitos: cada som é posicionado pelo seu pico |
| `src/components/Texture.tsx` | Camada global (grão, poeira/riscos em canvas, scanlines, vinheta, flicker) e retícula |
| `src/components/Text.tsx` | Letra que "cai", máquina de escrever com seleção, palavra por vez, frase que escurece |
| `src/components/Graphics.tsx` | Tira de papel rasgado, contador rolante, tags de interface, anéis de radar |
| `src/components/Extras.tsx` | Mapa-múndi, rabisco à mão, cursor, card de vídeo, balão, ficha, carimbo |
| `src/lib/gsap.ts` | Timeline GSAP pausada e avançada pelo frame do Remotion |
| `production/intro-captions.json` | Transcrição com tempo por token (Whisper small, local) |
| `production/decupagem-intro.md` | Decupagem plano a plano |
| `ASSETS.md` | Fonte, autor e licença de cada mídia |

## Scripts de produção

- `scripts/transcribe.mjs` — transcreve a narração com whisper.cpp
- `scripts/commons.mjs` — busca/baixa mídia do Wikimedia Commons e registra o crédito
- `scripts/freesound.mjs` — busca/baixa SFX CC0 do Freesound e registra o crédito
- `scripts/build-world.mjs` — gera os caminhos do mapa a partir do Natural Earth
