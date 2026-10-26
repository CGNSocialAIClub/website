import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import useArticleTopInset from '../../hooks/useArticleTopInset';
import EventCard from './EventCard';
import EventSceneCard from './EventSceneCard';
import { EVENT_MOTION, ARTICLE_DESKTOP_MIN_WIDTH, eventScene, slotGeometry, centeredCardScroll, arrowGeometry, ringSlot, sheetRelease, mobileSheetRelease, wrap, repeatedCarouselSlots, swipeCardScale, mobileEventTimeline, articleSwipeRelease } from './eventMotion.mjs';
import './EventScene.css';

function sourceSnapshot(id) {
  const source = document.querySelector(`#root [data-event-id="${id}"][data-card-state="grid"]`) || document.querySelector(`#root [data-event-id="${id}"][data-card-state="calendar"]`);
  if (!source) return null;
  const rect = source.getBoundingClientRect();
  const image = source.querySelector('[data-event-part="cover"]');
  const title = source.querySelector('[data-event-part="title"]');
  if (!image || !title) return null;
  const cover = image.getBoundingClientRect(), info=title.getBoundingClientRect();
  const date=source.querySelector('[data-event-part="date"]'),location=source.querySelector('.event-location');
  const metadata=date&&location?{
    fontSize:parseFloat(getComputedStyle(date).fontSize),
    iconSize:date.querySelector('svg')?.getBoundingClientRect().width || 14,
    lineHeight:parseFloat(getComputedStyle(date).lineHeight),
    gap:parseFloat(getComputedStyle(date).gap),
    marginTop:date.getBoundingClientRect().top-info.bottom,
    dateHeight:date.getBoundingClientRect().height,
    locationHeight:location.getBoundingClientRect().height,
  }:undefined;
  return {
    element:source,
    frame:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1},
    parts:{metadata,surfaceShadow:getComputedStyle(source).boxShadow,cover:{x:cover.x-rect.x,y:cover.y-rect.y,width:cover.width,height:cover.height,borderRadius:getComputedStyle(image).borderRadius},info:{x:info.x-rect.x,y:info.y-rect.y,width:info.width},titleHeight:info.height,fontSize:parseFloat(getComputedStyle(title).fontSize),headerHeight:cover.bottom-rect.top},
  };
}

