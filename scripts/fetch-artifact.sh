#!/usr/bin/env bash
# Baixa um artefato do Actions em N pedaços paralelos. Uso: fetch-artifact.sh <archive_download_url> <saida.zip> [N]
URL="$1"; OUT="$2"; N="${3:-8}"
TOKEN=$(printf 'protocol=https\nhost=github.com\nusername=niovideoshelp-jpg\n\n' | GIT_TERMINAL_PROMPT=0 git credential fill 2>/dev/null | sed -n 's/^password=//p')
R=$(curl -s -o /dev/null -w "%{redirect_url}" -H "Authorization: Bearer $TOKEN" "$URL")
SIZE=$(curl -s -I "$R" | tr -d '\r' | awk 'tolower($1)=="content-length:"{print $2}')
CH=$(( (SIZE + N - 1) / N ))
for i in $(seq 0 $((N-1))); do
  s=$((i*CH)); e=$(( s + CH - 1 )); [ $e -ge $SIZE ] && e=$((SIZE-1))
  curl -s --retry 5 -r $s-$e -o "$OUT.part$i" "$R" &
done
wait
: > "$OUT"; for i in $(seq 0 $((N-1))); do cat "$OUT.part$i" >> "$OUT"; rm -f "$OUT.part$i"; done
[ "$(stat -c %s "$OUT")" = "$SIZE" ] && echo "ok $OUT $SIZE" || echo "TAMANHO ERRADO $OUT"
