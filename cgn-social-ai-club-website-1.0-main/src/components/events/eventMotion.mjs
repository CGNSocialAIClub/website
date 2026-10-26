// Geometry is shared by the live carousel, its motion study and regression tests.
export const ARTICLE_DESKTOP_MIN_WIDTH = 1280;
export const PROJECT_PREVIEW_WIDTH = 300;
export const MOBILE_CARD_GAP = 8;
export const EVENT_MOTION = { duration: .38, ease: [.65, 0, .35, 1] };
// One timeline owns the mobile event hand-off; layout stays unchanged during prepare.
export function mobileEventTimeline(duration) {
  return { prepare: duration * .18, travel: duration * .82 };
}
export const wrap = (index, count) => ((index % count) + count) % count;
export function ringSlot(index, selected, count, direction = 1) {
  let distance = wrap(index - selected, count);
  if (distance > count / 2 || (distance === count / 2 && direction < 0)) distance -= count;
  return distance;
}
export function eventScene({ width, height, top = 112, expanded = false, hover = 0, projectArticle = false, pickerHeight = 74, pickerBottom = 18 }) {
  const mobile = width < ARTICLE_DESKTOP_MIN_WIDTH;
  const bottom = mobile ? pickerHeight + pickerBottom + MOBILE_CARD_GAP : 24;
  const available = Math.max(180, height - top - bottom - 12);
  const mainWidth = mobile ? Math.min(520, width - 32) : Math.min(960, width - 144);
  const mainHeight = mobile ? Math.min(expanded ? available : height * (projectArticle ? .66 : .74), available) : Math.min(780, available);
  const centerY = mobile ? height - bottom - mainHeight / 2 : top + (height - top) / 2;
  const main = { x: (width - mainWidth) / 2, y: centerY - mainHeight / 2, width: mainWidth, height: mainHeight, scale: 1 };
  const previewWidth = mobile ? (projectArticle ? mainWidth : Math.min(380,mainWidth)) : projectArticle ? PROJECT_PREVIEW_WIDTH : 220;
  const previewHeight = mobile ? mainHeight : 398;
  const gap = mobile ? MOBILE_CARD_GAP : 72;
  const previewsVisible = !mobile || width - main.x - mainWidth - gap >= 80;
  const fixedEventSize = mobile && !previewsVisible;
  const side = (direction) => {
    if (fixedEventSize) return {...main,x:main.x + direction * (mainWidth + gap)};
    const scaleInset=mobile?previewWidth*(1-.73)/2:0;
    return { x: direction < 0 ? main.x - gap - previewWidth + scaleInset : main.x + mainWidth + gap - scaleInset, y: centerY - previewHeight / 2, width: previewWidth, height: previewHeight, scale: mobile ? .73 : !projectArticle && hover === direction ? 1.02 : 1 };
  };
  return { mobile, main, side, centerY, gap, width, height, fixedEventSize };
}
export function slotGeometry(scene, slot) {
  if (!slot) return scene.main;
  const direction = Math.sign(slot);
  const side = scene.side(direction);
  return { ...side, x: side.x + direction * (Math.abs(slot) - 1) * (side.width + scene.gap) };
}
// Centre the complete source card, independent of its current visibility.
export function centeredCardScroll({scrollY,cardTop,cardHeight,viewportHeight,maxScroll}) {
  return Math.max(0,Math.min(maxScroll,scrollY+cardTop+cardHeight/2-viewportHeight/2));
}
export function arrowGeometry(scene, direction) {
  const side = scene.side(direction);
  const growth = side.width * (side.scale - 1) / 2;
  return { x: (direction < 0 ? side.x + side.width + growth + scene.main.x : scene.main.x + scene.main.width + side.x - growth) / 2 - 22, y: scene.centerY - 22 };
}
export function cardParts(frame, mobile, active, projectArticle = false) {
  const pad = active ? (mobile ? 24 : 32) : 20;
  const mobileEvent = mobile && active && !projectArticle;
  const size = mobileEvent ? frame.width - 40 : active && !mobile ? (projectArticle ? Math.min(224, Math.max(180, frame.width * .24)) : Math.min(288, Math.max(220, frame.width * .31))) : !mobile ? Math.min(224,frame.width-pad*2) : frame.width - pad * 2;
  const stacked = (mobile && projectArticle) || !active;
  const coverHeight = projectArticle ? size * 10 / 16 : size;
  return {
    cover: { borderRadius:16, x: mobileEvent ? 20 : pad, y: mobileEvent ? 20 : pad, width: size, height: coverHeight },
    info: { x: mobileEvent ? pad : stacked ? pad : pad + size + (mobileEvent ? 16 : 28), y: stacked ? pad + coverHeight + 22 : pad, width: mobileEvent || stacked ? frame.width - pad * 2 : frame.width - size - pad * 2 - (mobileEvent ? 16 : 28) },
    fontSize: mobileEvent ? 36 : active ? (mobile ? 36 : 56) : projectArticle ? 30 : Math.min(26, Math.floor((frame.width - pad * 2) * 26 / 224)),
    headerHeight: stacked ? pad + coverHeight + 22 : pad + coverHeight,
  };
}
export function sheetRelease({ distance, cancelled = false }) {
  if (cancelled || distance < 70) return 'restore';
  return 'close';
}

// Repeated identities live at different track positions. An offscreen copy can
// enter from the right while the previous copy of that item exits on the left.
export function repeatedCarouselSlots(count, anchor, position, radius = 3) {
  return Array.from({ length: radius * 2 + 1 }, (_, i) => {
    const ordinal = position + i - radius;
    return { index: wrap(anchor + ordinal, count), ordinal, slot: ordinal - position };
  });
}

// At the top of the article, pulling beyond the reading boundary dismisses
// directly from either sheet height.
export function mobileSheetRelease({distance,velocity=0,expanded=false,cancelled=false}) {
  if(cancelled || distance<=0)return 'restore';
  const projected=distance+Math.max(0,velocity)*180;
  if(!expanded)return distance>=40 || (distance>=18 && projected>=80)?'close':'restore';
  return distance>=18 || projected>=45?'close':'restore';
}

// A drag moves continuously between the main-card and preview scale.
export function swipeCardScale(scene, slot, dragX) {
  if (scene.fixedEventSize) return 1;
  const progress = Math.min(1, Math.abs(dragX) / (scene.main.width + scene.gap));
  if (!scene.mobile) return slot === 0 ? 1 - .06 * progress : scene.side(Math.sign(slot)).scale;
  const distance = Math.min(1, Math.abs(slot + dragX / (scene.main.width + scene.gap)));
  return 1 - (1 - scene.side(1).scale) * distance;
}

// Project the final finger velocity instead of requiring the same travel for
// a deliberate flick and a slow drag. A cancelled gesture always snaps back.
export function articleSwipeRelease({distance, velocity = 0, width, cancelled = false}) {
  const projected = distance + velocity * 180;
  const threshold = Math.min(110, width * .25);
  const step = !cancelled && Math.abs(distance) >= 12 && Math.abs(projected) >= threshold
    ? projected < 0 ? 1 : -1 : 0;
  return {step, velocity: cancelled ? 0 : velocity * 1000};
}
