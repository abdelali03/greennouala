import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

  const out=path.resolve('.qa');
await mkdir(out,{recursive:true});
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[
  '--headless=new','--remote-debugging-port=9337',`--user-data-dir=${path.join(out,'browser-profile')}`,
  '--no-first-run','--no-default-browser-check','--disable-background-networking','--window-size=1440,1000','about:blank',
],{stdio:'ignore',windowsHide:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
let closeBrowser;
try{
  let page;
  for(let i=0;i<100;i++){try{const pages=await(await fetch('http://127.0.0.1:9337/json')).json();page=pages.find(p=>p.type==='page');if(page)break;}catch{}await pause(150);}
  assert(page,'Chrome debugging connection unavailable');
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map();const errors=[];
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const p=pending.get(message.id);if(p){clearTimeout(p.timer);pending.delete(message.id);message.error?p.reject(Error(JSON.stringify(message.error))):p.resolve(message.result);}}if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);});
  function command(method,params={}){return new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(Error(`CDP timeout: ${method}`));},20000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));});}
  closeBrowser=()=>command('Browser.close');
  async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
  async function until(expression){for(let i=0;i<200;i++){if(await evaluate(expression))return;await pause(75);}const state=await evaluate(`(()=>{const v=document.querySelector('video');return {scrollY,track:document.querySelector('#journey-track')?.offsetHeight,height:innerHeight,time:v?.currentTime,duration:v?.duration,seeking:v?.seeking,ready:v?.readyState,scene:document.body.dataset.scene,error:v?.error?.message}})()`);throw Error(`Condition timed out: ${expression}\n${JSON.stringify(state)}`);}
  async function shot(name){const r=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(out,name),Buffer.from(r.data,'base64'));}
  const videoState=`(()=>{const v=document.querySelector('video');const c=document.createElement('canvas');c.width=32;c.height=18;const x=c.getContext('2d');x.drawImage(v,0,0,32,18);let hash=0;for(const n of x.getImageData(0,0,32,18).data)hash=(Math.imul(hash,31)+n)|0;return {time:v.currentTime,duration:v.duration,paused:v.paused,width:v.videoWidth,height:v.videoHeight,source:v.currentSrc,hash,scene:document.body.dataset.scene}})()`;
  await command('Runtime.enable');
  await command('Page.enable');
  await command('Network.enable');
  await command('Network.setCacheDisabled',{cacheDisabled:true});
  await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await command('Page.navigate',{url:'http://127.0.0.1:4173/'});
  await until(`document.querySelector('#journey-video')?.readyState>=2 && document.querySelector('#journey-video').classList.contains('is-ready')`);
  await pause(700);
  const first=await evaluate(videoState);
  assert.equal(first.width,1920);assert.equal(first.paused,true);
  await shot('desktop-entry.png');
  const states=[];
  for(const progress of [.4,.9,.15]){
    await evaluate(`scrollTo(0,(document.querySelector('#journey-track').offsetHeight-innerHeight)*${progress})`);
    await until(`Math.abs(document.querySelector('video').currentTime-((document.querySelector('video').duration-.045)*${progress}))<.09 && !document.querySelector('video').seeking`);
    const state=await evaluate(videoState);states.push(state);assert.equal(state.paused,true);assert.equal(state.source,first.source);
    if(progress===.9)await shot('desktop-crossroad.png');
  }
  assert(states[0].time>first.time);assert(states[1].time>states[0].time);assert(states[2].time<states[0].time);
  assert.notEqual(first.hash,states[1].hash,'Decoded frames must change during the visit');
  const previousScroll=await evaluate('scrollY');
  await evaluate(`document.querySelector('.site-header [data-panel="collections"]').click()`);
  assert(await evaluate(`document.querySelector('#explore-dialog').open`));
  await evaluate(`document.querySelector('[data-filter="interieur"]').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('.collection-card:not([hidden])').length`),1);
  await evaluate(`document.querySelector('.panel-nav [data-panel="jardins"]').click();document.querySelector('[data-project="cour"]').click()`);
  assert.match(await evaluate(`document.querySelector('#project-contact').dataset.message`),/cour/);
  await evaluate(`document.querySelector('#project-contact').click()`);
  assert(await evaluate(`document.querySelector('#contact-dialog').open`));
  await evaluate(`document.querySelector('#contact-dialog').close();document.querySelector('#explore-dialog').close()`);
  await pause(200);
  assert(Math.abs(await evaluate('scrollY')-previousScroll)<2,'Closing panels must preserve scroll position');
  await evaluate(`document.querySelector('#clean-toggle').click()`);
  assert(await evaluate(`document.querySelector('#scene-overlays').inert`));
  await evaluate(`document.querySelector('#clean-toggle').click()`);
  await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await command('Page.navigate',{url:'http://127.0.0.1:4173/'});
  await until(`document.querySelector('video')?.readyState>=2`);
  await pause(600);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  assert.match(await evaluate('document.querySelector("video").currentSrc'),/mobile/);
  await shot('mobile-entry.png');
  await evaluate(`scrollTo(0,(document.querySelector('#journey-track').offsetHeight-innerHeight)*.9)`);
  await until(`document.body.dataset.scene==='croisement' && !document.querySelector('video').seeking && document.querySelector('video').currentTime>8`);
  await shot('mobile-crossroad.png');
  await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await command('Page.navigate',{url:'http://127.0.0.1:4173/'});
  await until(`document.querySelector('#motion-toggle')?.getAttribute('aria-pressed')==='true'`);
  assert.equal(await evaluate(`document.querySelector('video').getAttribute('src')`),null,'Reduced motion must not preload the travelling');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({result:'passed',first,seekChecks:states.map(s=>({time:s.time,scene:s.scene,hash:s.hash})),checks:['forward and reverse seek','decoded frame changes','one persistent video','collections filters','garden messages','nested dialogs and scroll restoration','clean view','mobile source and layout','reduced motion'],screenshots:['desktop-entry.png','desktop-crossroad.png','mobile-entry.png','mobile-crossroad.png']},null,2));
} finally {try{await closeBrowser?.();}catch{}socket?.close();browser.kill();}
