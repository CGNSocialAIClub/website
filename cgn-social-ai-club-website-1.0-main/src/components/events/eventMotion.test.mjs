import test from 'node:test';
import assert from 'node:assert/strict';
import { eventScene, slotGeometry, centeredCardScroll, arrowGeometry, cardParts, ringSlot, sheetRelease, repeatedCarouselSlots } from './eventMotion.mjs';

test('mobile return centres the whole card from visible and distant positions',()=>{
  for(const scrollY of [0,1200,4800])for(const cardTop of [-2500,-80,180,700,3000]){
    const cardHeight=580,viewportHeight=844,maxScroll=8000;
    const destination=centeredCardScroll({scrollY,cardTop,cardHeight,viewportHeight,maxScroll});
    const centreAfter=cardTop-(destination-scrollY)+cardHeight/2;
    if(destination>0&&destination<maxScroll)assert.equal(centreAfter,viewportHeight/2);
    assert.ok(destination>=0&&destination<=maxScroll);
  }
});

test('scaled mobile side previews and the picker have equal visible gaps, including safe areas',()=>{
  for(const projectArticle of [false,true])for(const pickerBottom of [18,34]){
    const scene=eventScene({width:1000,height:900,expanded:true,projectArticle,pickerHeight:74,pickerBottom});
    const verticalGap=900-pickerBottom-74-scene.main.y-scene.main.height;
    for(const dir of [-1,1]){
      const side=scene.side(dir),inset=side.width*(1-side.scale)/2;
      const horizontalGap=dir>0?side.x+inset-scene.main.x-scene.main.width:scene.main.x-side.x-side.width+inset;
      assert.ok(Math.abs(horizontalGap-verticalGap)<.001);
    }
  }
  for(const width of [320,393,430])assert.equal(eventScene({width,height:844}).fixedEventSize,true);
});

test('desktop center and both neighbours share one horizontal axis at laptop and wide sizes', () => {
  for (const width of [768, 1024, 1366, 1512, 1920, 2560]) for (const height of [600, 900, 1200]) {
    const scene = eventScene({width,height});
    assert.equal(scene.main.x + scene.main.width / 2, width / 2);
    for (const slot of [-1,0,1]) {
      const card = slotGeometry(scene, slot);
      assert.equal(card.y + card.height / 2, scene.centerY);
    }
    assert.ok(scene.main.y >= 112);
    assert.ok(scene.main.y + scene.main.height <= height - 12);
  }
});
test('arrows stay at the middle of the moving gap, including hover', () => {
  for (const hover of [-1,0,1]) for (const dir of [-1,1]) {
    const scene = eventScene({width:1512,height:982,hover});
    const arrow = arrowGeometry(scene,dir).x + 22;
    const side = scene.side(dir), main = scene.main, growth=side.width*(side.scale-1)/2;
    assert.equal(arrow, dir < 0 ? (side.x + side.width + growth + main.x)/2 : (main.x+main.width+side.x-growth)/2);
    assert.ok(dir<0 ? arrow+22 < main.x : arrow-22 > main.x+main.width);
  }
});
test('a next step takes right to centre and centre to left, including the wrap', () => {
  for (let selected=0;selected<8;selected++) {
    const next=(selected+1)%8;
    assert.equal(ringSlot(next,selected,8),1);
    assert.equal(ringSlot(next,next,8),0);
    assert.equal(ringSlot(selected,next,8),-1);
    const prev=(selected+7)%8;
    assert.equal(ringSlot(prev,selected,8,-1),-1);
    assert.equal(ringSlot(selected,prev,8,-1),1);
  }
});
test('mobile expansion changes height and top, keeping bottom and width fixed', () => {
  for (const width of [320,390,430]) for (const height of [640,844,1200]) {
    const a=eventScene({width,height}),b=eventScene({width,height,expanded:true});
    assert.equal(a.main.width,width-32);
    assert.equal(a.main.y+a.main.height,b.main.y+b.main.height);
    assert.ok(b.main.y<=a.main.y);
    assert.ok(b.main.y>=112);
  }
});
test('cover interpolation never changes its square aspect', () => {
  const s=eventScene({width:1512,height:982});
  const a=cardParts(s.main,false,true).cover,b=cardParts(s.side(1),false,false).cover;
  for(let t=0;t<=1;t+=.05) assert.equal(a.width+(b.width-a.width)*t,a.height+(b.height-a.height)*t);
});
test('mobile dismiss closes directly from either height and cancelled gestures restore', () => {
  assert.equal(sheetRelease({expanded:true,distance:100}),'close');
  assert.equal(sheetRelease({expanded:false,distance:100}),'close');
  assert.equal(sheetRelease({expanded:false,distance:30}),'restore');
  assert.equal(sheetRelease({expanded:false,distance:120,cancelled:true}),'restore');
});

