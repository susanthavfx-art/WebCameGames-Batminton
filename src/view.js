// Kept independent of WebGL so camera framing and image cropping are testable.
export function cameraFrame(aspect, playerX=0, mode='eye') {
  const portrait=aspect<1;
  if(mode==='overview') return {x:0,y:portrait?5.8:3.8,z:portrait?20:13.8,lookX:0,lookY:1.25,lookZ:-.6,fov:48};
  const follow=playerX*3.05*(portrait?.35:.65);
  return {x:follow+(portrait?.65:1.15),y:2.15,z:portrait?14.5:10.2,lookX:follow,lookY:2.05,lookZ:-.6,fov:58};
}
export function coverCrop(imageAspect, viewportAspect) {
  const x=Math.min(1,viewportAspect/imageAspect),y=Math.min(1,imageAspect/viewportAspect);
  return {x,y,offsetX:(1-x)/2,offsetY:(1-y)/2};
}
export function missionProgress(score,longest,target,hasWon) {
  return [hasWon(score,0,target),score[0]>=7,longest>=5];
}
