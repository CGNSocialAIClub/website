import OptimizedImage from '../ui/OptimizedImage.jsx';
import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';

export default function EventPhotoViewer({ photos, initialPhoto, topInset, onClose }) {
  const { locale } = useLocale();
  const de = locale === 'de';
  const reduceMotion = useReducedMotion();
  const [closeRight,setCloseRight] = useState(24);
  useLayoutEffect(()=>{
    const navbar=document.querySelector('.navbar-surface');
    const measure=()=>{const edge=navbar?.getBoundingClientRect().right;setCloseRight(edge?Math.max(24,window.innerWidth-edge+16):24);};
    measure();const observer=new ResizeObserver(measure);if(navbar)observer.observe(navbar);
    window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[]);
  const [photo,setPhoto] = useState(initialPhoto);
  const [entered,setEntered]=useState(false);
  const [closing,setClosing]=useState(false);
  const [destination,setDestination]=useState(null);
  const sourceRect=index=>{
    const node=document.querySelector(`.event-scene-card[data-active="true"] [data-photo-index="${index}"]`);
    const rect=node?.getBoundingClientRect();
    return rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null;
  };
  const origin=useRef(sourceRect(initialPhoto));
  const requestClose=()=>{if(closing)return;setDestination(sourceRect(photo)||origin.current);setClosing(true);};
  useEffect(()=>{
    if(!closing)return;
    const timer=setTimeout(onClose,reduceMotion?0:460);
    return()=>clearTimeout(timer);
  },[closing,onClose,reduceMotion]);
  const [photoDirection,setPhotoDirection] = useState(1);
  const changePhoto = (direction) => {setPhotoDirection(direction);setPhoto(index => (index+direction+photos.length)%photos.length);};
  const photoStage = useRef(null);
  const activePhoto = useRef(null);
  const [photoWidth, setPhotoWidth] = useState(0);
  const [photoHeight, setPhotoHeight] = useState(0);
  const measurePhoto = () => {
    const stage = photoStage.current;
    const image = activePhoto.current;
    if (stage && image?.naturalHeight) {
      const availableWidth = stage.clientWidth * (window.innerWidth < 768 ? .84 : .60);
      const availableHeight = Math.min(680,stage.clientHeight*.8);
      const ratio=photos[photo]?.aspectRatio || image.naturalWidth/image.naturalHeight;
      const width = Math.min(960,availableWidth,availableHeight*ratio);
      setPhotoWidth(width);
      setPhotoHeight(width / ratio);
    }
  };
  useEffect(() => {
    if (photo === null || !photoStage.current) return;
    const observer = new ResizeObserver(measurePhoto);
    observer.observe(photoStage.current);
    measurePhoto();
    return () => observer.disconnect();
  }, [photo]);
  useEffect(() => {
    const keys = e => {
      if (e.key === 'Tab') {
        const nodes = [...document.querySelectorAll('[data-lightbox] button')].filter(node => !node.disabled);
        const first=nodes[0],last=nodes.at(-1);
        if (e.shiftKey && document.activeElement===first) {e.preventDefault();last.focus();}
        else if (!e.shiftKey && document.activeElement===last) {e.preventDefault();first.focus();}
      }
      if (e.key === 'Escape') { e.stopImmediatePropagation(); requestClose(); }
      if (e.key === 'ArrowLeft') { e.stopImmediatePropagation(); changePhoto(-1); }
      if (e.key === 'ArrowRight') { e.stopImmediatePropagation(); changePhoto(1); }
    };
    window.addEventListener('keydown',keys,true);
    return () => window.removeEventListener('keydown',keys,true);
  },[onClose,photo,closing]);
  return createPortal(
          <motion.div
            initial={{opacity:0,backdropFilter:'blur(0px)'}} animate={{opacity:closing?0:1,backdropFilter:closing?'blur(0px)':'blur(8px)'}} transition={{duration:reduceMotion?0:.45}}
            className="event-lightbox"
            data-lightbox
            style={{ top: 0, paddingTop: topInset + 76, "--lightbox-close-right":`${closeRight}px`, "--lightbox-close-top": `${topInset + 12}px`, "--photo-width": `${photoWidth}px`, "--photo-height": `${photoHeight}px` }}
            role="group"
            aria-label={de ? "Bildergalerie" : "Photo gallery"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="event-modal-close"
              aria-label={de ? "Bild schließen" : "Close image"}
              onClick={requestClose}
            >
              <X />
            </button>
            <motion.div
              ref={photoStage}
              className="event-lightbox-stage"
              style={{opacity:1}}
              drag={photos.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 450)
                  changePhoto(info.offset.x < 0 ? 1 : -1);
              }}
            >
              {photos.map((image, index) => {
                let position = (index - photo + photos.length) % photos.length;
                if (position > photos.length / 2 || (position === photos.length / 2 && photoDirection < 0)) position -= photos.length;
                const current = position === 0;
                return (
                  <motion.div
                    key={image.src}
                    className="event-carousel-photo"
                    style={{ zIndex: current ? 2 : 1 }}
                    initial={index===initialPhoto&&origin.current?{x:origin.current.left+origin.current.width/2-window.innerWidth/2,y:origin.current.top+origin.current.height/2-(topInset+76+(window.innerHeight-topInset-76-40-38)/2),width:origin.current.width,height:origin.current.height,scale:1,opacity:1}:false}
                    animate={{
                      x:closing&&current&&destination?destination.left+destination.width/2-window.innerWidth/2:position*(photoWidth+36),
                      y:closing&&current&&destination?destination.top+destination.height/2-((photoStage.current?.getBoundingClientRect().top||topInset+76)+(photoStage.current?.clientHeight||(window.innerHeight-topInset-116))/2):0,
                      width:closing&&current&&destination?destination.width:photoWidth||origin.current?.width||300,
                      height:closing&&current&&destination?destination.height:photoHeight||origin.current?.height||300,
                      scale: current ? 1 : .78,
                      opacity: Math.abs(position)>1?0:current?1:entered&&!closing?.3:0,
                      filter: current ? 'blur(0px)' : 'blur(1.5px)',
                    }}
                    transition={{ duration: reduceMotion ? 0 : .45, ease: [.65,0,.35,1] }}
                    onAnimationComplete={()=>{if(current&&!closing&&photoWidth>0)setEntered(true);}}
                    aria-hidden={!current}
                  >
                    <OptimizedImage
                      ref={current ? activePhoto : undefined}
                      onLoad={current ? measurePhoto : undefined}
                      src={image.src}
                      style={image.cropTop?{position:'absolute',left:0,top:`${-image.cropTop/(1-image.cropTop)*100}%`,width:'100%',height:`${100/(1-image.cropTop)}%`,maxHeight:'none',objectFit:'fill'}:undefined}
                      alt={current ? image.alt : ''}
                      draggable={false}
                    />
                    {image.credit && <span className="event-image-credit">© {image.credit}</span>}
                  </motion.div>
                );
              })}
            {photos.length > 1 && (
              <div className="event-lightbox-controls">
                <button
                  aria-label={de ? "Vorheriges Foto" : "Previous photo"}
                  onClick={() =>
                    changePhoto(-1)
                  }
                >
                  <ChevronLeft />
                </button>
                <span>
                  {photo + 1} / {photos.length}
                </span>
                <button
                  aria-label={de ? "Nächstes Foto" : "Next photo"}
                  onClick={() => changePhoto(1)}
                >
                  <ChevronRight />
                </button>
              </div>
            )}
            </motion.div>
          </motion.div>, document.body);
}
