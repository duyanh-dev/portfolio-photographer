gsap.registerPlugin(ScrollTrigger);
const $=s=>document.querySelector(s),HOV=matchMedia('(hover:hover)').matches;

/* ---------- ảnh minh hoạ vẽ bằng canvas (thay bằng ảnh thật của bạn) ---------- */
const PAL=[['#ff4a1c','#0d0d0b','#ece7db','#f2b705'],['#1d3557','#f1faee','#e63946','#a8dadc'],['#2b2d2f','#ece7db','#ff4a1c','#8a9a5b'],['#f2b705','#0d0d0b','#ece7db','#3a86ff'],['#3a86ff','#ece7db','#0d0d0b','#ff4a1c'],['#8a9a5b','#0d0d0b','#f2e8cf','#ff4a1c']];
const R=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function art(i,w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),p=PAL[i%6],r=R(i*97+3);
  x.fillStyle=p[0];x.fillRect(0,0,w,h);
  x.fillStyle=p[2];x.beginPath();x.arc(w*(.2+r()*.6),h*(.25+r()*.15),w*(.12+r()*.1),0,7);x.fill();
  for(let k=0;k<3;k++){
    x.fillStyle=p[k==1?3:1];x.globalAlpha=k==1?1:.92;x.beginPath();x.moveTo(0,h);
    if(i%3==1){for(let b=0;b<w;){const bw=w*(.06+r()*.1),bh=h*(.18+k*.12+r()*.25);x.lineTo(b,h-bh);x.lineTo(b+bw,h-bh);b+=bw}}
    else{for(let b=0;b<=w;b+=w/7)x.lineTo(b,h*(.5+k*.14)-r()*h*.2)}
    x.lineTo(w,h);x.fill()}
  x.globalAlpha=1;x.fillStyle=p[2];for(let k=0;k<18;k++)x.fillRect(r()*w,r()*h*.5,2,2);
  return c}

