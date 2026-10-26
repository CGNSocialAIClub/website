import test from 'node:test';
import assert from 'node:assert/strict';
import {TITLE_LAYOUT,composeTitleLines,balanceTitleLines,fitTitleFont} from './titleLayout.mjs';

for(const kind of ['project','event']) {
  test(`${kind} titles keep one line composition as grid, preview and detail sizes change`,()=>{
    const base=TITLE_LAYOUT[kind];
    const measure=text=>text.length*base.fontSize*.52;
    for(const text of ['Shedding Light on Political Promises','Matching Requests to Medical Supplies','Ein gemeinsamer Blick auf unsere Projekte','AI4GOOD Hackathon – Africa Edition']) {
      const lines=composeTitleLines(text,measure,base.width);
      assert.equal(lines.join(' '),text);
      const original=[...lines];
      for(const [width,requested] of [[180,20],[240,30],[260,30],[580,56]]) {
        const size=fitTitleFont(lines,measure,base.fontSize,width,requested);
        assert.ok(lines.every(line=>measure(line)*size/base.fontSize<=width));
        assert.deepEqual(lines,original);
      }
    }
  });
}
test('a long unbreakable title word shrinks instead of overflowing or adding a transient line',()=>{
  const measure=text=>text.length*15;
  const lines=composeTitleLines('Grundwassersuche',measure,260);
  assert.equal(lines.length,1);
  const size=fitTitleFont(lines,measure,30,180,30);
  assert.ok(measure(lines[0])*size/30<=180);
});

test('a title fits throughout preview-to-detail interpolation without recomposing lines',()=>{
  for(const kind of ['project','event']){
    const base=TITLE_LAYOUT[kind],measure=text=>text.length*base.fontSize*.52;
    const lines=composeTitleLines('Testing AI for People and Real World Challenges',measure,base.width);
    const fromWidth=kind==='project'?260:180,toWidth=540;
    const from=fitTitleFont(lines,measure,base.fontSize,fromWidth,kind==='project'?30:20);
    const to=fitTitleFont(lines,measure,base.fontSize,toWidth,50);
    for(let step=0;step<=20;step++){
      const progress=step/20,width=fromWidth+(toWidth-fromWidth)*progress,size=from+(to-from)*progress;
      assert.ok(lines.every(line=>measure(line)*size/base.fontSize<=width));
    }
  }
});


test('scene titles balance over two lines while preserving every word',()=>{
  for(const text of ['Impendo: Automated Invoice Review','Allocura: Matching Requests to Medical Supplies']){
    const measure=value=>value.length*15;
    const lines=balanceTitleLines(text,measure);
    assert.equal(lines.length,2);
    assert.equal(lines.join(' '),text);
    for(const [width,size] of [[260,24],[600,50]]){
      const fitted=fitTitleFont(lines,measure,30,width,size);
      assert.ok(lines.every(line=>measure(line)*fitted/30<=width));
    }
  }
});
