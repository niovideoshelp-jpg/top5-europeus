#!/usr/bin/env bash
# Monta folhas 5x4 com os quadros de conferência de uma pasta. Uso: sheets.sh <pasta> <prefixo-saida>
DIR="$1"; OUT="$2"; F="fontfile='C\:/Windows/Fonts/arial.ttf'"
mapfile -t files < <(ls "$DIR"/f_*.jpg | sort -t_ -k2 -g)
total=${#files[@]}; n=0; s=0
while [ $n -lt $total ]; do
  args=""; filt=""; lay=""
  for j in $(seq 0 19); do
    idx=$((n+j)); x=$(( (j%5)*384 )); y=$(( (j/5)*216 )); lay="$lay${x}_${y}|"
    if [ $idx -lt $total ]; then f=${files[$idx]}; lab=$(basename "$f" .jpg); lab=${lab#f_}; args="$args -i $f"; filt="$filt[$j]scale=384:216,drawtext=$F:text='$((idx+1)) $lab':x=4:y=4:fontsize=16:fontcolor=yellow:box=1:boxcolor=black[v$j];"
    else args="$args -f lavfi -i color=black:s=384x216:d=1"; filt="$filt[$j]null[v$j];"; fi
  done
  ins=""; for j in $(seq 0 19); do ins="$ins[v$j]"; done
  ffmpeg -nostdin -hide_banner -loglevel error -y $args -filter_complex "${filt}${ins}xstack=inputs=20:layout=${lay%|}" -frames:v 1 "${OUT}_$s.jpg"
  n=$((n+20)); s=$((s+1))
done