/* ---------- HERO 3D: bay giữa kho khung hình + ống ngắm ---------- */
(()=>{
  const st=$('#stage'),rd=new THREE.WebGLRenderer({antialias:true,alpha:true}),el=rd.domElement,fb=$('.fb'),fl=$('#fl');
  rd.setPixelRatio(Math.min(devicePixelRatio,2));st.appendChild(el);el.style.touchAction='pan-y';
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(70,1,.1,100),G=new THREE.Group();sc.add(G);
  const N=18,fr=[],paper=new THREE.MeshBasicMaterial({color:0xece7db,side:2}),hot=new THREE.MeshBasicMaterial({color:0xff4a1c,side:2});
  for(let i=0;i<N;i++){
    const land=i%3==0,w=land?4:2.8,h=land?2.7:3.6,f=new THREE.Group();
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(art(i,300,Math.round(300*h/w)))}));m.position.z=.01;
    const b=new THREE.Mesh(new THREE.PlaneGeometry(w+.3,h+.3),paper);f.add(b,m);
    const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=i*2.4,Rd=8+(i%3)*1.5;
    f.position.set(Math.cos(th)*r*Rd,y*Rd*.75,Math.sin(th)*r*Rd);f.lookAt(0,0,0);
    f.userData={m,b,w,h,y:f.position.y,p:i};G.add(f);fr.push(f)}
  const pa=new Float32Array(900).map(()=>(Math.random()-.5)*30),pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(pa,3));G.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xff4a1c,size:.07})));
  const ims=fr.map(f=>f.userData.m),rc=new THREE.Raycaster(),v2=new THREE.Vector2(),V=new THREE.Vector3(),CW=new THREE.Color(1,1,1),CD=new THREE.Color(.3,.3,.3);
  let ry=0,v=0,px=0,py=0,ty=0,dr=false,lx=0,ly=0,mv=0,on=true,t=0,n=0,lt=0,shots=0,base=70,zm=1,foc=null,fx=0,fy=0,fw=70,fh=70,asked=0;
  const mp={x:-1,y:-1},setP=e=>{const b=st.getBoundingClientRect();mp.x=e.clientX-b.left;mp.y=e.clientY-b.top;px=(mp.x/b.width-.5)*2;py=(mp.y/b.height-.5)*2};
  el.addEventListener('pointerdown',e=>{dr=true;lx=e.clientX;ly=e.clientY;mv=0;setP(e);el.style.cursor='grabbing'});
  addEventListener('pointermove',e=>{setP(e);if(dr){const dx=e.clientX-lx,dy=e.clientY-ly;mv+=Math.abs(dx)+Math.abs(dy);v=dx*.0035;ry+=v;ty=Math.max(-.7,Math.min(.7,ty+dy*.003));lx=e.clientX;ly=e.clientY}});
  el.addEventListener('pointerup',()=>{dr=false;el.style.cursor='grab';
    if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission&&!asked){asked=1;DeviceOrientationEvent.requestPermission().catch(()=>{})}
    if(mv<6){const now=Date.now();
      if(now-lt<320){zm=zm==1?.5:1;lt=0}
      else{lt=now;if(foc){shots++;foc.userData.b.material=hot;gsap.fromTo(foc.scale,{x:1.3,y:1.3},{x:1,y:1,duration:1.2,ease:'elastic.out(1,.4)'});gsap.fromTo(fl,{opacity:.6},{opacity:0,duration:.35})}}}});
  el.addEventListener('pointercancel',()=>dr=false);
  addEventListener('deviceorientation',e=>{if(e.gamma!=null&&!dr&&matchMedia('(pointer:coarse)').matches){px=Math.max(-1,Math.min(1,e.gamma/30));py=Math.max(-1,Math.min(1,(e.beta-50)/30))}});
  new IntersectionObserver(([e])=>on=e.isIntersecting).observe(st);
  const rs=()=>{const w=st.clientWidth,h=st.clientHeight;rd.setSize(w,h);cam.aspect=w/h;base=w/h<1?84:70};rs();addEventListener('resize',rs);
  gsap.to(cam.position,{z:-4,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to(cam.rotation,{z:.35,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  const hm=$('#hm'),hf=$('#hf'),hi=$('#hi'),hs=$('#hs');
  const box=f=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;const W=st.clientWidth,H=st.clientHeight;
    for(const[s,u]of[[-1,-1],[1,-1],[1,1],[-1,1]]){V.set(s*(f.userData.w+.3)/2,u*(f.userData.h+.3)/2,0).applyMatrix4(f.matrixWorld).project(cam);const X=(V.x+1)/2*W,Y=(1-V.y)/2*H;a=Math.min(a,X);b=Math.min(b,Y);c=Math.max(c,X);d=Math.max(d,Y)}
    return[a,b,c-a,d-b]};
  (function loop(){requestAnimationFrame(loop);if(!on)return;t+=.016;n++;
    if(!dr){v*=.94;ry+=v;ty*=.97}ry+=.0012;
    G.rotation.y=ry+px*.15;G.rotation.x+=((ty+py*.12)-G.rotation.x)*.08;
    fr.forEach(f=>f.position.y=f.userData.y+Math.sin(t+f.userData.p)*.25);
    cam.fov+=(base*zm-cam.fov)*.1;cam.updateProjectionMatrix();
    foc=null;if(mp.x>=0&&(!dr||mv<6)){v2.set(mp.x/st.clientWidth*2-1,-mp.y/st.clientHeight*2+1);rc.setFromCamera(v2,cam);const h=rc.intersectObjects(ims)[0];if(h)foc=h.object.parent}
    fr.forEach(f=>f.userData.m.material.color.lerp(foc&&f!=foc?CD:CW,.12));
    const tg=foc?box(foc):[(mp.x<0?st.clientWidth/2:mp.x)-35,(mp.y<0?st.clientHeight/2:mp.y)-35,70,70];
    fx+=(tg[0]-fx)*.25;fy+=(tg[1]-fy)*.25;fw+=(tg[2]-fw)*.25;fh+=(tg[3]-fh)*.25;
    fb.style.cssText=`transform:translate(${fx}px,${fy}px);width:${fw}px;height:${fh}px;border-color:${foc?'#ff4a1c':'#ece7db'}`;
    if(n%6==0){hm.textContent=Math.round(24*base/cam.fov);hf.textContent=foc?'1.8':'2.8';hi.textContent=100*2**(1+Math.min(6,Math.round(Math.abs(v)*600)));hs.textContent=String(shots).padStart(2,'0')}
    rd.render(sc,cam)})();
})();

/* ---------- Hero intro, cursor, marquee ---------- */
gsap.from('.ln>span',{yPercent:115,duration:1.3,stagger:.15,ease:'power4.out',delay:.2});
if(HOV){const c=$('.cur'),xT=gsap.quickTo(c,'x',{duration:.35}),yT=gsap.quickTo(c,'y',{duration:.35});
  addEventListener('pointermove',e=>{xT(e.clientX);yT(e.clientY)});
  document.addEventListener('pointerover',e=>{const t=e.target.closest('[data-c]');c.classList.toggle('on',!!t);if(t)c.dataset.t=t.dataset.c})}
const mq=$('#mq');mq.innerHTML+=mq.innerHTML;
let mx=0,sp=-.05,dir=1;const wr=gsap.utils.wrap(-50,0);
ScrollTrigger.create({onUpdate:s=>{dir=s.direction;sp=-dir*(.05+Math.abs(s.getVelocity())/500)}});
gsap.ticker.add(()=>{mx+=sp;gsap.set(mq,{xPercent:wr(mx)});sp+=(-dir*.05-sp)*.04});

/* ---------- Giới thiệu: chữ sáng dần + đếm số ---------- */
const big=$('#big');big.innerHTML=big.textContent.split(' ').map(w=>`<span class="w">${w}</span>`).join('');
gsap.to('.w',{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:big,start:'top 80%',end:'bottom 50%',scrub:true}});
document.querySelectorAll('[data-n]').forEach(b=>{const o={v:0};ScrollTrigger.create({trigger:b,start:'top 90%',once:true,
  onEnter:()=>gsap.to(o,{v:+b.dataset.n,duration:2,ease:'power2.out',onUpdate:()=>b.textContent=Math.round(o.v).toLocaleString('en')})})});

