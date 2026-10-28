# Top 5 Europeus — forças especiais

Vídeo do canal editado em Remotion + GSAP, no estilo da referência `21.mp4`: colagem recortada sobre papel, serifa itálica Didone + sans em caixa alta sincronizadas palavra a palavra com a narração, retícula, RGB split, scanlines, grão e poeira por cima de tudo.

- **Intro** — 87,9 s. Composição `Intro`.
- **Part1** — nº 5 KSK (Alemanha), 3:41
- **Part2** — nº 4 JW GROM (Polônia), 3:32
- **Part3** — nº 3 1er RPIMa (França), 3:47
- **Part4** — nº 2 SBS (Reino Unido), 3:10
- **Part5** — nº 1 SAS (Reino Unido), 3:46

Todas em 1920×1080, 30 fps.

## Render na nuvem (GitHub Actions)

Todo push em `main` que mexe em `src/`, `public/` ou nas dependências roda o workflow **Render** para as composições listadas em `production/render-targets.txt` (uma por linha, em paralelo). Cada uma gera:

- `<ID>_1080p.mp4` — master H.264 CRF 18, áudio a -14 LUFS
- `<ID>_720p_preview.mp4` — prévia leve

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
| `src/intro/scenes.tsx` | As 36 cenas da intro, escritas à mão |
| `src/parts/part*.ts` | Cenas das partes 1–5 como dados: frase-gatilho da narração + mídia + textos |
| `src/parts/engine.tsx` | Motor que resolve os tempos pela transcrição, monta as cenas e gera os SFX |
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
