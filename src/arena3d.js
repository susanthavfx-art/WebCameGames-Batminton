import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {SWING_DURATION, CONTACT} from './gameplay.js';
import {cameraFrame,coverCrop} from './view.js';

const asset = name => `${import.meta.env.BASE_URL}models/${name}`;
const V = (x,y,z) => new THREE.Vector3(x,y,z);

export function createArena(canvas, report) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#162b59');
  let stadiumTexture;
  let viewMode='eye',followX=0;
  function updateBackdrop(){if(!stadiumTexture)return;const crop=coverCrop(stadiumTexture.image.width/stadiumTexture.image.height,camera.aspect);stadiumTexture.repeat.set(crop.x,crop.y);stadiumTexture.offset.set(crop.offsetX,crop.offsetY);}
  function updateCamera(){const frame=cameraFrame(camera.aspect,followX,viewMode);camera.position.set(frame.x,frame.y,frame.z);camera.fov=frame.fov;camera.lookAt(frame.lookX,frame.lookY,frame.lookZ);camera.updateProjectionMatrix();}
  const camera = new THREE.PerspectiveCamera(48,1,.1,100);
  updateCamera();
  scene.add(new THREE.HemisphereLight(0xb6e5ff,0x41445c,2.5));
  const sun = new THREE.DirectionalLight(0xfff0d8,3);
  sun.position.set(-6,14,6); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.0003;scene.add(sun);
  const rim = new THREE.DirectionalLight(0x44aaff,2);rim.position.set(7,5,-7);scene.add(rim);
  const mat = (color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const mesh = (geometry,material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);return o};
  const box=(x,y,z,w,h,d,m)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const navy=mat('#122747'),steel=mat('#59769b',{metalness:.5}),blue=mat('#167aca');
  // The supplied stadium image replaces the old hall and oversized ground plane.
  const fallback = new THREE.Group();scene.add(fallback);
  const courtFloor=box(0,-.07,0,7.4,.12,14.4,blue);fallback.attach(courtFloor);
  // White service boxes match the simulation's normalized playing area.
  const chalk=mat('#e0f6ff');
  for(const x of [-3.05,-2.59,2.59,3.05])box(x,.012,0,.035,.012,13.4,chalk);
  for(const z of [-6.7,-5.94,-1.98,1.98,5.94,6.7])box(0,.012,z,6.1,.012,.035,chalk);
  for(const z of [-4.34,4.34])box(0,.012,z,.035,.012,4.72,chalk);
  const netGroup=new THREE.Group();scene.add(netGroup);
  for(const x of [-3.25,3.25]){const pole=box(x,.78,0,.08,1.56,.08,mat('#f5c85b'));netGroup.attach(pole)}
  const netPoints=[];
  for(let x=-3.25;x<=3.25;x+=.12)netPoints.push(x,.7,0,x,1.52,0);
  for(let y=.7;y<=1.52;y+=.1)netPoints.push(-3.25,y,0,3.25,y,0);
  const net=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(netPoints,3)),new THREE.LineBasicMaterial({color:'#bed6ed',transparent:true,opacity:.65}));netGroup.add(net);
  const tape=box(0,1.54,0,6.5,.055,.025,chalk);netGroup.attach(tape);
  const shuttle=new THREE.Group();scene.add(shuttle);
  const feather=new THREE.Mesh(new THREE.ConeGeometry(.14,.32,12,1,true),mat('#f7fcff',{side:THREE.DoubleSide}));feather.rotation.z=Math.PI;feather.position.y=.16;shuttle.add(feather);
  shuttle.add(new THREE.Mesh(new THREE.SphereGeometry(.065,10,8),mat('#e8faff',{emissive:'#43bfff',emissiveIntensity:.5})));
  const trailGeometry=new THREE.BufferGeometry();const trail=new THREE.Line(trailGeometry,new THREE.LineBasicMaterial({color:'#65ebff',transparent:true,opacity:.7}));scene.add(trail);const history=[];
  const loader=new GLTFLoader();
  // The uploaded court uses the retired spec/gloss extension. Preserve its diffuse textures.
  loader.register(parser=>({name:'KHR_materials_pbrSpecularGlossiness',beforeRoot(){for(const m of parser.json.materials||[]){const old=m.extensions?.KHR_materials_pbrSpecularGlossiness;if(old)m.pbrMetallicRoughness={baseColorFactor:old.diffuseFactor,baseColorTexture:old.diffuseTexture,metallicFactor:0,roughnessFactor:.8};}}}));
  let actors=[],ready=false,failed=false,contextLost=false;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;report('Graphics interrupted. Reload the page to restore 3D.',true)});
  const load=name=>loader.loadAsync(asset(name));
  function bounds(o){o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o,true)}
  function prepareRacket(source){const r=source.clone(true);const outer=new THREE.Group();outer.add(r);let b=bounds(r),size=b.getSize(V(0,0,0));if(size.z>size.y&&size.z>size.x)r.rotation.x=Math.PI/2;else if(size.x>size.y)r.rotation.z=Math.PI/2;b=bounds(r);size=b.getSize(V(0,0,0));r.scale.multiplyScalar(.88/size.y);b=bounds(r);const center=b.getCenter(V(0,0,0));r.position.sub(V(center.x,b.min.y,center.z));return outer;}
  function actor(source,racket,texture,isBot){const root=new THREE.Group();const model=clone(source);root.add(model);let b=bounds(model);model.scale.multiplyScalar(2.2/b.getSize(V(0,0,0)).y);b=bounds(model);const center=b.getCenter(V(0,0,0));model.position.sub(V(center.x,b.min.y,center.z));const bones={};model.traverse(o=>{if(o.isBone)bones[o.name.replace('mixamorig','').replace(':','')]={bone:o,rest:o.quaternion.clone()};if(o.isMesh){o.castShadow=true;o.frustumCulled=false;o.material=o.material.clone();o.material.map=texture;o.material.roughness=.85;}});
    root.rotation.y=isBot?0:Math.PI;scene.add(root);
    const ring=mesh(new THREE.RingGeometry(.48,.52,40),new THREE.MeshBasicMaterial({color:isBot?'#ff607b':'#37dcff',side:THREE.DoubleSide,transparent:true,opacity:.7}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;
    const r=prepareRacket(racket);scene.add(r);
    return {root,model,bones,racket:r,ring,previous:0,isBot};
  }
  async function init(){try{report('Loading your 3D models…');const [court,player,bat,texture,stadium]=await Promise.all([load('batminton_court.glb'),load('player_Blue.glb'),load('badminton_bat.glb'),new THREE.TextureLoader().loadAsync(asset('texture_player_Blue_512.png')),new THREE.TextureLoader().loadAsync(`${import.meta.env.BASE_URL}ui/stadium.png`)]);stadiumTexture=stadium;stadium.colorSpace=THREE.SRGBColorSpace;scene.background=stadium;updateBackdrop();texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
    const redCanvas=document.createElement('canvas');redCanvas.width=texture.image.width;redCanvas.height=texture.image.height;const rc=redCanvas.getContext('2d');rc.drawImage(texture.image,0,0);const pixels=rc.getImageData(0,0,redCanvas.width,redCanvas.height);for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];if(b>r*1.2&&b>g*1.08&&b>60){pixels.data[i]=b;pixels.data[i+1]=r*.8;pixels.data[i+2]=g*.7;}}rc.putImageData(pixels,0,0);const redTexture=new THREE.CanvasTexture(redCanvas);redTexture.colorSpace=THREE.SRGBColorSpace;redTexture.flipY=false;
    actors=[actor(player.scene,bat.scene,texture,false),actor(player.scene,bat.scene,redTexture,true)];
    const courtRoot=new THREE.Group();courtRoot.add(court.scene);const floor=court.scene.getObjectByName('Object_12');const floorBox=bounds(floor||court.scene),size=floorBox.getSize(V(0,0,0));courtRoot.scale.set(7.4/size.x,6.2,14.4/size.z);courtRoot.updateMatrixWorld(true);const scaled=bounds(floor||court.scene),center=scaled.getCenter(V(0,0,0));courtRoot.position.set(-center.x,-scaled.max.y-.006,-center.z);court.scene.traverse(o=>{if(o.isMesh){o.receiveShadow=true;if(o===floor)o.material=blue;}});scene.add(courtRoot);fallback.visible=false;netGroup.visible=false;
    ready=true;report('3D arena ready · Your models, in motion');
  }catch(error){failed=true;console.error('3D model loading failed',error);report('A 3D asset could not load. Reload to retry.',true)}}
  init();
  const offset=new THREE.Quaternion();
  function pose(a,x,z,t,swingEnd,dt,contact){const velocity=dt>0?(x-a.previous)/dt:0;a.previous=x;const movement=Math.min(1,Math.abs(velocity)*2);const stride=Math.sin(t*14)*movement;const p=Math.max(0,Math.min(1,1-(swingEnd-t)/SWING_DURATION));const hit=swingEnd>t?Math.sin(p*Math.PI):0;
    a.root.position.set(x*3.05,Math.abs(stride)*.045,z);a.ring.position.x=x*3.05;a.ring.position.z=z;
    const rotate=(name,rx=0,ry=0,rz=0)=>{const b=a.bones[name];if(!b)return;offset.setFromEuler(new THREE.Euler(rx,ry,rz));b.bone.quaternion.copy(b.rest).multiply(offset)};
    rotate('Spine',.04+Math.sin(t*2)*.012,hit*-.35,-velocity*.025);
    rotate('LeftArm',.08,0,-.95+hit*.25);rotate('RightArm',-.15-hit*1.8,hit*.4,.9-hit*1.5);
    rotate('LeftForeArm',-.25);rotate('RightForeArm',-.55-hit*.7);
    rotate('LeftUpLeg',stride*.36,0,-.1);rotate('RightUpLeg',-stride*.36,0,.1);
    rotate('LeftLeg',Math.max(0,-stride)*.4);rotate('RightLeg',Math.max(0,stride)*.4);
    for(const side of ['Left','Right'])for(const finger of ['Index','Thumb'])for(const n of [1,2,3])rotate(`${side}Hand${finger}${n}`,finger==='Index'?.65:.2);
    // Aim the uploaded Mixamo bones in world space; their local axes are not uniform.
    a.root.updateMatrixWorld(true);
    const aimBone=(name,childName,direction)=>{const b=a.bones[name]?.bone,c=a.bones[childName]?.bone;if(!b||!c)return;const current=c.getWorldPosition(V(0,0,0)).sub(b.getWorldPosition(V(0,0,0))).normalize();const delta=new THREE.Quaternion().setFromUnitVectors(current,direction.normalize());const desired=delta.multiply(b.getWorldQuaternion(new THREE.Quaternion()));const parent=b.parent.getWorldQuaternion(new THREE.Quaternion()).invert();b.quaternion.copy(parent.multiply(desired));a.root.updateMatrixWorld(true);};
    const forward=a.isBot?1:-1,side=a.isBot?-1:1;
    aimBone('LeftArm','LeftForeArm',V(-side*.5,-.8,forward*.12));
    aimBone('LeftForeArm','LeftHand',V(-side*.3,-.35,forward*.65));
    aimBone('RightArm','RightForeArm',V(side*.55,-.7+hit*1.65,forward*(.15-hit*.4)));
    aimBone('RightForeArm','RightHand',V(side*.25,.35+hit*.5,forward*(.8-hit*1.1)));
    const hand=a.bones.RightHand?.bone;
    if(hand){
      // At contact, solve shoulder/elbow/wrist to the SAME endpoint used by flight
      // physics. The racket string-bed center (0, .70, 0) meets the cork exactly.
      if(contact){
        const shoulder=a.bones.RightArm.bone,elbow=a.bones.RightForeArm.bone;
        const origin=shoulder.getWorldPosition(V(0,0,0));
        const ep=elbow.getWorldPosition(V(0,0,0)),hp=hand.getWorldPosition(V(0,0,0));
        const upper=origin.distanceTo(ep),lower=ep.distanceTo(hp);
        const end=V(contact.x,contact.y,contact.z);
        let direction=V(side*.2,.8,forward*.3).normalize();
        let grip=end.clone().addScaledVector(direction,-.70);
        if(grip.distanceTo(origin)>upper+lower-.005){direction=end.clone().sub(origin).normalize();grip=end.clone().addScaledVector(direction,-.70);}
        const axis=grip.clone().sub(origin),distance=axis.length();axis.normalize();
        const d=THREE.MathUtils.clamp(distance,Math.abs(upper-lower)+.001,upper+lower-.001);
        const along=(upper*upper-lower*lower+d*d)/(2*d);
        const bend=V(side,0,forward*.3);bend.addScaledVector(axis,-bend.dot(axis)).normalize();
        const elbowTarget=origin.clone().addScaledVector(axis,along).addScaledVector(bend,Math.sqrt(Math.max(0,upper*upper-along*along)));
        aimBone('RightArm','RightForeArm',elbowTarget.clone().sub(origin));
        aimBone('RightForeArm','RightHand',grip.clone().sub(elbow.getWorldPosition(V(0,0,0))));
        a.racket.quaternion.setFromUnitVectors(V(0,1,0),direction);
        a.racket.rotateY((contact.angle||0)*.65);
        a.racket.position.copy(grip);
      }else{
        hand.getWorldPosition(a.racket.position);
        a.racket.quaternion.setFromEuler(new THREE.Euler(hit*forward*1.2,a.isBot?Math.PI:0,-side*(.35+hit*1.3)));
      }
    }

  }
  let lastFlight=-1;
  const flash=mesh(new THREE.SphereGeometry(.13,12,8),new THREE.MeshBasicMaterial({color:'#bafaff',transparent:true,opacity:.8}));flash.visible=false;
  return {
    resize(w,h){renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);updateCamera();updateBackdrop()},
    setView(mode){viewMode=mode==='overview'?'overview':'eye';updateCamera()},
    render(state){
      if(contextLost)return;
      const {player,bot,clock,swingTime,botSwing,shuttle:s,dt,paused,contacts=[]}=state;
      if(!paused){followX+=(player-followX)*(1-Math.exp(-dt*4));updateCamera();}
      actors.forEach((a,i)=>pose(a,i?bot:player,i?-5.1:5.6,clock,i?botSwing:swingTime,paused?0:dt,contacts[i]));
      shuttle.visible=!!s;trail.visible=!!s;flash.visible=false;
      if(s){
        if(lastFlight!==s.id){history.length=0;lastFlight=s.id;}
        shuttle.position.set(s.x*3.05,s.y,6.7-s.z*13.4);
        shuttle.rotation.x=s.vz>0?-.8:.8;
        if(!paused){history.push(shuttle.position.clone());if(history.length>18)history.shift();}
        trailGeometry.setFromPoints(history);
        if(s.elapsed<.09&&s.missed===undefined){flash.visible=true;flash.position.set(s.startX*3.05,CONTACT.height,6.7-s.startZ*13.4);flash.scale.setScalar(1+s.elapsed*8);flash.material.opacity=.8*(1-s.elapsed/.09);}
      }else history.length=0;
      renderer.render(scene,camera);
    },
    get ready(){return ready},get failed(){return failed}
  };
}