/* ---------- DỰ ÁN: cuộn phim ngang + màn trập iris ---------- */
const PJ=[['Sương sớm Hà Giang','Phim tài liệu · Drone 4K · 2026'],['Phố không ngủ','Chụp đường phố · Street · 2025'],['Biển lúc 4 giờ sáng','Phim ngắn · Cinema · 2025'],['Dòng chảy Mê Kông','TVC · Flycam · 2024'],['Chân dung ngược sáng','Portrait · Studio · 2024'],['Thành phố từ trên cao','Aerial · Time-lapse · 2023']];
const tr=$('#track');
PJ.forEach((p,i)=>{tr.insertAdjacentHTML('beforeend',`<article class="fr" data-c="XEM" data-i="${i}"><div class="im"></div><div class="mt"><span>0${i+1}</span><h3 class="d">${p[0]}</h3><p>${p[1]}</p></div></article>`);
  const f=tr.lastChild,im=f.querySelector('.im');im.appendChild(art(i,480,600));
  if(HOV){f.onpointermove=e=>{const b=f.getBoundingClientRect();gsap.to(im,{rotationY:((e.clientX-b.left)/b.width-.5)*14,rotationX:-((e.clientY-b.top)/b.height-.5)*14,transformPerspective:700,duration:.4})};f.onpointerleave=()=>gsap.to(im,{rotationX:0,rotationY:0,duration:.6})}});
