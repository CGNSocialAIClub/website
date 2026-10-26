import {canRegister,hasEnded} from './eventUtils.js';

// One set of external destinations for overview, dialog and permanent article.
export function eventActionLinks(event,locale='en',now=Date.now(),includePast=false) {
  const de=locale==='de',ended=hasEnded(event,now);
  if(ended&&!includePast)return [];
  const links=[];
  if(event.eventUrl)links.push({key:'organizer',href:event.eventUrl,label:de?'Zur Veranstalterseite':'Visit event website',variant:'secondary',external:true});
  const registration=canRegister(event,now);
  const validLuma=/^https:\/\/(luma\.com|lu\.ma)\//.test(event.lumaUrl||'');
  if(validLuma&&(!ended||registration||!event.sourceUrl||event.lumaHasAdditionalInfo===true))links.push({
    key:'luma',href:event.lumaUrl,label:registration?(de?'Jetzt anmelden':'Register now'):(de?'Auf Luma ansehen':'View on Luma'),
    variant:'secondary',external:true,
  });
  if(includePast&&event.sourceUrl)links.push({key:'recap',href:event.sourceUrl,label:de?'Rückblick auf LinkedIn':'Recap on LinkedIn',variant:'secondary',external:true});
  return links;
}
