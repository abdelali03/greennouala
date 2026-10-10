import {readFileSync} from 'node:fs';
const b=readFileSync(process.argv[2]);
function atoms(start,end){const result=[];for(let p=start;p+8<=end;){let size=b.readUInt32BE(p),header=8;const type=b.toString('ascii',p+4,p+8);if(size===1){size=Number(b.readBigUInt64BE(p+8));header=16;}if(size===0)size=end-p;if(size<header||p+size>end)break;result.push({type,start:p+header,end:p+size});p+=size;}return result;}
const moov=atoms(0,b.length).find(a=>a.type==='moov');if(!moov)throw Error('MP4 moov missing');
const details={bytes:b.length};
function walk(start,end){for(const a of atoms(start,end)){if(['moov','trak','mdia','minf','stbl'].includes(a.type))walk(a.start,a.end);if(a.type==='mvhd'){const offset=b[a.start]===1?20:12;details.duration=b.readUInt32BE(a.start+offset+4)/b.readUInt32BE(a.start+offset);}if(a.type==='tkhd'){details.width=b.readUInt32BE(a.end-8)/65536;details.height=b.readUInt32BE(a.end-4)/65536;}if(a.type==='stss')details.keyframes=b.readUInt32BE(a.start+4);if(a.type==='stsz')details.frames=b.readUInt32BE(a.start+8);}}
walk(moov.start,moov.end);console.log(JSON.stringify(details,null,2));