const ov=$('#ov');let ox=0,oy=0;
tr.addEventListener('click',e=>{const f=e.target.closest('.fr');if(!f)return;const i=+f.dataset.i;ox=e.clientX;oy=e.clientY;
  $('#oc').getContext('2d').drawImage(art(i,800,1000),0,0);$('#ot').textContent=PJ[i][0];$('#om').textContent='0'+(i+1)+' / 06 — '+PJ[i][1];
  ov.style.display='block';ov.scrollTop=0;document.documentElement.style.overflow='hidden';
  gsap.fromTo(ov,{clipPath:`circle(0px at ${ox}px ${oy}px)`},{clipPath:`circle(150vmax at ${ox}px ${oy}px)`,duration:1.1,ease:'power3.inOut'});
  gsap.from('.oi>*',{y:60,opacity:0,duration:.8,stagger:.15,delay:.5,ease:'power3.out'})});
$('.x').onclick=()=>gsap.to(ov,{clipPath:`circle(0px at ${ox}px ${oy}px)`,duration:.8,ease:'power3.inOut',onComplete:()=>{ov.style.display='none';document.documentElement.style.overflow=''}});
gsap.matchMedia().add('(min-width:900px)',()=>{
  gsap.to(tr,{x:()=>-(tr.scrollWidth-innerWidth),ease:'none',scrollTrigger:{trigger:'#work',pin:true,scrub:.6,invalidateOnRefresh:true,end:()=>'+='+tr.scrollWidth,onUpdate:s=>gsap.set('.bar',{scaleX:s.progress})}});
  gsap.utils.toArray('.fr canvas').forEach(c=>gsap.fromTo(c,{scale:1.25},{scale:1,ease:'none',scrollTrigger:{trigger:c,start:'left right',end:'left 30%',scrub:true,horizontal:false}}))});

/* ---------- DỊCH VỤ: accordion ---------- */
const SV=[['Chụp ảnh','Thương hiệu · Sản phẩm · Chân dung · Sự kiện · Kiến trúc'],['Quay phim','TVC · Phim ngắn · Phim doanh nghiệp · Wedding film · Phóng sự'],['Flycam & Aerial','Quay 4K / 5.4K · Hyperlapse · Bản đồ ảnh · Khảo sát địa hình'],['Hậu kỳ & Màu','Dựng phim · Colorgrade · Sound design · Motion graphics']];
const sl=$('#svl');SV.forEach((s,i)=>{sl.insertAdjacentHTML('beforeend',`<div class="row rv" data-c="MỞ"><div class="hd"><span class="mono">0${i+1}</span><h3 class="d">${s[0]}</h3><div class="th"></div></div><div class="bd"><div><p>${s[1]}</p></div></div></div>`);
  sl.lastChild.querySelector('.th').appendChild(art(i+2,300,200))});
const rows=[...sl.children],act=r=>rows.forEach(x=>x.classList.toggle('on',x===r));
rows.forEach(r=>{r.onclick=()=>act(r);if(HOV)r.onmouseenter=()=>act(r)});rows[0].classList.add('on');

/* ---------- SHOWREEL: mở iris + timecode ---------- */
gsap.fromTo('.cl',{clipPath:'circle(6% at 50% 50%)'},{clipPath:'circle(75% at 50% 50%)',ease:'none',
  scrollTrigger:{trigger:'#reel',start:'top top',end:'+=130%',pin:true,scrub:true,onUpdate:s=>{
    const f=Math.floor(s.progress*134*25),p=n=>String(n).padStart(2,'0');
    $('#tc').textContent=`${p(Math.floor(f/1500))}:${p(Math.floor(f/25)%60)}:${p(f%25)}:${p(Math.floor(f/3)%25)}`}}});

