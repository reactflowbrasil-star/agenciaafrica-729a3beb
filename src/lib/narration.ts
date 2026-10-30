/* Narration phrases; each word carries its start time (seconds) in the voice-over audio. */
// Reveal each word within its actual slot, including very short final words.
export function getNarrationFrame(time: number) {
  let phraseIndex = -1;
  NARRATION.forEach((phrase, index) => {
    if ((phrase[0]?.[1] ?? Infinity) <= time) phraseIndex = index;
  });
  const phrase = NARRATION[phraseIndex];
  if (!phrase) return { fullText: "", typed: 0 };

  let typed = 0;
  let offset = 0;
  phrase.forEach(([word, start], index) => {
    const next = phrase[index + 1]?.[1] ?? NARRATION[phraseIndex + 1]?.[0]?.[1] ?? start + 0.25;
    // Never impose a minimum duration: the closing sentence has 30ms slots.
    // Finish slightly before the next word, rather than trailing the voice.
    const duration = Math.max(0, (next - start) * 0.92);
    if (time >= start) {
      const progress = duration > 0 ? Math.min(1, (time - start) / duration) : 1;
      typed = offset + Math.ceil(word.length * progress);
    }
    offset += word.length + 1;
  });
  return { fullText: phrase.map(([word]) => word).join(" "), typed };
}

export const NARRATION: [string, number][][] = [[["Nascemos", 0.2], ["para", 0.96], ["desafiar", 1.25], ["a", 1.95], ["mesmice.", 2.07]], [["Ideias", 3.0], ["frescas,", 3.53], ["execuções", 4.59], ["corajosas,", 5.48]], [["onde", 6.64], ["a", 6.9], ["cultura", 6.98], ["encontra", 7.49], ["os", 7.92], ["negócios.", 8.05]], [["Inquietos", 9.37], ["por", 10.13], ["natureza,", 10.31], ["provocadores", 11.26], ["por", 12.21], ["vocação.", 12.4]], [["O", 13.35], ["olhar", 13.48], ["da", 13.91], ["experiência,", 14.08], ["a", 15.02], ["alma", 15.15], ["de", 15.48], ["um", 15.61], ["estagiário.", 15.77]], [["Ginga", 16.78], ["brasileira", 17.26], ["no", 17.94], ["peito,", 18.09], ["ambição", 18.86], ["global", 19.39], ["nos", 19.91], ["passos.", 20.08]], [["Um", 21.13], ["templo", 21.49], ["erguido", 22.22], ["para", 23.02], ["quem", 23.45], ["acredita", 23.89], ["no", 24.69], ["poder", 24.85], ["das", 25.27], ["ideias,", 25.53]], [["porque", 26.68], ["quem", 27.2], ["respeita", 27.49], ["a", 28.13], ["propaganda", 28.27], ["honra", 29.24], ["a", 29.36], ["sua", 29.39], ["história.", 29.49]], [["Muito", 29.8], ["prazer,", 29.92], ["somos", 30.14], ["a", 30.29], ["agência", 30.32], ["África.", 30.48]]];
