import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fixedTitleLines, fittedTitleSize } from './StraightMorphTitle';
import { textAroundCover } from './textMotion.mjs';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import EventCard, { EventCardHeader, EventCardMetadata } from './EventCard';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import { cardParts, eventScene, PROJECT_PREVIEW_WIDTH } from './eventMotion.mjs';
import { ProjectCardSummary } from '../cards/ProjectCard';
import ProjectContributors from '../cards/ProjectContributors';
import ProjectArticleDate from '../cards/ProjectArticleDate';
import EventExternalActions from './EventExternalActions';
import { eventActionLinks } from './eventActions.mjs';
import EventPhotoGrid from './EventPhotoGrid';
import styles from '../cards/ProjectDetails.module.css';

const MOBILE_TITLE_PROGRESS = .8;

// Measure the destination composition, never an in-flight credit animation.
function prepareCreditMeasurement(probe, compact) {
  const credits = probe.querySelector('.project-credits');
  if (!credits) return;
  credits.classList.toggle('project-credits--compact', compact);
  Object.assign(credits.style, { marginTop: compact ? '14px' : '20px', gap: '0px', height:'auto', opacity:'1' });
  const date = credits.querySelector('.project-credits-date-slot');
  if (date) Object.assign(date.style, { height: compact ? '0px' : 'auto', marginBottom: compact ? '0px' : '20px' });
  credits.querySelectorAll('.project-credit-slot').forEach((slot, index) => {
    Object.assign(slot.style, { width: 'auto', marginLeft: index > 0 ? 'var(--project-credit-spacing)' : '0px' });
  });
  credits.querySelectorAll('.project-credit-person').forEach((person, index) => {
    person.style.display = 'flex';
  });
}
const MOBILE_TITLE_EASE = [.42, 0, .28, 1];

function prepareEventMetadataMeasurement(probe) {
  const meta=probe.querySelector('.event-scene-meta');
  if(!meta)return;
  meta.style.marginTop='16px';
  meta.querySelectorAll('p').forEach(row=>{row.style.minHeight='0px';});
}

function fitProjectTitle(text,width,size,family) {
  return fittedTitleSize(text,width,size,family,'project');
}