/* ---------- Về tôi: buồng tối (rọi sáng, khẩu độ, lấy nét) ---------- */
(()=>{const rm=$('#rm');['dA','dB'].forEach(i=>$('#'+i).getContext('2d').drawImage(art(0,600,750),0,0));
let ux=.5,uy=.5,tx=.5,ty=.5,on=0,vis=1,rr=120;
new IntersectionObserver(([e])=>vis=e.isIntersecting).observe(rm);
rm.addEventListener('pointermove',e=>{const b=rm.getBoundingClientRect();tx=(e.clientX-b.left)/b.width;ty=(e.clientY-b.top)/b.height;on=1});
rm.addEventListener('pointerleave',e=>{if(e.pointerType=='mouse')on=0});
rm.addEventListener('click',()=>gsap.fromTo('#fl',{opacity:.5},{opacity:0,duration:.3}));
$('#ap').oninput=e=>rr=+e.target.value;$('#fo').oninput=e=>rm.style.setProperty('--b',e.target.value+'px');
gsap.ticker.add(t=>{if(!vis)return;if(!on){tx=.5+Math.sin(t*.8)*.28;ty=.5+Math.cos(t*.6)*.22}
  ux+=(tx-ux)*.12;uy+=(ty-uy)*.12;const s=rm.style;s.setProperty('--x',ux*rm.offsetWidth+'px');s.setProperty('--y',uy*rm.offsetHeight+'px');s.setProperty('--r',rr+'px')})})();

/* ---------- Footer: bảng clapperboard + chữ phản ứng ---------- */
(()=>{const bars=(el,o)=>el.innerHTML='<rect width="300" height="36" fill="#0d0d0b"/>'+[0,1,2,3,4,5].map(k=>`<polygon points="${k*50+o+20},0 ${k*50+o+45},0 ${k*50+o+25},36 ${k*50+o},36" fill="#ece7db"/>`).join('');
bars($('#tp'),0);bars($('#arm'),24);gsap.set('#arm',{transformOrigin:'0% 100%',rotation:-16});
let take=1;
$('#fm').onsubmit=e=>{e.preventDefault();const f=e.target,q=encodeURIComponent;
  gsap.timeline().to('#arm',{rotation:0,duration:.14,ease:'power4.in'}).fromTo('#cb',{x:-8},{x:0,duration:.5,ease:'elastic.out(1,.3)'},'<0.1').fromTo('#fl',{opacity:.7},{opacity:0,duration:.3},'<').add(()=>{$('#tk').textContent=++take}).to('#arm',{rotation:-16,duration:.6,delay:.5,ease:'power2.out'});
  setTimeout(()=>location.href=`mailto:hello@linhvu.studio?subject=${q('Dự án: '+f.p.value)}&body=${q('Tên: '+f.n.value+'\nEmail: '+f.e.value)}`,700)};
const wm=$('#wm');wm.innerHTML=[...'LINH VŨ'].map(c=>`<span>${c==' '?'&nbsp;':c}</span>`).join('');const ls=[...wm.children];
$('#ct').addEventListener('pointermove',e=>ls.forEach(l=>{const b=l.getBoundingClientRect(),d=Math.hypot(e.clientX-b.left-b.width/2,e.clientY-b.top-b.height/2),k=Math.max(0,1-d/260);
  gsap.to(l,{yPercent:-k*16,scaleY:1+k*.4,color:k>.5?'#ff4a1c':'#0d0d0b',duration:.4,overwrite:'auto'})}));
gsap.to('#sd',{scaleX:1,ease:'none',scrollTrigger:{trigger:'#ct',start:'top bottom',end:'bottom bottom',scrub:true}})})();

/* ---------- Reveal, magnetic, clock ---------- */
gsap.utils.toArray('.rv').forEach(e=>gsap.from(e,{y:60,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:e,start:'top 90%'}}));
const mg=$('.mag');if(HOV){mg.addEventListener('mousemove',e=>{const b=mg.getBoundingClientRect();gsap.to(mg,{x:(e.clientX-b.left-b.width/2)*.25,y:(e.clientY-b.top-b.height/2)*.4,duration:.4})});
  mg.addEventListener('mouseleave',()=>gsap.to(mg,{x:0,y:0,duration:1,ease:'elastic.out(1,.3)'}))}
const fm=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
setInterval(()=>$('#clk').textContent='SGN '+fm.format(new Date()),1000);
addEventListener('load',()=>ScrollTrigger.refresh());
