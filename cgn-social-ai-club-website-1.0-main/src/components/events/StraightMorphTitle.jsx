import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TITLE_LAYOUT, balanceTitleLines, fitTitleFont } from './titleLayout.mjs';

const cache=new Map();
export function titleComposition(text,fontFamily,kind='event') {
  const key=`${document.fonts?.status}|${kind}|${fontFamily}|${text}`;
  if(cache.has(key))return cache.get(key);
  const context=document.createElement('canvas').getContext('2d');
  const base=TITLE_LAYOUT[kind];context.font=`700 ${base.fontSize}px ${fontFamily}`;
  const measure=value=>context.measureText(value).width;
  const lines=balanceTitleLines(text,measure);
  const result={lines,measure,baseSize:base.fontSize,width:Math.max(1,...lines.map(measure))};
  cache.set(key,result);return result;
}
export function fixedTitleLines(text,fontFamily,kind='event',scene=false) {
  if(kind==='project'&&!scene)return [text];
  return titleComposition(text,fontFamily,kind).lines;
}
export function fittedTitleSize(text,width,size,family,kind='event') {
  const composition=titleComposition(text,family,kind);
  return fitTitleFont(composition.lines,composition.measure,composition.baseSize,width,size);
}

// Project titles stay 30px and wrap naturally; event lines remain stable during motion.
export default function StraightMorphTitle({text,kind='event',from,to={fontSize:30,padding:0},transition,titleRef,id,as='h2',className}) {
  const localRef=useRef(null);
  const [composition,setComposition]=useState({text,kind,lines:[text]});
  const lines=composition.text===text&&composition.kind===kind?composition.lines:[text];
  useLayoutEffect(()=>{
    let alive=true;
    const compose=()=>{if(alive&&localRef.current)setComposition({text,kind,lines:fixedTitleLines(text,getComputedStyle(localRef.current).fontFamily,kind,as!=='h3')});};
    compose();document.fonts?.ready.then(compose);
    return()=>{alive=false;};
  },[text,kind,as]);
  const targetSize=kind==='project'&&as==='h3'?30:to.fontSize;
  const Element=as==='h3'?motion.h3:motion.h2;
  return <Element className={className} ref={node=>{localRef.current=node;if(titleRef)titleRef.current=node;}} id={id} data-event-part="title" aria-label={text}
    initial={from?{fontSize:from.fontSize,'--morph-title-padding':`${from.padding||0}px`}:false}
    animate={{fontSize:targetSize,'--morph-title-padding':`${to.padding||0}px`}} transition={transition}
    style={{position:'relative',fontSize:targetSize,paddingRight:'var(--morph-title-padding,0px)'}}>
    {lines.map((line,i)=><span key={i} style={{display:'block',whiteSpace:kind==='project'&&as==='h3'?'normal':'nowrap'}}>{line}</span>)}
  </Element>;
}