export default function EventDetails({event,events=[],onNavigate,onClose:onDismiss,now}) {
  const {locale}=useLocale(),de=locale==='de';
  const reduceMotion=useReducedMotion();
  const topInset=useArticleTopInset();
  const [viewport,setViewport]=useState(()=>({width:window.innerWidth,height:window.innerHeight}));
  const [pickerMetrics,setPickerMetrics]=useState({height:74,bottom:18});
  const [phase,setPhase]=useState('opening');
  const [closeRequested,setCloseRequested]=useState(false);
  const [returnArrived,setReturnArrived]=useState(false);
  const returnHandled=useRef(false);
  const [openingReady,setOpeningReady]=useState(false);
  const [articleReady,setArticleReady]=useState(false);
  const [veilReady,setVeilReady]=useState(false);
  const markArticleReady=useCallback(()=>{setArticleReady(true);document.querySelectorAll('[data-article-opening-source]').forEach(node=>node.removeAttribute('data-article-opening-source'));},[]);
  const [expanded,setExpanded]=useState(()=>window.innerWidth < ARTICLE_DESKTOP_MIN_WIDTH);
  const [hover,setHover]=useState(0);
  const [pendingEventId,setPendingEventId]=useState(null);
  const [switchStage,setSwitchStage]=useState('idle');
  const [direction,setDirection]=useState(1);
  const [carouselPosition,setCarouselPosition]=useState(0);
  const [drag,setDrag]=useState({x:0,y:0});
  const gestureEnd=useRef(null);
  const navigation=useRef(null);
  const selectedId=useRef(event.id);
  selectedId.current=event.id;
  const [touching,setTouching]=useState(false);
  const [swipeSnap,setSwipeSnap]=useState(null);
  const [pickerSwitching,setPickerSwitching]=useState(false);
  const [content,setContent]=useState(null);
  const initialId=useRef(event.id);
  const origin=useRef(undefined);
  if(origin.current===undefined)origin.current=sourceSnapshot(event.id);
  const [returnTo,setReturnTo]=useState(null);
  const [returnFrom,setReturnFrom]=useState(null);
  const surface=useRef(null),backdrop=useRef(null),picker=useRef(null),gesture=useRef(null),busy=useRef(false);
  const returnMask=useRef(null),returnMaskAnimation=useRef(null);
  const wheelGesture=useRef({last:0,distance:0,atTop:false});
  const handlePointer=useRef(null),suppressHandleClick=useRef(false);
  const expansionUntil=useRef(0);
  const articleSwipeWheel=useRef({last:0,distance:0,latched:false});
  const pickerInitialized=useRef(false);
  const pickerAnimating=useRef(false);
  const pickerInput=useRef({lastWheel:0,latched:false,delta:0,touch:null});
  const closeStarted=useRef(false);
  const closeReadyAt=useRef(0),dismissed=useRef(false);
  const timers=useRef(new Set());
  const schedule=useCallback((fn,ms)=>{const id=setTimeout(()=>{timers.current.delete(id);fn();},ms);timers.current.add(id);},[]);
  const items=events.some(item=>item.id===event.id)?events:[event,...events];
  const index=items.findIndex(item=>item.id===event.id);
  const trackAnchor=useRef(items.findIndex(item=>item.id===initialId.current));
  const endlessMobile=true;
  // Track identities belong to positions, so wrapping never animates a card across the centre.
  const repeatCarousel=items.length>1;
  const scene=eventScene({...viewport,top:topInset,expanded,hover,projectArticle:event.articleKind==='project',pickerHeight:pickerMetrics.height,pickerBottom:pickerMetrics.bottom});
  const duration = (scene.mobile ? .9 : 1.2) * (import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionSlow') === '1' ? 3 : 1);
  const closeDuration=scene.mobile ? .56*(duration/.9) : duration*.8;
  const switchTiming=mobileEventTimeline(reduceMotion?0:duration);
  const stagedSwitch=scene.mobile&&!scene.fixedEventSize&&event.articleKind!=='project'&&switchStage!=='idle';
  const trackStride=scene.main.width+scene.gap;
  const trackX=returnFrom ? returnFrom.trackX : scene.fixedEventSize?-carouselPosition*trackStride+drag.x:0;
  const finishNavigation=useCallback(()=>{
    const request=navigation.current;
    if(!request)return;
    request.motionDone=true;
    // The router can commit selection after the animation, especially under
    // load. Keep input locked until both owners agree on the selected article.
    if(selectedId.current!==request.id)return;
    navigation.current=null;
    busy.current=false;setSwitchStage('idle');setPendingEventId(null);setSwipeSnap(null);
    setHover(0);setPickerSwitching(false);surface.current?.focus({preventScroll:true});
  },[]);
  useLayoutEffect(()=>{if(navigation.current?.motionDone)finishNavigation();},[event.id,finishNavigation]);
  const transition={...EVENT_MOTION,...(stagedSwitch?{ease:[.42,0,.28,1]}:{}),duration:reduceMotion?0:touching?0:phase==='closing'?closeDuration:swipeSnap?.45:stagedSwitch?switchTiming.travel:duration,
    ...(swipeSnap&&!touching&&!reduceMotion&&phase!=='closing'?{x:{type:'spring',stiffness:340,damping:38,mass:1,velocity:swipeSnap.velocity,restDelta:.5,restSpeed:5}}:{})};
  useEffect(()=>{
    if(phase!=='open'||openingReady||!articleReady||!veilReady)return;
    const timer=setTimeout(()=>setOpeningReady(true),reduceMotion?0:120);
    return()=>clearTimeout(timer);
  },[phase,openingReady,articleReady,veilReady,reduceMotion]);
  const complete=useCallback(()=>{if(closeStarted.current&&!dismissed.current){
      const remaining=closeReadyAt.current-performance.now();
      if(remaining>0){schedule(complete,remaining+20);return;}
      dismissed.current=true;
      const source=sourceSnapshot(event.id)?.element;
      source?.removeAttribute('data-article-return-target');
      source?.removeAttribute('data-article-return-ready');
      source?.removeAttribute('data-article-return-content');
      source?.removeAttribute('data-article-return-mobile');
      onDismiss();
    }},[onDismiss,event.id,schedule]);
  // The real card must be fully opaque before the overlay starts fading.
  // Crossfading both surfaces exposed the background between them at hand-off.
  const arrive=useCallback(()=>{
    if(!closeStarted.current || returnHandled.current)return;
    returnHandled.current=true;
    const source=sourceSnapshot(event.id)?.element;
    source?.setAttribute('data-article-return-ready','true');
    source?.removeAttribute('data-article-return-target');
    source?.setAttribute('data-article-return-content','visible');
    document.querySelectorAll('[data-article-opening-source]').forEach(node=>node.removeAttribute('data-article-opening-source'));
    closeReadyAt.current=performance.now()+(reduceMotion?0:320);
    setReturnArrived(true);
    schedule(complete,reduceMotion?0:340);
  },[event.id,reduceMotion,schedule,complete]);
  const close=useCallback(async ()=>{
    if(closeStarted.current)return;
    closeStarted.current=true;busy.current=true;
    setCloseRequested(true);
    sourceSnapshot(event.id)?.element.setAttribute('data-article-return-target','true');
    setHover(0);setTouching(false);setDrag({x:0,y:0});
    // Resolve the live selected DOM instance, not a retained carousel ref.
    // Repeated project identities can have several mounted copies.
    const selectedSurface=[...backdrop.current.querySelectorAll('[data-scene-card][data-active="true"]')]
      .filter(node=>node.dataset.eventId===event.id)
      .sort((a,b)=>{
        const distance=node=>{const rect=node.getBoundingClientRect();return Math.abs(rect.left+rect.width/2-window.innerWidth/2);};
        return distance(a)-distance(b);
      })[0];
    if(!selectedSurface){closeStarted.current=false;busy.current=false;setCloseRequested(false);sourceSnapshot(event.id)?.element.removeAttribute('data-article-return-target');return;}
    const source=sourceSnapshot(event.id)?.element;
    source?.setAttribute('data-article-return-content','hidden');
    source?.setAttribute('data-article-return-mobile',String(scene.mobile));
    // Hide the page before any scroll/layout work. Keep the mask opaque until
    // the repositioned overview has painted, then reveal it on the return timeline.
    const background=document.getElementById('root');
    if(returnMask.current)returnMask.current.style.opacity='1';
    background?.setAttribute('data-article-return-hidden','true');
    {
      const rect=selectedSurface.getBoundingClientRect();
      const info=selectedSurface.querySelector('.event-scene-info').getBoundingClientRect();
      const copy=selectedSurface.querySelector('.event-article-copy').getBoundingClientRect();
      const readingScroll=selectedSurface.querySelector('.event-scene-scroll').scrollTop;
      // Continue from the actual release position, including a pull gesture or
      // a scrolled header. Resetting drag must not spring the sheet back first.
      setReturnFrom({
        trackX:backdrop.current.querySelector('.event-carousel-track').getBoundingClientRect().left,
        frame:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1},
        parts:{info:{x:info.x-rect.x,y:info.y-rect.y,width:info.width},copy:{x:copy.x-rect.x,y:copy.y-rect.y+readingScroll,width:copy.width,scroll:readingScroll}},
      });
    }
    // Bring the actual cover back into the central reading surface before
    // measuring it. An offscreen cover rect would fly in from outside the view.
    const scroller=selectedSurface.querySelector('.event-scene-scroll');
    // Mobile hides the reading copy and resets its scroll in the closing layout
    // effect. Rewinding it visibly first would send the page back up the article.
    if(!scene.mobile && scroller && scroller.scrollTop>1){
      const from=scroller.scrollTop;
      if(reduceMotion)scroller.scrollTop=0;
      else await animate(from,0,{duration:.22,ease:[.22,1,.36,1],onUpdate:value=>{scroller.scrollTop=value;}});
    }
    closeReadyAt.current=Infinity;
    let target=sourceSnapshot(event.id);
    if(target && scene.mobile){
      const root=document.scrollingElement;
      const from=window.scrollY;
      const destination=centeredCardScroll({scrollY:from,cardTop:target.frame.y,cardHeight:target.frame.height,viewportHeight:window.innerHeight,maxScroll:Math.max(0,root.scrollHeight-root.clientHeight)});
      window.scrollTo({top:destination,behavior:'instant'});
      target=sourceSnapshot(event.id);
    } else if(target && (target.frame.y+target.parts.cover.y < topInset || target.frame.y+target.parts.cover.y+target.parts.cover.height>window.innerHeight-24)) {
      target.element.scrollIntoView({block:'center',behavior:'instant'});
      target=sourceSnapshot(event.id);
    }
    // Native scrolling and the overview's scroll-linked layout must settle
    // behind the opaque mask, rather than during its fade.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(!backdrop.current)return;
    target=sourceSnapshot(event.id);
    background?.removeAttribute('data-article-return-hidden');
    setReturnTo(target);
    setPhase('closing');
    if(returnMask.current){
      returnMaskAnimation.current=animate(returnMask.current,{opacity:0},{duration:reduceMotion?0:closeDuration,ease:[.42,0,.58,1]});
    }
    // Fallback for an interrupted/no-distance animation; normal hand-off is
    // driven by the moving surface's completion callback.
    schedule(arrive,reduceMotion?0:closeDuration*1000+100);
  },[event.id,event.articleKind,scene.mobile,topInset,schedule,arrive,reduceMotion,closeDuration,duration]);

  const navigate=useCallback((step,target,release)=>{
    if(busy.current||closeStarted.current||items.length<2)return false;
    // The track is the selection authority. Router props can lag behind a
    // release; deriving the next step from them can repeat or skip a slot.
    const selectedIndex=repeatCarousel?wrap(trackAnchor.current+carouselPosition,items.length):index;
    const next=target||items[viewport.width<ARTICLE_DESKTOP_MIN_WIDTH&&!endlessMobile ? selectedIndex+step : wrap(selectedIndex+step,items.length)];
    if(!next)return false;
    if(next.id===items[selectedIndex]?.id)return false;
    navigation.current={id:next.id,motionDone:false};
    busy.current=true;setPendingEventId(next.id);setPickerSwitching(true);setDirection(step);setTouching(false);
    setSwipeSnap(release || null);
    const staged=!release&&scene.mobile&&!scene.fixedEventSize&&event.articleKind!=='project';
    const timing=mobileEventTimeline(reduceMotion?0:duration);
    const travel=()=>{
      if(closeStarted.current)return;
      // The incoming cover fades first; the outgoing article remains until clipped.
      if(staged)setSwitchStage('travel');
      if(repeatCarousel){
        const nextIndex=items.findIndex(item=>item.id===next.id);
        setCarouselPosition(position=>position+ringSlot(nextIndex,selectedIndex,items.length,step));
      }
      // Commit the track step and consume its drag in the same React update.
      // URL selection may commit later and must never own gesture cleanup.
      setDrag({x:0,y:0});
      onNavigate(next);
      if(!scene.fixedEventSize)schedule(finishNavigation,reduceMotion?0:release?700:staged?timing.travel*1000:duration*1000);
    };
    if(staged&&timing.prepare){
      setSwitchStage('prepare');
      schedule(travel,timing.prepare*1000);
    }else travel();
    return true;
  },[items,index,event.id,event.articleKind,onNavigate,schedule,reduceMotion,duration,repeatCarousel,carouselPosition,viewport.width,endlessMobile,scene.mobile,scene.fixedEventSize,finishNavigation]);
  useLayoutEffect(()=>{
    const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight});
    window.addEventListener('resize',resize);
    const source=origin.current?.element;
    const prepare=event.articleKind==='project'&&source&&!reduceMotion;
    if(prepare)source.setAttribute('data-article-opening-source','true');
    const timer=setTimeout(()=>{if(!closeStarted.current)setPhase('open');},prepare?140:0);
    return()=>{window.removeEventListener('resize',resize);clearTimeout(timer);source?.removeAttribute('data-article-opening-source');};
  },[]);
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const background=document.getElementById('root');
    const previousAria=background?.getAttribute('aria-hidden');
    background?.setAttribute('aria-hidden','true');
    surface.current?.focus({preventScroll:true});
    return()=>{
      returnMaskAnimation.current?.stop();
      background?.removeAttribute('data-article-return-hidden');
      document.body.style.overflow=overflow;
      document.querySelectorAll('[data-article-opening-source]').forEach(node=>node.removeAttribute('data-article-opening-source'));
      document.querySelectorAll('[data-article-return-target]').forEach(node=>node.removeAttribute('data-article-return-target'));
      document.querySelectorAll('[data-article-return-ready]').forEach(node=>node.removeAttribute('data-article-return-ready'));
      document.querySelectorAll('[data-article-return-content]').forEach(node=>{node.removeAttribute('data-article-return-content');node.removeAttribute('data-article-return-mobile');});
      if(previousAria===null)background?.removeAttribute('aria-hidden');else if(previousAria!==undefined)background?.setAttribute('aria-hidden',previousAria);
      for(const timer of timers.current)clearTimeout(timer);
      if(previous?.isConnected)previous.focus({preventScroll:true});
    };
  },[]);
  useEffect(()=>{
    let frame=null,held=0,lastTime=null,target=null;
    const stopScroll=()=>{
      if(frame!==null)cancelAnimationFrame(frame);
      frame=null;held=0;lastTime=null;target=null;
    };
    const tick=time=>{
      const dt=lastTime===null?1/60:Math.min((time-lastTime)/1000,.05);
      lastTime=time;
      if(held)target+=held*420*dt;
      target=Math.max(0,Math.min(content.scrollHeight-content.clientHeight,target));
      const remaining=target-content.scrollTop;
      content.scrollTo({top:Math.abs(remaining)<.5?target:content.scrollTop+remaining*(1-Math.exp(-dt/.09)),behavior:'auto'});
      if(held||Math.abs(target-content.scrollTop)>.5)frame=requestAnimationFrame(tick);
      else{frame=null;lastTime=null;target=null;}
    };
    const release=e=>{
      if(!e||e.key===(held>0?'ArrowDown':'ArrowUp'))held=0;
    };
    const keys=e=>{
      if(e.key==='ArrowUp'||e.key==='ArrowDown'){
        if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable="true"],[role="slider"]'))return;
        if(content){
          e.preventDefault();
          const direction=e.key==='ArrowDown'?1:-1;
          if(reduceMotion){content.scrollBy({top:direction*72,behavior:'auto'});return;}
          if(e.repeat)return;
          if(held!==direction){
            target=(held&&held!==direction?content.scrollTop:target??content.scrollTop)+direction*72;
            held=direction;
          }
          if(frame===null)frame=requestAnimationFrame(tick);
        }
        return;
      }
      if(e.key==='Escape'){e.preventDefault();close();}
      if(e.key==='ArrowRight'){e.preventDefault();navigate(1);}
      if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1);}
      if(e.key==='Tab'){
        const nodes=[...backdrop.current.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(node=>!node.closest('[inert]')&&node.getClientRects().length&&node.getAttribute('aria-hidden')!=='true');
        const first=nodes[0],last=nodes.at(-1);
        if(!first){e.preventDefault();return;}
        if(e.shiftKey&&(document.activeElement===first||!nodes.includes(document.activeElement))){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&(document.activeElement===last||!nodes.includes(document.activeElement))){e.preventDefault();first.focus();}
      }
    };
    window.addEventListener('keydown',keys);
    window.addEventListener('keyup',release);
    window.addEventListener('blur',stopScroll);
    window.addEventListener('wheel',stopScroll,{passive:true});
    window.addEventListener('pointerdown',stopScroll,{passive:true});
    return()=>{
      stopScroll();
      window.removeEventListener('keydown',keys);
      window.removeEventListener('keyup',release);
      window.removeEventListener('blur',stopScroll);
      window.removeEventListener('wheel',stopScroll);
      window.removeEventListener('pointerdown',stopScroll);
    };
  },[close,navigate,content,reduceMotion]);
  // One gesture owner. A horizontal gesture moves the whole carousel; a vertical
  // gesture belongs to native reading unless it starts at the top of the sheet.
  // The explicit handle also accepts mouse/pen input in a narrow desktop window.
  const handleStart=e=>{
    if(e.pointerType==='touch'||e.button!==0||!scene.mobile||busy.current||closeStarted.current)return;
    e.preventDefault();e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    suppressHandleClick.current=false;
    handlePointer.current={id:e.pointerId,y:e.clientY,distance:0,moved:false,samples:[{y:e.clientY,time:performance.now()}]};
  };
  const handleMove=e=>{
    const pointer=handlePointer.current;
    if(!pointer||pointer.id!==e.pointerId)return;
    e.preventDefault();
    pointer.distance=e.clientY-pointer.y;
    if(Math.abs(pointer.distance)<4&&!pointer.moved)return;
    pointer.moved=true;
    const time=performance.now();
    pointer.samples.push({y:e.clientY,time});
    pointer.samples=pointer.samples.filter(sample=>time-sample.time<=150);
    setTouching(true);setDrag({x:0,y:Math.max(0,pointer.distance*.85)});
  };
  const handleEnd=(e,cancelled=false)=>{
    const pointer=handlePointer.current;
    if(!pointer||pointer.id!==e.pointerId)return;
    handlePointer.current=null;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    setTouching(false);setDrag({x:0,y:0});
    suppressHandleClick.current=pointer.moved||cancelled;
    if(!pointer.moved)return;
    const time=performance.now(),first=pointer.samples.find(sample=>time-sample.time<=120);
    const velocity=first?(e.clientY-first.y)/Math.max(1,time-first.time):0;
    if(mobileSheetRelease({distance:pointer.distance,velocity,expanded,cancelled})==='close')close();
  };
  const handleClick=e=>{
    if(!suppressHandleClick.current)return;
    suppressHandleClick.current=false;e.preventDefault();e.stopPropagation();
  };
  const start=e=>{
    if(e.target.closest?.('.project-credits-track,.event-photo-grid')||busy.current||e.touches.length!==1)return;
    setSwipeSnap(null);
    const t=e.touches[0];gesture.current={x:t.clientX,y:t.clientY,axis:null,samples:[{x:t.clientX,y:t.clientY,time:performance.now()}],expanded,atTop:Boolean(e.target.closest?.('.event-scene-handle'))||!content||content.scrollTop<=1,dx:0,dy:0};
  };
  const end=e=>{
    const g=gesture.current;if(!g)return;
    gesture.current=null;setTouching(false);
    if(g.axis==='x'){
      const now=performance.now(), first=g.samples.find(sample=>now-sample.time<=120);
      const velocity=first?(g.x+g.dx-first.x)/Math.max(1,now-first.time):0;
      const release=articleSwipeRelease({distance:g.dx,velocity,width:scene.main.width,cancelled:e.type==='touchcancel'});
      // Keep the finger position until the new route selection commits.
      // Resetting here would briefly animate back to the old centre first.
      if(release.step&&navigate(release.step,undefined,release))return;
      setSwipeSnap(release);
      setDrag({x:0,y:0});return;
    }
    else if(g.axis==='y'){
      const now=performance.now();
      const recent=g.samples.filter(sample=>now-sample.time<=120);
      const first=recent[0];
      const velocity=first?(g.y+g.dy-first.y)/Math.max(1,now-first.time):0;
      const action=mobileSheetRelease({distance:g.dy,velocity,expanded:g.expanded,cancelled:e.type==='touchcancel'});
      if(action==='close')close();
      else if(action==='collapse')setExpanded(false);
    }
    setDrag({x:0,y:0});
  };
  gestureEnd.current=end;
  useEffect(()=>{
    // Safari can end a touch outside the moving card (or cancel native panning).
    // Finish at the window before child handlers can lose the gesture owner.
    const finish=e=>gestureEnd.current?.(e);
    window.addEventListener('touchend',finish,true);
    window.addEventListener('touchcancel',finish,true);
    return()=>{
      window.removeEventListener('touchend',finish,true);
      window.removeEventListener('touchcancel',finish,true);
    };
  },[]);
  useEffect(()=>{
    const node=backdrop.current;
    const move=e=>{
      const g=gesture.current;if(!g||e.touches.length!==1)return;
      const t=e.touches[0];g.dx=t.clientX-g.x;g.dy=t.clientY-g.y;
      const time=performance.now();
      g.samples.push({x:t.clientX,y:t.clientY,time});
      g.samples=g.samples.filter(sample=>time-sample.time<=150);
      if(!g.axis){
        if(Math.max(Math.abs(g.dx),Math.abs(g.dy))<8)return;
        if(Math.abs(g.dx)>Math.abs(g.dy)*1.2)g.axis='x';
        else if(scene.mobile&&g.dy<0&&!expanded){
          e.preventDefault();
          g.axis='expand';
          const expandedScene=eventScene({...viewport,top:topInset,expanded:true,projectArticle:event.articleKind==='project',pickerHeight:pickerMetrics.height,pickerBottom:pickerMetrics.bottom});
          g.expandDistance=Math.max(0,expandedScene.main.height-scene.main.height);
          g.scrollStart=content?.scrollTop||0;
          setExpanded(true);
          if(content)content.scrollTop=g.scrollStart+Math.max(0,-g.dy-g.expandDistance);
          return;
        }
        else if(scene.mobile&&g.dy>0&&g.atTop)g.axis='y';
        else {gesture.current=null;return;}
      }
      if(g.axis==='expand'){
        e.preventDefault();
        if(content)content.scrollTop=g.scrollStart+Math.max(0,-g.dy-g.expandDistance);
        return;
      }
      e.preventDefault();setTouching(true);
      setDrag(g.axis==='x'?{x:g.dx,y:0}:{x:0,y:Math.max(0,g.dy*.85)});
    };
    const wheel=e=>{
      if(e.target.closest?.('.project-credits-track,.event-photo-grid') && Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      if(content?.contains(e.target) && Math.abs(e.deltaX)>Math.abs(e.deltaY)*1.2 && !e.ctrlKey){
        e.preventDefault();
        const now=performance.now(), swipe=articleSwipeWheel.current;
        if(now-swipe.last>180){swipe.distance=0;swipe.latched=false;}
        swipe.last=now;
        if(!swipe.latched && !busy.current && !closeStarted.current){
          swipe.distance+=e.deltaX*(e.deltaMode===1?16:1);
          if(Math.abs(swipe.distance)>60){swipe.latched=true;navigate(swipe.distance>0?1:-1);}
        }
        return;
      }
      if(!content?.contains(e.target) || busy.current || closeStarted.current || Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      const now=performance.now(), g=wheelGesture.current;
      // A fresh scroll gesture must begin at the top: reaching the top while
      // reading must not dismiss the article through trackpad momentum.
      if(now-g.last>160){g.distance=0;g.atTop=content.scrollTop<=1;g.latched=false;}
      g.last=now;
      if(e.deltaY<0 && content.scrollTop<=1 && g.atTop){
        e.preventDefault();
        g.distance+=-e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?content.clientHeight:1);
        if(g.distance>=(scene.mobile?(expanded?35:70):70)&&!g.latched){g.distance=0;g.latched=true;close();}
      }else if(e.deltaY>0){
        g.distance=0;g.atTop=false;
        if(scene.mobile&&!expanded){e.preventDefault();expansionUntil.current=performance.now()+duration*1000;setExpanded(true);}
        else if(scene.mobile&&performance.now()<expansionUntil.current)e.preventDefault();
      }
    };
    node.addEventListener('touchmove',move,{passive:false});node.addEventListener('wheel',wheel,{passive:false});
    return()=>{node.removeEventListener('touchmove',move);node.removeEventListener('wheel',wheel);};
  },[expanded,content,scene.mobile,close,navigate,duration,pickerMetrics.height,pickerMetrics.bottom,viewport.width,viewport.height]);
  useEffect(()=>{
    if(!content)return;
    const scroll=()=>{content.dataset.scrolled=String(content.scrollTop>1);if(scene.mobile&&!expanded&&content.scrollTop>0)setExpanded(true);};
    scroll();
    content.addEventListener('scroll',scroll,{passive:true});return()=>content.removeEventListener('scroll',scroll);
  },[content,expanded,scene.mobile]);
  useLayoutEffect(()=>{
    const track=picker.current;if(!track||!scene.mobile)return;
    const bar=track.parentElement;
    const measure=()=>{
      const height=bar.offsetHeight,bottom=parseFloat(getComputedStyle(bar).bottom)||18;
      setPickerMetrics(previous=>previous.height===height&&previous.bottom===bottom?previous:{height,bottom});
    };
    measure();
    const observer=new ResizeObserver(measure);observer.observe(bar);
    window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[scene.mobile]);
  useLayoutEffect(()=>{
    const track=picker.current;if(!track||!scene.mobile)return;
    const cycle=items.length*64;
    const copy=pickerInitialized.current?Math.max(1,Math.min(3,Math.round((track.scrollLeft-index*64)/cycle))):2;
    const destination=endlessMobile ? copy*cycle+index*64 : index*64;
    if(!pickerInitialized.current || reduceMotion) {
      track.scrollLeft=destination;
      pickerInitialized.current=true;
      return;
    }
    // Native smooth scrolling chooses its own duration. Use the card's clock
    // and easing instead; snap and endless rebasing must not interrupt it.
    pickerAnimating.current=true;
    track.style.scrollSnapType='none';
    const playback=animate(track.scrollLeft,destination,{
      ...EVENT_MOTION,duration,
      onUpdate:value=>{track.scrollLeft=value;},
      onComplete:()=>{
        track.scrollLeft=endlessMobile ? 2*cycle+index*64 : destination;
        track.style.scrollSnapType='';
        pickerAnimating.current=false;
      },
    });
    return()=>{
      playback.stop();
      track.style.scrollSnapType='';
      pickerAnimating.current=false;
    };
  },[index,items.length,scene.mobile,reduceMotion,duration,endlessMobile]);
  useEffect(()=>{
    const track=picker.current;if(!track||!scene.mobile)return;
    const wheel=e=>{
      e.preventDefault();e.stopPropagation();
      const input=pickerInput.current,now=performance.now();
      if(now-input.lastWheel>180){input.latched=false;input.delta=0;}
      input.lastWheel=now;
      if(input.latched||busy.current)return;
      input.delta+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
      if(Math.abs(input.delta)>24){input.latched=true;navigate(input.delta>0?1:-1);}
    };
    const start=e=>{e.stopPropagation();if(e.touches.length===1)pickerInput.current.touch={x:e.touches[0].clientX,y:e.touches[0].clientY};};
    const move=e=>{e.preventDefault();e.stopPropagation();};
    const end=e=>{
      e.stopPropagation();const touch=pickerInput.current.touch;pickerInput.current.touch=null;
      if(!touch||!e.changedTouches.length||e.type==='touchcancel')return;
      const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
      const distance=Math.abs(dx)>Math.abs(dy)?dx:dy;
      if(Math.abs(distance)>28)navigate(distance<0?1:-1);
    };
    track.addEventListener('wheel',wheel,{passive:false});track.addEventListener('touchstart',start,{passive:true});track.addEventListener('touchmove',move,{passive:false});track.addEventListener('touchend',end);track.addEventListener('touchcancel',end);
    return()=>{track.removeEventListener('wheel',wheel);track.removeEventListener('touchstart',start);track.removeEventListener('touchmove',move);track.removeEventListener('touchend',end);track.removeEventListener('touchcancel',end);};
  },[scene.mobile,navigate]);
  return createPortal(<>
    <div className="event-scene" ref={backdrop} data-phase={phase} data-closing={closeRequested} data-return-stage={returnArrived?'arrived':phase==='closing'?'morphing':closeRequested?'hiding':'idle'} data-expanded={expanded} onClick={close}>
      <motion.div onAnimationComplete={()=>{if(phase!=='closing')setVeilReady(true);}} className="event-scene-veil" initial={{opacity:0}} animate={{opacity:phase==='closing'?0:1}} transition={phase==='closing'?{...transition,...(scene.mobile?{duration:reduceMotion?0:.22*(duration/.9)}:{})}:{duration:reduceMotion?0:.7,ease:[.4,0,.2,1]}}/>
      <div ref={returnMask} className="event-scene-return-mask" style={{opacity:0}} aria-hidden="true"/>
      <motion.div className="event-carousel-track" data-navigating={pendingEventId!==null} initial={false} animate={{x:trackX}} transition={transition}
        onAnimationComplete={target=>{if(scene.fixedEventSize&&target.x===trackX&&busy.current&&!gesture.current&&!closeStarted.current)finishNavigation();}}>
      {(repeatCarousel
        ? repeatedCarouselSlots(items.length,trackAnchor.current,carouselPosition).map(({index,ordinal,slot})=>({item:items[index],key:`copy-${ordinal}`,slot,original:ordinal===0&&initialId.current===items[index].id}))
        : items.map((item,i)=>({item,key:item.id,slot:scene.mobile&&!endlessMobile?i-index:ringSlot(i,index,items.length,direction),original:initialId.current===item.id}))
      ).map(({item,key,slot,original})=>{
        const active=slot===0;
        let frame=slotGeometry(scene,slot);
        // Full-width phone articles have fixed positions on one moving track.
        // Only the track animates horizontally, including interrupted swipes.
        frame={...frame,x:frame.x+(scene.fixedEventSize?carouselPosition*trackStride:drag.x),y:frame.y+(active?drag.y:0),scale:drag.x ? swipeCardScale(scene,slot,drag.x) : frame.scale};
        if(active&&returnFrom&&phase!=='closing')frame={...returnFrom.frame,x:returnFrom.frame.x-returnFrom.trackX};
        if(active&&phase==='closing'){
          frame=returnTo?.frame?{...returnTo.frame,x:returnTo.frame.x-(returnFrom?.trackX??(scene.fixedEventSize?-carouselPosition*trackStride:0))}:{...frame,y:viewport.height+24};
        }
        if(!active&&!scene.mobile&&phase==='closing')frame={...frame,x:slot<0?-frame.width-80:viewport.width+80};
        if(!active&&!scene.mobile&&!openingReady)frame={...frame,x:slot<0?-frame.width-80:viewport.width+80};
        const returning=active&&phase==='closing';
        return <EventSceneCard key={key} sceneId={`${item.id}-${key}`} event={item} frame={frame} slot={slot} active={active} mobile={scene.mobile}
          visible={active||(Math.abs(slot)===1&&(phase==='open'||phase==='closing')&&openingReady)}
          fixedEventSize={scene.fixedEventSize}
          initialFrame={original?origin.current?.frame:undefined}
          initialParts={returning?returnTo?.parts:original?origin.current?.parts:undefined}
          transition={transition} phase={phase} returnArrived={returnArrived} closingRequested={closeRequested} returnOrigin={active?returnFrom?.parts:undefined} now={now} onClose={close}
          previewsReady={openingReady} onReady={active?markArticleReady:undefined}
          switchStage={stagedSwitch?switchStage:'idle'} preparingIncoming={stagedSwitch&&switchStage==='prepare'&&pendingEventId===item.id} prepareDuration={switchTiming.prepare}
          onSelect={()=>navigate(Math.sign(slot),item)} onHover={setHover}
          onContent={setContent} onSurface={node=>{surface.current=node;}}
          onGesture={{start,end,cancel:end,handleStart,handleMove,handleEnd,handleCancel:e=>handleEnd(e,true),handleClick}} emphasized={hover===slot||pendingEventId===item.id} onMotionComplete={phase==='closing'?(returnArrived?complete:arrive):undefined} />;
      })}
      </motion.div>
      {!scene.mobile&&items.length>1&&[-1,1].map(dir=><motion.button key={dir} className="event-scene-arrow"
        aria-label={dir<0?(de?'Vorheriger Artikel':'Previous article'):(de?'Nächster Artikel':'Next article')}
        initial={false} animate={{...arrowGeometry(scene,dir),opacity:phase==='open'&&openingReady?.8:0}} transition={{...transition,duration:reduceMotion?0:.25}} style={{pointerEvents:phase==='open'&&openingReady?'auto':'none'}}
        onClick={e=>{e.stopPropagation();navigate(dir);}}>{dir<0?<ChevronLeft size={22}/>:<ChevronRight size={22}/>}</motion.button>)}
      {scene.mobile&&items.length>1&&<motion.nav className="event-mobile-picker" data-switching={pickerSwitching} style={{'--picker-selection-duration':`${duration}s`}} aria-label={de?'Artikel auswählen':'Choose article'}
        initial={{opacity:1,y:140}} animate={{opacity:1,y:phase==='open'?0:140}} transition={{...transition,duration:transition.duration*.65,delay:phase==='open'?transition.duration*.25:0}} onClick={e=>e.stopPropagation()}>
        <div ref={picker} className="event-mobile-picker-track" onScroll={e=>{
          if(!endlessMobile||pickerAnimating.current)return;
          const track=e.currentTarget,cycle=items.length*64;
          if(track.scrollLeft<cycle)track.scrollLeft+=cycle*2;
          else if(track.scrollLeft>cycle*3)track.scrollLeft-=cycle*2;
        }}>
          {Array.from({length:endlessMobile?5:1},(_,copy)=>items.map((item,i)=><EventCard key={`${copy}-${item.id}`} event={item} state="picker" morph={false}
            aria-label={item.title} aria-current={i===index?'true':undefined} tabIndex={!endlessMobile||copy===2?0:-1}
            onClick={()=>navigate(endlessMobile ? (ringSlot(i,index,items.length,direction)>0?1:-1) : (i>index?1:-1),item)}/>))}
        </div>
      </motion.nav>}
    </div>
  </>,document.body);
}