test('mobile neighbours are identical in size and travel horizontally with a gap', () => {
  const scene=eventScene({width:393,height:852,expanded:true});
  for(const slot of [-1,1]) {
    const side=slotGeometry(scene,slot);
    assert.equal(side.width,Math.min(380,scene.main.width));assert.equal(side.height,scene.main.height);assert.equal(side.y,scene.main.y);
    assert.equal(Math.abs(side.x-scene.main.x),(slot<0?side.width:scene.main.width)+scene.gap);
  }
});
test('hover uniformly scales a preview without changing its layout or text width', () => {
  const normal=eventScene({width:1512,height:982}).side(1);
  const hover=eventScene({width:1512,height:982,hover:1}).side(1);
  assert.equal(normal.width,hover.width);assert.equal(normal.height,hover.height);
  assert.equal(hover.scale,1.02);
  assert.deepEqual(cardParts(normal,false,false),cardParts(hover,false,false));
});

test('a three-item carousel repeats beyond its ends without sending the exiting copy back across the centre',async()=>{
 const {repeatedCarouselSlots}=await import('./eventMotion.mjs');
 for(const position of [-4,-1,0,1,4]){
  const before=repeatedCarouselSlots(3,0,position);
  const after=repeatedCarouselSlots(3,0,position+1);
  const active=before.find(item=>item.slot===0);
  const outgoing=after.find(item=>item.ordinal===active.ordinal);
  assert.equal(outgoing.slot,-1);
  const incoming=before.find(item=>item.slot===1);
  assert.equal(after.find(item=>item.ordinal===incoming.ordinal).slot,0);
  assert.equal(after.find(item=>item.slot===1).index,before.find(item=>item.slot===-1).index);
  assert.notEqual(after.find(item=>item.slot===1).ordinal,before.find(item=>item.slot===-1).ordinal);
 }
});

test('compact article layout is used until both desktop previews have usable space',()=>{
 assert.equal(eventScene({width:1279,height:900}).mobile,true);
 const desktop=eventScene({width:1280,height:900});
 assert.equal(desktop.mobile,false);
 assert.ok(desktop.width-desktop.side(1).x>=80);
 assert.ok(eventScene({width:1100,height:900}).main.width<=520);
});

test('mobile event title uses the full header width while cover geometry remains available for fading', () => {
  for (const width of [320,393,520]) {
    const scene=eventScene({width,height:852,top:48,expanded:true});
    const parts=cardParts(scene.main,true,true,false);
    assert.equal(parts.cover.width,parts.cover.height);
    assert.deepEqual(parts.cover,cardParts(scene.main,true,false).cover);
    assert.equal(parts.info.x,24);
    assert.equal(parts.info.width,scene.main.width-48);
    assert.equal(parts.info.y,24);
    const project=cardParts(scene.main,true,true,true);
    assert.ok(project.info.y>project.cover.y+project.cover.height);
  }
});


test('with visible previews swiping shrinks the main card and grows the approaching preview', async () => {
  const {swipeCardScale}=await import('./eventMotion.mjs');
  const scene=eventScene({width:1000,height:852});
  const stride=scene.main.width+scene.gap;
  assert.equal(swipeCardScale(scene,0,0),1);
  assert.ok(swipeCardScale(scene,0,-10)<1);
  assert.ok(swipeCardScale(scene,1,-10)>scene.side(1).scale);
  assert.equal(swipeCardScale(scene,0,-stride),scene.side(1).scale);
  assert.equal(swipeCardScale(scene,1,-stride),1);
  assert.equal(swipeCardScale(scene,0,-80),swipeCardScale(scene,0,80));
  assert.equal(swipeCardScale(scene,-1,stride),1);
});

test('mobile neighbours fold into cover and metadata layouts for both article kinds', () => {
  const scene=eventScene({width:983,height:853,expanded:true});
  for(const project of [false,true]) {
    const preview=cardParts(scene.side(1),true,false,project);
    assert.ok(preview.info.x<=preview.cover.x);
    assert.ok(preview.info.y>preview.cover.y+preview.cover.height);
    if(project)assert.equal(preview.fontSize,30);
    else assert.ok(preview.fontSize<=26);
  }
});


