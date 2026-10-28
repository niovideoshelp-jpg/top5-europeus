// Localiza frases da narração na transcrição (tempo por palavra) para posicionar cortes e textos.
export type TWord = { text: string; start: number; end: number };

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'%]/g, "")
    .replace(/^'+|'+$/g, "");

const tokens = (phrase: string) => phrase.split(/\s+/).map(norm).filter(Boolean);

// Índice da primeira palavra da frase, procurando a partir de `from`.
export const findPhrase = (words: TWord[], phrase: string, from = 0): number => {
  const tk = tokens(phrase);
  for (let i = Math.max(0, from); i <= words.length - tk.length; i++) {
    let ok = true;
    for (let k = 0; k < tk.length; k++) {
      if (norm(words[i + k].text) !== tk[k]) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  throw new Error(`Frase não encontrada na narração (a partir de ${words[from]?.start ?? "?"}s): "${phrase}"`);
};

export const indexAt = (words: TWord[], t: number) => {
  const i = words.findIndex((w) => w.start >= t - 0.001);
  return i < 0 ? words.length : i;
};

// Palavras de uma frase (com o texto como foi transcrito).
export const phraseWords = (words: TWord[], phrase: string, fromTime: number): TWord[] => {
  const i = findPhrase(words, phrase, indexAt(words, fromTime));
  return words.slice(i, i + tokens(phrase).length);
};

// Texto limpo para exibir: usa a grafia da frase pedida, mantendo pontuação final da transcrição.
export const displayText = (phrase: string, ws: TWord[]) => {
  const last = ws[ws.length - 1]?.text ?? "";
  const punct = /[.,?!]$/.test(last) && !/[.,?!]$/.test(phrase) ? last.slice(-1) : "";
  return phrase + punct;
};
