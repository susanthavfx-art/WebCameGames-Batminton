// Shared, renderer-independent court geometry and shot rules.
export const CONTACT = {player: .115, bot: .855, height: 2.45, reach: .21};
export const SWING_DURATION = .5;
export const AI = {
  casual: {speed: .34, reaction: .34, error: .09, flight: 1.7},
  club: {speed: .53, reaction: .23, error: .05, flight: 1.45},
  pro: {speed: .76, reaction: .14, error: .025, flight: 1.25},
};
export const clamp = (x, lo=-1, hi=1) => Math.max(lo, Math.min(hi, x));
export function shotTarget(x, direction) {
  // A neutral stroke goes straight. Left/right strokes change the landing lane,
  // independent of the opponent's location. Never secretly steer toward the bot.
  return clamp(x + clamp(direction) * 1.55, -.87, .87);
}
export function makeFlight(x, z, destination, outgoing, duration, id=0) {
  return {x, z, y: CONTACT.height, startX:x, startZ:z, targetX:destination,
    targetZ:outgoing?CONTACT.bot:CONTACT.player, elapsed:0, duration,
    vz:outgoing?1:-1, id};
}
export function advanceFlight(s, dt) {
  s.elapsed=Math.min(s.duration,s.elapsed+dt);
  const t=s.elapsed/s.duration;
  s.x=s.startX+(s.targetX-s.startX)*t;
  s.z=s.startZ+(s.targetZ-s.startZ)*t;
  s.y=CONTACT.height+Math.sin(Math.PI*t)*1.35;
  if(t>=1){s.x=s.targetX;s.z=s.targetZ;s.y=CONTACT.height;}
  return t>=1;
}
export function canReturn(s, playerX, swingActive) {
  return swingActive && s.elapsed>=s.duration && Math.abs(s.x-playerX)<=CONTACT.reach;
}
export function moveBot(botX, targetX, elapsed, dt, difficulty) {
  const config=AI[difficulty];
  if(elapsed<config.reaction)return botX;
  return clamp(botX+clamp(targetX-botX,-config.speed*dt,config.speed*dt),-.9,.9);
}
export function worldContact(x,z){return {x:x*3.05,y:CONTACT.height,z:6.7-z*13.4};}