// This instance stays mounted as it travels from neighbour to article to neighbour.
// Animate dimensions, never scale the article: images retain their aspect ratio.
export default function EventSceneCard({ event, sceneId = event.id, frame, initialFrame, initialParts, active, mobile, visible, emphasized, slot, transition, phase, returnArrived = false, closingRequested = false, returnOrigin, fixedEventSize = false, previewsReady = true, onReady, switchStage = 'idle', preparingIncoming = false, prepareDuration = 0, now, onClose, onSelect, onHover, onContent, onSurface, onGesture, onMotionComplete }) {
  const { locale } = useLocale();
  const de = locale === 'de';
  const motionRate = import.meta.env.DEV && new URLSearchParams(window.location.search).get('motionSlow') === '1' ? 3 : 1;
  const infoRef = useRef(null);
  const scrollRef = useRef(null);
  const titleRef = useRef(null);
  const wasActive = useRef(active);
  // Keep the outgoing reading surface intact while its container clips it.
  const [readingState,setReadingState]=useState({active,exit:null});
  let exitReading=readingState.exit;
  if(readingState.active!==active){
    exitReading=active?null:{
      width:scrollRef.current?.clientWidth || frame.width,
      top:scrollRef.current?.querySelector('.event-scene-header')?.offsetHeight || 0,
      infoHeight:infoRef.current?.offsetHeight || 0,
      scroll:scrollRef.current?.scrollTop || 0,
    };
    setReadingState({active,exit:exitReading});
  }
  const exiting=!active&&Boolean(exitReading);
  // Full-size mobile pages leave horizontally; keep the reading surface intact
  // until the whole card is offscreen, rather than fading it into a preview.
  const fullSizeExit = exiting && mobile && fixedEventSize;
  const visited = useRef(active || fixedEventSize);
  if (active || fixedEventSize) visited.current = true;
  const [settled,setSettled] = useState(!active || !initialFrame);
  const [settledMobile,setSettledMobile] = useState(mobile);
  const [copyReady,setCopyReady] = useState(false);
  const [titleReady,setTitleReady] = useState(!active || !initialFrame);

  const motionReadyAt=useRef(0);
  const articleLayout = active || fixedEventSize;
  const mobileEvent = mobile && articleLayout && event.articleKind !== 'project';
  const projectArticle = event.articleKind === 'project';
  const mobileEventCard = mobile && !projectArticle;
  const preparingOutgoing = mobileEventCard && active && switchStage==='prepare';
  const firstEntrance = useRef(Boolean(active && initialFrame));
  const readingOpened = useRef(!active);
  const [infoHeight,setInfoHeight] = useState(230);
  const [targetInfoHeight,setTargetInfoHeight] = useState(230);
  const baseParts = cardParts(frame,mobile,articleLayout,projectArticle);
  const preparingEntrance=phase==='opening'&&active&&Boolean(initialFrame&&initialParts);
  const parts = preparingEntrance?initialParts:phase === 'closing' && active && initialParts ? initialParts
    : projectArticle && active && !mobile
      ? {...baseParts,cover:{...baseParts.cover,height:Math.max(baseParts.cover.width,targetInfoHeight)},headerHeight:baseParts.cover.y+Math.max(baseParts.cover.width,targetInfoHeight)}
      : active && !mobile
        ? {...baseParts,info:{...baseParts.info,y:baseParts.cover.y+Math.max(0,(baseParts.cover.height-targetInfoHeight)/2)}}
        : baseParts;
  const previousLayout = useRef({active,mobile,parts,frame});
  const [desktopPath,setDesktopPath] = useState(null);
  useLayoutEffect(() => {
    const before=previousLayout.current;
    if(!mobile&&active&&phase==='open'&&firstEntrance.current&&initialParts){
      setDesktopPath({from:initialParts,to:parts,entering:true,fromWidth:initialFrame?.width||frame.width});
    } else if((!mobile&&!before.mobile&&before.active!==active)||(!mobile&&phase==='closing'&&active)) {
      setDesktopPath({from:before.parts,to:parts,entering:phase==='closing'?false:active,closing:phase==='closing',fromWidth:before.frame.width});
    } else setDesktopPath(null);
    previousLayout.current={active,mobile,parts,frame};
  },[active,mobile,frame.width,phase]);
  useLayoutEffect(() => {
    // A mobile height change is the same open article, not a fresh reveal.
    // Keep its reading content visible while expanding or collapsing the sheet.
    if(mobile && active && wasActive.current && phase==='open' && settledMobile===mobile && settled) return;
    motionReadyAt.current=performance.now()+transition.duration*1000;
    setSettled(false);
    setTitleReady(false);
    setCopyReady(false);
    const titleTimer=setTimeout(()=>setTitleReady(true),transition.duration*1000*(mobileEventCard?MOBILE_TITLE_PROGRESS:.55));
    if(active&&scrollRef.current)scrollRef.current.scrollTop=0;
    // Wait for both the surface and cover before revealing article text.
    // The fallback also covers zero-distance and reduced-motion updates.
    const timer=setTimeout(()=>{if(active&&phase==='open'){firstEntrance.current=false;readingOpened.current=true;}setSettled(true);setSettledMobile(mobile);},transition.duration*1000+200);
    return()=>{clearTimeout(timer);clearTimeout(titleTimer);};
  },[active,frame.width,frame.height,mobile,phase]);
  const finishMotion=()=>{
    if(phase==='opening')return;
    if(performance.now()+30<motionReadyAt.current)return;
    setDesktopPath(null);
    setSettled(true);setSettledMobile(mobile);setTitleReady(true);
    if(!active){setReadingState({active:false,exit:null});if(scrollRef.current)scrollRef.current.scrollTop=0;}
    firstEntrance.current=false;
    if(active&&phase==='open')readingOpened.current=true;
    if(active)onMotionComplete?.();
  };
  const [metadataWrap,setMetadataWrap] = useState({date:false,location:false});
  const [compactHeight,setCompactHeight] = useState(448);
  const [fontSize,setFontSize] = useState(initialParts?.fontSize||parts.fontSize);
  const photos = [{src:event.image,alt:event.title,credit:event.photoCredit,isCover:true},...(event.gallery||[]).map(image=>({...image,credit:image.credit||event.photoCredit,alt:image[locale]?.alt||image.alt||event.title}))];
  const hasActions = !projectArticle && (event.id==='generation-two' || eventActionLinks(event,locale,now,true).length>0);
  const actions = <>
    {event.id==='generation-two' && <Button variant="secondary" href="/team" onClick={onClose}>{de?'Lerne alle Mitglieder kennen':'Meet all our members'}</Button>}
    <EventExternalActions event={event} locale={locale} now={now} includePast variant="secondary"/>
  </>;
  useLayoutEffect(() => {
    if(!active || mobile || phase==='closing' || !infoRef.current)return;
    let alive=true;
    const measureDestination=()=>{
      if(!alive || !infoRef.current)return;
      const shell=document.createElement('div');
      shell.className='event-scene-card';shell.dataset.articleKind=projectArticle?'project':'event';shell.dataset.active='true';shell.style.setProperty('--event-meta-font-size','16px');shell.style.setProperty('--event-meta-icon-size','17px');shell.setAttribute('aria-hidden','true');
      Object.assign(shell.style,{position:'fixed',left:'-10000px',top:'0',visibility:'hidden',height:'auto',overflow:'visible',width:`${frame.width}px`});
      const probe=infoRef.current.cloneNode(true);
      Object.assign(probe.style,{position:'static',width:`${baseParts.info.width}px`,height:'auto',visibility:'hidden',justifyContent:'flex-start'});
      const heading=probe.querySelector('h2');
      {const block=probe.querySelector('[data-header-title-block]');if(block)Object.assign(block.style,{height:'auto',minHeight:0});}
      if(heading){
        const family=getComputedStyle(titleRef.current).fontFamily;
        {
          // The mounted heading can still contain its initial single line.
          // Measure the final composition, not an intermediate animation frame.
          heading.replaceChildren(...fixedTitleLines(event.title,family,projectArticle?'project':'event',true).map(line=>{
            const span=document.createElement('span');span.textContent=line;
            Object.assign(span.style,{display:'block',whiteSpace:'nowrap'});return span;
          }));
        }
        Object.assign(heading.style,{fontSize:`${projectArticle?fitProjectTitle(event.title,baseParts.info.width-40,60,family):fittedTitleSize(event.title,baseParts.info.width-40,60,family)}px`,paddingRight:'40px'});
      }
      if(projectArticle){probe.querySelector('.event-scene-extra')?.remove();probe.querySelector('[data-project-summary]')?.remove();prepareCreditMeasurement(probe,false);}
      else prepareEventMetadataMeasurement(probe);
      const actions=probe.querySelector('.event-header-actions');
      if(actions)Object.assign(actions.style,{height:'auto',marginTop:'20px'});
      shell.appendChild(probe);document.body.appendChild(shell);
      setTargetInfoHeight(probe.getBoundingClientRect().height);
      shell.remove();
    };
    measureDestination();document.fonts?.ready.then(measureDestination);
    return()=>{alive=false;};
  },[projectArticle,active,mobile,phase==='closing',baseParts.info.width,event.title,event.author?.name,event.author?.role,event.publishedDate,locale,hasActions]);

  useLayoutEffect(() => {
    if (!infoRef.current) return;
    const measure = () => {
      const height=infoRef.current.offsetHeight;
      setInfoHeight(height);

    };
    const observer = new ResizeObserver(measure);
    observer.observe(infoRef.current); measure();
    return () => observer.disconnect();
  },[active,projectArticle,parts.info.y]);
  useLayoutEffect(() => {
    if(articleLayout || !infoRef.current)return;
    // Measure the destination typography, never the title while it is shrinking.
    // A live ResizeObserver would continually restart the surface height tween.
    const shell=document.createElement('div');
    shell.className='event-scene-card';
    shell.dataset.articleKind=event.articleKind || 'event';
    shell.dataset.active='false';
    shell.style.setProperty('--event-meta-font-size','13px');
    shell.style.setProperty('--event-meta-icon-size','15px');
    if(mobileEventCard){
      shell.style.setProperty('--event-meta-font-size','14px');
      shell.style.setProperty('--event-meta-icon-size','16px');
    }
    shell.dataset.morphing='false';
    shell.setAttribute('aria-hidden','true');
    Object.assign(shell.style,{position:'fixed',left:'-10000px',top:'0',visibility:'hidden',height:'auto',width:`${frame.width}px`});
    const probe=infoRef.current.cloneNode(true);
    Object.assign(probe.style,{position:'static',width:`${parts.info.width}px`,height:'auto',minHeight:'0px',visibility:'hidden'});
    const heading=probe.querySelector('h2');
    {const block=probe.querySelector('[data-header-title-block]');if(block)Object.assign(block.style,{height:'auto',minHeight:0,paddingBottom:0});}
    if(heading){
      heading.replaceChildren(...fixedTitleLines(event.title,getComputedStyle(titleRef.current).fontFamily,projectArticle?'project':'event',true).map(line=>{
        const span=document.createElement('span');span.textContent=line;
        Object.assign(span.style,{display:'block',whiteSpace:'nowrap'});return span;
      }));
      const measuredSize=projectArticle?fittedTitleSize(event.title,parts.info.width,parts.fontSize,getComputedStyle(titleRef.current).fontFamily,'project'):parts.fontSize;
      Object.assign(heading.style,{fontSize:`${measuredSize}px`,paddingRight:'0'});
    }
    probe.querySelector('.event-scene-extra')?.remove();
    probe.querySelector('.event-header-actions')?.remove();
    if(projectArticle){probe.querySelector('[data-project-summary]')?.remove();prepareCreditMeasurement(probe,true);}
    else prepareEventMetadataMeasurement(probe);
    shell.appendChild(probe);document.body.appendChild(shell);
    setCompactHeight(parts.info.y+probe.getBoundingClientRect().height+20);
    shell.remove();
  },[projectArticle,active,mobile,frame.width,parts.info.width,parts.info.y,parts.fontSize,event.title,event.author?.name,event.author?.role,locale]);
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => {
      if (!alive || !titleRef.current) return;
      if(preparingEntrance){setFontSize(initialParts.fontSize);return;}
      if (!active || mobile || phase === 'closing') { const size=projectArticle && articleLayout && mobile && phase !== 'closing' ? 48 : parts.fontSize; setFontSize(phase==='closing'?size:fittedTitleSize(event.title,parts.info.width,size,getComputedStyle(titleRef.current).fontFamily,projectArticle?'project':'event')); return; }
      if (projectArticle) {
        // Landscape covers free horizontal space; don't force the author and title
        // into the much shorter image height.
        setFontSize(fitProjectTitle(event.title,parts.info.width-40,60,getComputedStyle(titleRef.current).fontFamily));
      } else setFontSize(fittedTitleSize(event.title,parts.info.width-40,60,getComputedStyle(titleRef.current).fontFamily));
    };
    fit(); document.fonts?.ready.then(fit);
    const observer=new ResizeObserver(fit);
    for(const node of infoRef.current?.querySelectorAll('[data-event-part="date"],.event-location,.event-article-links')||[])observer.observe(node);
    return () => {alive=false;observer.disconnect();};
  },[active,mobile,event.title,parts.info.width,parts.fontSize,phase]);
  useLayoutEffect(() => {
    if (active && active !== wasActive.current && scrollRef.current) scrollRef.current.scrollTop=0;
    wasActive.current=active;
    if (active) onContent(scrollRef.current);
  },[active,onContent]);
  useLayoutEffect(()=>{
    if(previousLayout.current.active===active&&!desktopPath) previousLayout.current.parts={...previousLayout.current.parts,fontSize};
  },[fontSize,desktopPath,active]);
  useLayoutEffect(()=>{
    const measure=()=>{
      const scene=eventScene({width:window.innerWidth,height:window.innerHeight});
      const width=cardParts(scene.main,scene.mobile,true).info.width;
      const context=document.createElement('canvas').getContext('2d');
      const date=infoRef.current?.querySelector('[data-event-part="date"]');
      const location=infoRef.current?.querySelector('.event-location');
      if(!date||!location)return;
      const fits=(node,text,allowance=0)=>{const css=getComputedStyle(node);context.font=`${css.fontWeight} ${scene.mobile?14:16}px ${css.fontFamily}`;return context.measureText(text).width+allowance>width;};
      setMetadataWrap({date:fits(date,date.textContent),location:fits(location,event.location,25)});
    };
    measure();document.fonts?.ready.then(measure);window.addEventListener('resize',measure);
    return()=>window.removeEventListener('resize',measure);
  },[locale,event.id,mobile,articleLayout]);
  const creditOffset = 0;
  const headerHeight = projectArticle && active && !mobile ? parts.headerHeight : (mobile || !active) ? (mobileEvent ? parts.info.y+infoHeight : Math.max(parts.cover.y+parts.cover.height,parts.info.y + creditOffset + infoHeight)) : Math.max(parts.headerHeight,parts.info.y+infoHeight);
  const compactPreview = !active && !fixedEventSize;
  const previewHeight = compactPreview ? compactHeight : frame.height;
  const displayFrame = preparingEntrance?initialFrame:compactPreview ? {...frame,height:previewHeight,y:frame.y+(frame.height-previewHeight)/2} : frame;
  const origin = initialParts || parts;
  const infoVisible = (mobile && phase!=='closing') || (phase==='closing'&&active&&Boolean(initialParts)) || (settledMobile === mobile && phase !== 'closing' && (mobile ? active : settled));
  const detailsVisible = phase==='open' && (fixedEventSize&&!projectArticle ? readingOpened.current : active&&settledMobile===mobile&&settled);
  const closingCopy=closingRequested&&returnOrigin?.copy;
  useEffect(()=>{
    if(active&&settled&&copyReady&&detailsVisible)onReady?.();
  },[active,settled,copyReady,detailsVisible,onReady]);
  const carouselMorph = Boolean(desktopPath);
  const creditVisible=active&&settled&&phase==='open'&&!desktopPath;
  const surfaceTransition = mobile&&closingRequested&&phase!=='closing' ? {...transition,duration:0} : transition;
  const hoverTransition = {duration:transition.duration?.3:0,ease:[.22,1,.36,1]};
  const appearanceTransition = carouselMorph||!settled?surfaceTransition:hoverTransition;
  const coverTransition = transition;
  const coverTarget = {...parts.cover,scaleY:1};
  // Fade the stationary cover before the shared card movement begins.
  const coverVisible = mobile&&closingRequested ? false : phase==='closing' || !mobileEvent && !preparingIncoming;
  const coverOpacityTransition = mobile&&closingRequested
    ? {duration:transition.duration?.24*motionRate:0,ease:[.4,0,.2,1]}
    : preparingIncoming
    ? {duration:prepareDuration,ease:[.4,0,.2,1]}
    : mobileEventCard && switchStage==='travel' && !active
      ? {...transition,delay:transition.duration*.6,duration:transition.duration*.4}
      : mobileEvent ? {...transition,duration:transition.duration*.25} : transition;
  const textPath=!mobile&&carouselMorph?textAroundCover(desktopPath.from,parts,desktopPath.entering):null;
  const infoTarget = textPath?{left:textPath.left,top:textPath.top,width:parts.info.width,height:'auto'}:{left:parts.info.x,top:parts.info.y+creditOffset,width:parts.info.width,height:'auto'};
  infoTarget.minHeight=0;
  const mobileReturning=mobile&&active&&phase==='closing'&&Boolean(returnOrigin);
  if(mobileReturning){
    // The scroll reset happens in the closing layout. Explicit start positions
    // retain the header's visible position instead of popping it back to top.
    infoTarget.left=[returnOrigin.info.x,parts.info.x];
    infoTarget.top=[returnOrigin.info.y,parts.info.y];
    infoTarget.width=[returnOrigin.info.width,parts.info.width];
  }
  // Start at rest instead of inheriting the carousel's fast ease-out kick.
  const mobileTitleTransition = {...transition,ease:MOBILE_TITLE_EASE,duration:transition.duration*MOBILE_TITLE_PROGRESS};
  const infoTransition=mobileReturning ? surfaceTransition : mobileEventCard ? mobileTitleTransition : textPath?{...transition,left:{duration:transition.duration,ease:'linear',times:textPath.times},top:{duration:transition.duration,ease:'linear',times:textPath.times}}:surfaceTransition;
  // Every card shares one progress curve for its left and right edges.
  // With disjoint start/end frames this preserves the gap throughout the move.
  const surfaceWidth = displayFrame.width;
  const reveal = show => ({ opacity: show ? 1 : 0, y: show ? 0 : mobile ? 14 : -10, clipPath: mobile ? 'none' : show ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' });
  const revealTiming = show => ({duration:show && transition.duration ? .24 * motionRate : 0,ease:[.22,1,.36,1]});
  const gridMetadata=initialParts?.metadata;
  const matchingGridMetadata=gridMetadata&&(preparingEntrance||phase==='closing');
  const metadataFont=matchingGridMetadata?gridMetadata.fontSize:mobile?14:articleLayout?16:13;
  const metadataStyle=!projectArticle?{
    '--event-meta-font-size':`${metadataFont}px`,
    '--event-meta-icon-size':`${matchingGridMetadata?gridMetadata.iconSize:mobile?16:articleLayout?17:15}px`,
    '--event-meta-line-height':`${matchingGridMetadata?gridMetadata.lineHeight:metadataFont*1.5}px`,
    '--event-meta-gap':`${matchingGridMetadata?gridMetadata.gap:8}px`,
  }:{};
  const metadataRow=(height)=>({
    initial:initialFrame&&gridMetadata?{minHeight:height}:false,
    animate:{minHeight:matchingGridMetadata?height:0},transition:surfaceTransition,
  });
  return <EventCard event={event} state={phase==='closing'?(returnArrived?'grid':'returning'):active?(mobile?'open-mobile':'open-desktop'):'preview'} morph={false}
    data-scene-card data-full-size={fixedEventSize} data-switch-stage={switchStage} data-article-kind={event.articleKind} data-morphing={Boolean(carouselMorph)} data-settled={settled} data-exiting={exiting} data-slot={slot} data-active={active} data-phase={phase}
    className="event-scene-card" ref={node => {if(active) onSurface(node);}}
    role={active?'dialog':'button'} aria-modal={active?true:undefined}
    aria-labelledby={active?`event-title-${sceneId}`:undefined}
    aria-label={active?undefined:`${projectArticle ? (de?'Projekt öffnen':'Open project') : (de?'Event öffnen':'Open event')}: ${event.title}`}
    aria-hidden={!visible} tabIndex={visible?0:-1}
    initial={initialFrame ? {...initialFrame,opacity:1,boxShadow:'0 0px 0px rgba(0,0,0,0)',...(gridMetadata?{'--event-meta-font-size':`${gridMetadata.fontSize}px`,'--event-meta-icon-size':`${gridMetadata.iconSize}px`,'--event-meta-line-height':`${gridMetadata.lineHeight}px`,'--event-meta-gap':`${gridMetadata.gap}px`}:{})} : fixedEventSize ? {...displayFrame,opacity:0} : false}
    animate={{...displayFrame,width:surfaceWidth,...metadataStyle,'--event-mask-x':`${-displayFrame.x}px`,boxShadow:phase==='closing'&&active&&initialParts?initialParts.surfaceShadow:mobile&&!active?'0 0px 0px rgba(0,0,0,0)':mobile?'0 8px 24px rgba(0,0,0,.10)':'0 20px 50px rgba(0,0,0,.2)',opacity:phase==='closing'&&active?(returnArrived?0:1):mobile&&phase==='closing'?0:!active&&!previewsReady?0:mobile?1:visible?(mobile||active?1:emphasized?.95:.75):0,filter:mobile||active?'blur(0px)':projectArticle?(mobile?'blur(1px)':'blur(.6px)'):'blur(1.5px)'}}
    transition={{...surfaceTransition,scale:surfaceTransition,opacity:phase==='closing'&&active?{...transition,delay:0,duration:transition.duration ? .14 : 0}:appearanceTransition,filter:surfaceTransition}} onAnimationComplete={finishMotion}
    style={{minWidth:!mobile&&phase!=='closing'?(projectArticle?PROJECT_PREVIEW_WIDTH:220):undefined,zIndex:active?3:2,pointerEvents:visible?'auto':'none'}}
    onPointerEnter={e=>{if(!active&&e.pointerType!=='touch')onHover(Math.sign(slot));}}
    onPointerLeave={()=>onHover(0)}
    onClick={e=>{e.stopPropagation();if(!active)onSelect();}}
    onKeyDown={e=>{if(!active&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect();}}}
  >
    <motion.div className="event-scene-material" aria-hidden="true"
      initial={initialFrame?{opacity:1}:false}
      animate={{opacity:preparingEntrance||phase==='closing'&&active?1:.5}}
      transition={surfaceTransition}/>
    <motion.div className="event-scene-stroke" aria-hidden="true"
      initial={initialFrame?{opacity:0}:false}
      animate={{opacity:preparingEntrance||phase==='closing'&&active?0:1}}
      transition={surfaceTransition}/>
    <motion.div ref={scrollRef} className="event-scene-scroll" inert={!active?true:undefined}
      initial={false} animate={{opacity:mobile&&!active?.72:1,filter:mobile&&!active?'blur(1.5px)':'blur(0px)'}} transition={surfaceTransition}
      onTouchStart={active?onGesture.start:undefined} onTouchEnd={active?onGesture.end:undefined} onTouchCancel={active?onGesture.cancel:undefined}
    >
      <EventCardHeader scene
        headerProps={{initial:false,animate:{height:fullSizeExit?exitReading.top:headerHeight},transition:{duration:0}}}
        coverProps={{initial:initialParts?origin.cover:false,animate:{...coverTarget,opacity:coverVisible?1:0},transition:{...coverTransition,opacity:coverOpacityTransition}}}
        badgeProps={{style:{position:'absolute',transform:'translateX(-100%)',margin:0,zIndex:2,pointerEvents:'none'},initial:initialParts?{left:origin.cover.x+origin.cover.width-16,top:origin.cover.y+16}:false,animate:{left:coverTarget.x+coverTarget.width-16,top:coverTarget.y+16,opacity:coverVisible?1:0},transition:{...coverTransition,opacity:coverOpacityTransition}}}
        infoProps={{ref:infoRef,style:{'--project-header-height':`${parts.cover.height}px`},initial:initialParts?{left:origin.info.x,top:origin.info.y,width:origin.info.width}:false,animate:infoTarget,transition:infoTransition}}
        titleBlockProps={{initial:initialParts?{minHeight:origin.titleHeight||0}:false,animate:{minHeight:preparingEntrance||phase==='closing'?origin.titleHeight||0:0,height:projectArticle&&active&&!mobile&&!preparingEntrance&&phase!=='closing'?Math.max(0,parts.cover.height-48):'auto',paddingBottom:projectArticle&&active&&!mobile&&!preparingEntrance&&phase!=='closing'?16:0},transition}}
        titleProps={{titleRef,id:`event-title-${sceneId}`,from:carouselMorph?{width:desktopPath.from.info.width,fontSize:desktopPath.from.fontSize,padding:desktopPath.entering||mobile?0:40}:initialParts&&firstEntrance.current&&!settled?{width:origin.info.width,fontSize:origin.fontSize,padding:0}:null,to:{width:parts.info.width,fontSize,padding:active&&!mobile&&phase!=='closing'?40:0},transition}}>
        {projectArticle && <motion.div data-project-summary aria-hidden="true" inert initial={initialFrame?{opacity:1,height:'auto'}:false}
          animate={{opacity:0,height:preparingEntrance?'auto':0}} transition={{height:{duration:0},opacity:{duration:transition.duration?.12:0}}}
          style={{overflow:'hidden',pointerEvents:'none'}}><ProjectCardSummary project={event} onClick={()=>{}}/></motion.div>}
        <motion.div className="event-scene-meta"
          initial={!projectArticle&&initialFrame&&gridMetadata?{marginTop:gridMetadata.marginTop}:false}
          animate={!projectArticle?{marginTop:matchingGridMetadata?gridMetadata.marginTop:16}:undefined} transition={surfaceTransition}>
          {projectArticle ? <ProjectContributors animated transition={transition} contributors={event.contributors} compact={!active} flush={projectArticle&&!mobile} returning={closingRequested} entering={Boolean(initialFrame)&&firstEntrance.current}/>
            : <EventCardMetadata event={event} locale={locale} dateWrap={firstEntrance.current?true:metadataWrap.date} locationWrap={firstEntrance.current?true:metadataWrap.location}
              dateProps={metadataRow(gridMetadata?.dateHeight||0)} locationProps={metadataRow(gridMetadata?.locationHeight||0)}/>}
        </motion.div>
        {!mobile && hasActions && <motion.div className="event-article-links event-header-actions"
          aria-hidden={!detailsVisible} inert={!detailsVisible?true:undefined}
          initial={false} animate={{opacity:detailsVisible?1:0}} transition={{duration:detailsVisible?.18:0}}
          style={{height:articleLayout&&phase!=='closing'?'auto':0,marginTop:articleLayout&&phase!=='closing'?20:0,overflow:'hidden',pointerEvents:detailsVisible?'auto':'none'}}>
          {actions}
        </motion.div>}
      </EventCardHeader>
      <motion.div onAnimationComplete={()=>{if(detailsVisible)setCopyReady(true);}} className="event-article-copy" data-exiting={exiting} style={{visibility:closingCopy||(articleLayout||exiting)&&phase!=='closing'?'visible':'hidden',pointerEvents:detailsVisible&&!closingRequested?'auto':'none',width:closingCopy?closingCopy.width:exiting?exitReading.width:undefined,maxWidth:'none',...(closingCopy?{position:'absolute',left:closingCopy.x,top:closingCopy.y-(phase==='closing'?closingCopy.scroll:0)}:{})}} initial={fixedEventSize?false:reveal(false)} animate={closingRequested?{opacity:0,y:0,clipPath:'none'}:fixedEventSize&&!projectArticle&&detailsVisible?{opacity:1,y:0,clipPath:'none'}:exiting?{opacity:[1,1,0],y:[0,0,10],clipPath:'none'}:reveal(detailsVisible)} transition={closingRequested?{duration:transition.duration?.26*motionRate:0,ease:[.4,0,.2,1]}:exiting?{duration:transition.duration,times:[0,.85,1],ease:'linear'}:{duration:transition.duration&&detailsVisible?.22*motionRate:0,ease:[.22,1,.36,1]}}>
            {visited.current && <>
            {projectArticle && <ProjectArticleDate date={event.publishedDate}/>}
            <article className={styles["project-article"]}>
              <ReactMarkdown>{event.content}</ReactMarkdown>
            </article>
            {projectArticle && <ProjectArticleDate date={event.publishedDate} mobileFooter/>}
          {mobile && hasActions && <motion.div className="event-scene-extra" style={{display:articleLayout||fullSizeExit?'block':'none',pointerEvents:carouselMorph||phase==='closing'?'none':undefined}} initial={false} animate={{opacity:phase!=='closing'&&(fixedEventSize||!carouselMorph&&infoVisible)?1:0}} transition={revealTiming(!carouselMorph&&infoVisible)}>
            <div className="event-article-links">{actions}</div>
          </motion.div>}
            {(photos.length > 1 || mobileEventCard) && (
              <section className="event-gallery">
                {photos.length > 1 && <h3>{de ? "Einblicke" : "In pictures"}</h3>}
                <EventPhotoGrid
                  key={`${event.id}-${event.galleryFocus || ''}-${mobileEventCard}`}
                  initialPhoto={mobileEventCard?undefined:event.galleryFocus}
                  photos={mobileEventCard ? photos : photos.slice(1)}
                  de={de} enabled={active&&!mobile}
                  category={mobileEvent ? event.category : undefined}
                  coverReady={!mobileEvent || (settled||fixedEventSize)&&(phase==='open'||closingRequested)}
                />
              </section>
            )}
            </>}
      </motion.div>
    </motion.div>
    {active && <>
      {mobile ? <motion.button initial={{opacity:0}} animate={{opacity:phase==='closing'?0:settled?1:0}} transition={{duration:transition.duration?phase==='closing'?.08:.18:0}} style={{pointerEvents:phase==='closing'?'none':'auto'}} className="event-scene-handle" aria-label={de?'Artikel schließen':'Close article'} onClick={onClose}
        onTouchStart={onGesture.start} onTouchEnd={onGesture.end} onTouchCancel={onGesture.cancel}
        onPointerDown={onGesture.handleStart} onPointerMove={onGesture.handleMove} onPointerUp={onGesture.handleEnd} onPointerCancel={onGesture.handleCancel}
        onClickCapture={onGesture.handleClick}><span/></motion.button>
        : <motion.button className="event-modal-close" aria-label={de?'Artikel schließen':'Close article'} onClick={onClose}
          initial={{opacity:0}} animate={{opacity:phase!=='closing'&&settled?1:0}}
          transition={{duration:transition.duration ? phase==='closing'?.08*motionRate:.18*motionRate:0,delay:phase!=='closing'&&settled&&transition.duration?.1:0}}
          style={{pointerEvents:phase!=='closing'&&settled?'auto':'none'}}
          tabIndex={phase!=='closing'&&settled?0:-1}><X size={22}/></motion.button>}
    </>}
  </EventCard>;
}
