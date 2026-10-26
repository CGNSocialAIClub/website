import test from 'node:test';
import assert from 'node:assert/strict';
import {eventActionLinks} from './eventActions.mjs';
const now=Date.parse('2026-10-21T08:00:00Z');
const upcoming={audience:'public',registrationOpen:true,start:'2026-10-23T18:00:00+02:00',end:'2026-10-23T19:30:00+02:00',lumaUrl:'https://luma.com/0kiho1sg'};

test('upcoming registration has the same destination and label in grid and article, in both languages',()=>{
  for(const locale of ['en','de']){
    const grid=eventActionLinks(upcoming,locale,now),article=eventActionLinks(upcoming,locale,now,true);
    assert.deepEqual(grid,article);
    assert.equal(grid[0].href,upcoming.lumaUrl);
    assert.equal(grid[0].label,locale==='de'?'Jetzt anmelden':'Register now');
    assert.equal(grid[0].external,true);
  }
});
test('free entry organiser events retain their information button without inventing registration',()=>{
  const event={...upcoming,lumaUrl:undefined,registrationOpen:false,eventUrl:'https://www.tum.de/example'};
  const links=eventActionLinks(event,'en',now,true);
  assert.equal(links.length,1);assert.equal(links[0].href,event.eventUrl);assert.equal(links[0].label,'Visit event website');
  assert.equal(links[0].external,true);
});
test('closed or ended registrations use a view action even if an old registration flag is true',()=>{
  assert.equal(eventActionLinks({...upcoming,registrationOpen:false},'en',now,true)[0].label,'View on Luma');
  const after=Date.parse('2026-10-24T08:00:00Z');
  assert.equal(eventActionLinks(upcoming,'en',after).length,0);
  assert.equal(eventActionLinks(upcoming,'en',after,true)[0].label,'View on Luma');
});
test('past recaps keep the source action and suppress a redundant Luma link',()=>{
  const event={...upcoming,end:'2026-10-20T19:30:00+02:00',sourceUrl:'https://www.linkedin.com/example'};
  assert.deepEqual(eventActionLinks(event,'en',now,true).map(link=>link.key),['recap']);
  assert.deepEqual(eventActionLinks({...event,lumaHasAdditionalInfo:true},'en',now,true).map(link=>link.key),['luma','recap']);
});