test('looping event tracks replace outer copies instead of moving them across the centre', () => {
  for(const count of [3,8,10]) for(const position of [-11,-1,0,1,11]) for(const step of [-1,1]) {
    const before=repeatedCarouselSlots(count,0,position);
    const after=repeatedCarouselSlots(count,0,position+step);
    for(const card of before) {
      const retained=after.find(next=>next.ordinal===card.ordinal);
      if(retained) {
        assert.equal(retained.index,card.index);
        assert.equal(retained.slot,card.slot-step);
      }
    }
    const entering=after.filter(card=>!before.some(old=>old.ordinal===card.ordinal));
    assert.equal(entering.length,1);
    assert.equal(entering[0].slot,step*3);
  }
});

 test('offscreen event neighbours retain the reading size throughout a swipe', async () => {
  const {swipeCardScale}=await import('./eventMotion.mjs');
  for (const width of [320,393,430,600]) {
    const scene=eventScene({width,height:852,expanded:true});
    assert.equal(scene.fixedEventSize,true);
    for (const slot of [-1,0,1]) {
      const card=slotGeometry(scene,slot);
      assert.equal(card.width,scene.main.width);
      assert.equal(card.height,scene.main.height);
      assert.equal(card.y,scene.main.y);
      for(const drag of [-100,0,100])assert.equal(swipeCardScale(scene,slot,drag),1);
    }
  }
  assert.equal(eventScene({width:1000,height:852}).fixedEventSize,false);
  assert.equal(eventScene({width:393,height:852,projectArticle:true}).fixedEventSize,true);
});


test('project navigation arrows clear both card edges even when a preview is hovered', () => {
  for (const width of [1280,1366,1512,1920]) for (const hover of [-1,0,1]) for (const dir of [-1,1]) {
    const scene=eventScene({width,height:900,projectArticle:true,hover});
    const arrow=arrowGeometry(scene,dir), side=scene.side(dir);
    const growth=side.width*(side.scale-1)/2;
    if(dir<0){assert.ok(arrow.x>side.x+side.width+growth);assert.ok(arrow.x+44<scene.main.x);}
    else {assert.ok(arrow.x>scene.main.x+scene.main.width);assert.ok(arrow.x+44<side.x-growth);}
  }
});


test('swipe release uses velocity, supports reversal and restores cancelled drags', async () => {
 const {articleSwipeRelease}=await import('./eventMotion.mjs');
 assert.equal(articleSwipeRelease({distance:-30,velocity:-.7,width:393}).step,1);
 assert.equal(articleSwipeRelease({distance:-30,velocity:0,width:393}).step,0);
 assert.equal(articleSwipeRelease({distance:140,velocity:0,width:393}).step,-1);
 assert.equal(articleSwipeRelease({distance:-140,velocity:1.5,width:393}).step,-1);
 assert.equal(articleSwipeRelease({distance:-140,velocity:-1,width:393,cancelled:true}).step,0);
 assert.equal(articleSwipeRelease({distance:-3,velocity:-1,width:393}).step,0);
});

test('phone project neighbours keep the same complete article geometry', () => {
 for(const width of [320,393,430]) {
  const scene=eventScene({width,height:852,expanded:true,projectArticle:true});
  assert.equal(scene.fixedEventSize,true);
  for(const slot of [-1,1]) {
   const neighbour=slotGeometry(scene,slot);
   assert.equal(neighbour.width,scene.main.width);
   assert.equal(neighbour.height,scene.main.height);
   assert.deepEqual(cardParts(neighbour,true,true,true),cardParts(scene.main,true,true,true));
  }
 }
});


test('desktop event preview typography fits its fixed line composition in the available width', () => {
  for(const width of [1280,1440,1920,2560]){
    const scene=eventScene({width,height:900});
    const preview=cardParts(scene.side(1),false,false);
    const article=cardParts(scene.main,false,true);
    // A line composed at 26px / 224px must fit the smaller preview unchanged.
    assert.ok(224 * preview.fontSize / 26 <= preview.info.width);
    assert.ok(preview.fontSize < article.fontSize);
  }
});

test('desktop project previews keep member scale equal to detail even on hover',()=>{
 const scene=eventScene({width:1512,height:982,projectArticle:true,hover:1});
 assert.equal(scene.main.scale,1);
 assert.equal(scene.side(1).scale,1);
 assert.equal(scene.side(-1).scale,1);
});
