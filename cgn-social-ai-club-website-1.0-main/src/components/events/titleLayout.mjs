// A title is composed once. Card state changes its size, never its words/lines.
export const TITLE_LAYOUT = Object.freeze({
  event: { fontSize:26, width:224 },
  project: { fontSize:30, width:260 },
});
export function composeTitleLines(text, measure, width) {
  const lines=[];let line='';
  for(const word of text.match(/AI4GOOD\s+Hackathon|\S+/g)||[]) {
    const candidate=line?`${line} ${word}`:word;
    if(line && measure(candidate)>width){lines.push(line);line=word;}else line=candidate;
  }
  if(line)lines.push(line);
  return lines;
}
export function fitTitleFont(lines, measureAtBaseSize, baseSize, width, requestedSize) {
  const longest=Math.max(1,...lines.map(measureAtBaseSize));
  return Math.min(requestedSize, Math.floor(baseSize*Math.max(1,width)/longest));
}


export function balanceTitleLines(text,measure) {
  const words=text.trim().split(/\s+/);
  if(words.length<2)return words;
  let best=[text],bestWidth=Infinity;
  for(let i=1;i<words.length;i++){
    const lines=[words.slice(0,i).join(' '),words.slice(i).join(' ')];
    const width=Math.max(...lines.map(measure));
    if(width<bestWidth){best=lines;bestWidth=width;}
  }
  return best;
}
