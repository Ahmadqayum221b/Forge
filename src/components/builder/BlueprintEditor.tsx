import { useState, useRef, useCallback, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { ACTION_DEFINITIONS, type ActionType, type TriggerType } from '@/types/builder';
import { X, Plus, Save, Trash2, Zap, Search, ZoomIn, ZoomOut, RotateCcw, GitBranch, Map as MapIcon } from 'lucide-react';

type NodeCat = 'event'|'navigation'|'data'|'device'|'ui'|'social'|'logic';

interface BPNode {
  id: string; type: string; category: NodeCat; label: string; x: number; y: number;
}
interface BPConn { id: string; from: string; fromPort?: string; to: string; toPort?: string; }

const CAT_COLOR: Record<NodeCat,string> = {
  event:'#F59E0B', navigation:'#8B5CF6', data:'#06B6D4',
  device:'#10B981', ui:'#EC4899', social:'#F97316', logic:'#6B7280',
};

const ACTION_CAT: Record<string,NodeCat> = {
  Navigation:'navigation', Data:'data', Device:'device', UI:'ui', Social:'social', Logic:'logic',
};

const EVENTS = [
  {type:'on_click',label:'On Tap',category:'event' as NodeCat},
  {type:'on_double_click',label:'On Double Tap',category:'event' as NodeCat},
  {type:'on_long_press',label:'On Long Press',category:'event' as NodeCat},
  {type:'on_swipe_left',label:'On Swipe Left',category:'event' as NodeCat},
  {type:'on_swipe_right',label:'On Swipe Right',category:'event' as NodeCat},
  {type:'on_change',label:'On Change',category:'event' as NodeCat},
  {type:'on_load',label:'On Load',category:'event' as NodeCat},
];

const CATALOGUE = [
  ...EVENTS,
  ...ACTION_DEFINITIONS.map(a=>({type:a.type,label:a.label,category:ACTION_CAT[a.category]||'logic' as NodeCat})),
];

const NW = 210;
const NH = 40;

function bez(x1:number,y1:number,x2:number,y2:number){
  const d=Math.abs(x2-x1)*0.55;
  return `M${x1},${y1} C${x1+d},${y1} ${x2-d},${y2} ${x2},${y2}`;
}

function nodeH(n:BPNode){
  const def=ACTION_DEFINITIONS.find(a=>a.type===n.type);
  const paramH = (def?.params.length||0)*34;
  const portH = Math.max(def?.inputs?.length||0, def?.outputs?.length||0)*28;
  return NH + paramH + portH + 8;
}

// Reconstruct full blueprint state from saved ComponentLogic[]
function initBlueprintState(comp: ReturnType<typeof useProjectStore.getState>['components'][string]|null|undefined) {
  if(!comp) return {nodes:[] as BPNode[],conns:[] as BPConn[],params:{} as Record<string,Record<string,string>>, pan:{x:60,y:40}, zoom:1};
  
  // If we have a saved high-fidelity blueprint, use it
  if(comp.blueprint) {
    return {
      nodes: comp.blueprint.nodes as BPNode[],
      conns: comp.blueprint.conns as BPConn[],
      params: comp.blueprint.params as Record<string,Record<string,string>>,
      pan: comp.blueprint.pan,
      zoom: comp.blueprint.zoom
    };
  }

  // Fallback to reconstruction for legacy components
  const nodes:BPNode[]=[];
  const conns:BPConn[]=[];
  const params:Record<string,Record<string,string>>={};
  const trigMap:Record<string,string>={};
  let trigRow=0;
  comp.logic.forEach((l,i)=>{
    if(!trigMap[l.trigger]){
      const eid=`ev_${l.trigger}`;
      trigMap[l.trigger]=eid;
      nodes.push({id:eid,type:l.trigger,category:'event',label:EVENTS.find(e=>e.type===l.trigger)?.label||l.trigger,x:80,y:80+trigRow*220});
      trigRow++;
    }
    const aid=`ac_${l.id}`;
    const def=ACTION_DEFINITIONS.find(a=>a.type===l.action);
    nodes.push({id:aid,type:l.action,category:ACTION_CAT[def?.category||'']||'logic' as NodeCat,label:def?.label||l.action,x:360,y:80+i*150});
    if(l.params&&Object.keys(l.params).length) params[aid]={...l.params};
    const prev=comp.logic.slice(0,i).filter(ll=>ll.trigger===l.trigger);
    const fromId=prev.length===0?trigMap[l.trigger]:`ac_${prev[prev.length-1].id}`;
    conns.push({id:`ci_${l.id}`,from:fromId,to:aid});
  });
  return {nodes,conns,params, pan:{x:60,y:40}, zoom:1};
}

export const BlueprintEditor = ({onClose}:{onClose:()=>void})=>{
  const selId  = useProjectStore(s=>s.selectedComponentId);
  const comps  = useProjectStore(s=>s.components);
  const scrns  = useProjectStore(s=>s.screens);
  const vars   = useProjectStore(s=>s.variables);
  const addL   = useProjectStore(s=>s.addLogic);
  const remL   = useProjectStore(s=>s.removeLogic);
  const comp   = selId ? comps[selId] : null;

  const [init]                   = useState(()=>initBlueprintState(comp));
  const [nodes,setNodes]         = useState<BPNode[]>(init.nodes);
  const [conns,setConns]         = useState<BPConn[]>(init.conns);
  const [params,setParams]       = useState<Record<string,Record<string,string>>>(init.params);
  const [pan,setPan]             = useState(init.pan);
  const [zoom,setZoom]           = useState(init.zoom);
  const [dragNode,setDragNode]   = useState<string|null>(null);
  const [dragOff,setDragOff]     = useState({dx:0,dy:0});
  const [panDrag,setPanDrag]     = useState(false);
  const [panOff,setPanOff]       = useState({ox:0,oy:0,px:0,py:0});
  const [fromPort,setFromPort]   = useState<string|null>(null);
  const [mouse,setMouse]         = useState({x:0,y:0});
  const [picker,setPicker]       = useState(false);
  const [search,setSearch]       = useState('');
  const [hovConn,setHovConn]     = useState<string|null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const toCanvas=(cx:number,cy:number)=>{
    const r=ref.current!.getBoundingClientRect();
    return {x:(cx-r.left-pan.x)/zoom, y:(cy-r.top-pan.y)/zoom};
  };

  const onWheel=useCallback((e:React.WheelEvent)=>{
    e.preventDefault();
    setZoom(z=>Math.min(2,Math.max(0.2,z-e.deltaY*0.001)));
  },[]);

  const onMD=(e:React.MouseEvent)=>{
    if(e.button===1||(e.button===0&&e.altKey)){
      setPanDrag(true);
      setPanOff({ox:e.clientX,oy:e.clientY,px:pan.x,py:pan.y});
      e.preventDefault();
      return;
    }
    if(fromPort) setFromPort(null);
  };

  const onMM=(e:React.MouseEvent)=>{
    const r=ref.current?.getBoundingClientRect();
    if(r) setMouse({x:(e.clientX-r.left-pan.x)/zoom,y:(e.clientY-r.top-pan.y)/zoom});
    if(panDrag) setPan({x:panOff.px+e.clientX-panOff.ox,y:panOff.py+e.clientY-panOff.oy});
    if(dragNode) setNodes(ns=>ns.map(n=>n.id===dragNode?{...n,x:toCanvas(e.clientX,e.clientY).x+dragOff.dx,y:toCanvas(e.clientX,e.clientY).y+dragOff.dy}:n));
  };

  const onMU=()=>{ setPanDrag(false); setDragNode(null); };

  const startDrag=(e:React.MouseEvent,n:BPNode)=>{
    e.stopPropagation();
    const p=toCanvas(e.clientX,e.clientY);
    setDragNode(n.id);
    setDragOff({dx:n.x-p.x,dy:n.y-p.y});
  };

  const clickOut=(e:React.MouseEvent,nid:string)=>{
    e.stopPropagation(); setFromPort(nid);
  };

  const clickIn=(e:React.MouseEvent,nid:string,portId?:string)=>{
    e.stopPropagation();
    if(fromPort&&fromPort.split(':')[0]!==nid){
      const [fromNode,fromP] = fromPort.split(':');
      setConns(cs=>[...cs.filter(c=>c.to!==nid||c.toPort!==portId),{
        id:`c${Date.now()}`,
        from:fromNode,
        fromPort:fromP,
        to:nid,
        toPort:portId
      }]);
      setFromPort(null);
    }
  };

  const delNode=(id:string)=>{
    setNodes(ns=>ns.filter(n=>n.id!==id));
    setConns(cs=>cs.filter(c=>c.from!==id&&c.to!==id));
  };

  const delConn=(id:string)=>setConns(cs=>cs.filter(c=>c.id!==id));
  const resetView=()=>{setPan({x:60,y:40});setZoom(1);};
  const zoomIn=()=>setZoom(z=>Math.min(2,+(z+0.15).toFixed(2)));
  const zoomOut=()=>setZoom(z=>Math.max(0.2,+(z-0.15).toFixed(2)));

  const addNode=(type:string,label:string,cat:NodeCat)=>{
    setNodes(ns=>[...ns,{id:`n${Date.now()}`,type,category:cat,label,x:260-pan.x/zoom,y:180-pan.y/zoom}]);
    setPicker(false);
  };

  const save=()=>{
    if(!comp) return;
    
    // 1. Flatten logic for the runtime
    const logicList: any[] = [];
    nodes.filter(n=>n.category==='event').forEach(ev=>{
      const getDownstream = (id:string): BPNode[] => {
        return conns.filter(c => c.from === id).map(c => nodes.find(n => n.id === c.to)).filter(Boolean) as BPNode[];
      };
      
      const processChain = (id:string) => {
        const nextActions = getDownstream(id);
        nextActions.forEach(an => {
          logicList.push({ trigger: ev.type as TriggerType, action: an.type as ActionType, params: params[an.id]||{} });
          processChain(an.id);
        });
      };
      processChain(ev.id);
    });

    // 2. Clear old logic and add new
    comp.logic.forEach(l=>remL(comp.id,l.id));
    logicList.forEach(l => addL(comp.id, l));

    // 3. Save high-fidelity blueprint state
    useProjectStore.getState().updateComponent(comp.id, {
      blueprint: {
        nodes,
        conns,
        params,
        pan,
        zoom
      }
    });

    onClose();
  };

  const outPt=(n:BPNode, portIdx=0)=>({x:n.x+NW, y:n.y+NH+portIdx*32+16});
  const inPt =(n:BPNode, portIdx=0)=>({x:n.x,    y:n.y+NH+portIdx*32+16});

  const cats:NodeCat[]=['event','navigation','data','device','ui','social','logic'];
  const filtered=CATALOGUE.filter(n=>n.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{background:'#06060F',fontFamily:'Inter,system-ui,sans-serif'}}>
      <style>{`
        @keyframes dashFlow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        .flow-line { animation: dashFlow 0.8s linear infinite; }
      `}</style>
      
      {/* Toolbar */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 16px',height:52,borderBottom:'1px solid rgba(255,255,255,0.07)',background:'linear-gradient(180deg,#0F0F1F 0%,#0A0A18 100%)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:'rgba(139,92,246,0.18)',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <GitBranch size={15} color="#A78BFA"/>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'#fff',letterSpacing:'0.03em'}}>Blueprint Editor</div>
            {comp&&<div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:1}}>{comp.name}</div>}
          </div>
        </div>
        <div style={{flex:1}}/>
        <div style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',background:'rgba(255,255,255,0.04)',borderRadius:10,border:'1px solid rgba(255,255,255,0.07)'}}>
          <button onClick={zoomIn} title="Zoom In" style={iconBtn}><ZoomIn size={13}/></button>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',minWidth:34,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
          <button onClick={zoomOut} title="Zoom Out" style={iconBtn}><ZoomOut size={13}/></button>
          <button onClick={resetView} title="Reset View" style={iconBtn}><RotateCcw size={13}/></button>
        </div>
        <div style={{width:1,height:22,background:'rgba(255,255,255,0.08)',margin:'0 4px'}}/>
        <Btn onClick={()=>setShowMinimap(!showMinimap)} accent="#06B6D4"><MapIcon size={13}/>Map</Btn>
        <Btn onClick={()=>setPicker(p=>!p)} accent="#A78BFA"><Plus size={13}/>Add Node</Btn>
        <Btn onClick={()=>{setNodes([]);setConns([]);}} accent="#F87171"><Trash2 size={13}/>Clear</Btn>
        <Btn onClick={save} accent="#34D399"><Save size={13}/>Save</Btn>
        <button onClick={onClose} style={{...iconBtn,marginLeft:4,padding:8}}><X size={14}/></button>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Canvas */}
        <div ref={ref} style={{flex:1,position:'relative',overflow:'hidden',cursor:'crosshair',userSelect:'none'}}
          onWheel={onWheel} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
          
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.12,pointerEvents:'none'}}>
            <defs>
              <pattern id="bp-grid" x={pan.x%(20*zoom)} y={pan.y%(20*zoom)} width={20*zoom} height={20*zoom} patternUnits="userSpaceOnUse">
                <circle cx={1} cy={1} r={.8} fill="#6366F1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bp-grid)"/>
          </svg>

          <div style={{position:'absolute',inset:0,transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,transformOrigin:'0 0'}}>
            <svg style={{position:'absolute',left:'-5000px',top:'-5000px',width:'15000px',height:'15000px',overflow:'visible',pointerEvents:'none'}}>
              <g transform="translate(5000,5000)">
              {conns.map(c=>{
                const f=nodes.find(n=>n.id===c.from), t=nodes.find(n=>n.id===c.to);
                if(!f||!t) return null;
                
                const fDef = ACTION_DEFINITIONS.find(a=>a.type===f.type);
                const tDef = ACTION_DEFINITIONS.find(a=>a.type===t.type);
                
                const fIdx = fDef?.outputs?.findIndex(o=>o.id===c.fromPort)??0;
                const tIdx = tDef?.inputs?.findIndex(i=>i.id===c.toPort)??0;

                const fp=outPt(f, fIdx=== -1 ? 0 : fIdx), tp=inPt(t, tIdx=== -1 ? 0 : tIdx), col=CAT_COLOR[f.category], hov=hovConn===c.id;
                return <g key={c.id} style={{pointerEvents:'stroke' as any,cursor:'pointer'}}
                  onMouseEnter={()=>setHovConn(c.id)} onMouseLeave={()=>setHovConn(null)}
                  onClick={()=>delConn(c.id)}>
                  <path d={bez(fp.x,fp.y,tp.x,tp.y)} fill="none" stroke={col} strokeWidth={hov?16:10} strokeOpacity={0.07}/>
                  <path d={bez(fp.x,fp.y,tp.x,tp.y)} fill="none" stroke={hov?'#FF5555':col} strokeWidth={hov?3:2}
                    strokeOpacity={hov?1:0.6} style={{filter:`drop-shadow(0 0 ${hov?12:6}px ${hov?'#FF555588':col+'88'})`}}/>
                  {hov&&<path className="flow-line" d={bez(fp.x,fp.y,tp.x,tp.y)} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="6 14" opacity={0.6}/>}
                  {!hov&&<path className="flow-line" d={bez(fp.x,fp.y,tp.x,tp.y)} fill="none" stroke={col} strokeWidth={1} strokeDasharray="4 16" opacity={0.5}/>}
                  {hov&&<>
                    <circle cx={(fp.x+tp.x)/2} cy={(fp.y+tp.y)/2} r={9} fill="#FF5555" stroke="#06060F" strokeWidth={2}/>
                    <text x={(fp.x+tp.x)/2} y={(fp.y+tp.y)/2+4} textAnchor="middle" fontSize={11} fill="#fff" style={{pointerEvents:'none'}}>×</text>
                  </>}
                </g>;
              })}
              {fromPort&&(()=>{
                const [fnid, fpid] = fromPort.split(':');
                const f=nodes.find(n=>n.id===fnid); if(!f) return null;
                const fDef = ACTION_DEFINITIONS.find(a=>a.type===f.type);
                const fIdx = fDef?.outputs?.findIndex(o=>o.id===fpid)??0;
                const fp=outPt(f, fIdx=== -1 ? 0 : fIdx), col=CAT_COLOR[f.category];
                return <path className="flow-line" d={bez(fp.x,fp.y,mouse.x,mouse.y)} fill="none" stroke={col} strokeWidth={2.5}
                  strokeOpacity={0.75} strokeDasharray="8 5" style={{filter:`drop-shadow(0 0 6px ${col}88)`}}/>;
              })()}
              </g>
            </svg>

            {nodes.map(node=>{
              const col=CAT_COLOR[node.category];
              const def=ACTION_DEFINITIONS.find(a=>a.type===node.type);
              const h=nodeH(node);
              const isHov = hovConn && conns.find(c=>c.id===hovConn && (c.from===node.id || c.to===node.id));
              return (
                <div key={node.id} style={{position:'absolute',left:node.x,top:node.y,width:NW,zIndex:dragNode===node.id?100:1}}
                  onMouseDown={e=>startDrag(e,node)}>
                  <div style={{borderRadius:14,border:`1.5px solid ${fromPort===node.id?col:isHov?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.09)'}`,
                    background:'rgba(9,9,20,0.97)',backdropFilter:'blur(16px)',
                    boxShadow:fromPort===node.id?`0 0 24px ${col}55,0 8px 32px rgba(0,0,0,0.8)`:isHov?`0 0 16px ${col}44`:'0 8px 32px rgba(0,0,0,0.75)',
                    overflow:'hidden',transition:'border-color 0.2s,box-shadow 0.2s, transform 0.1s', transform: isHov?'scale(1.02)':'scale(1)'}}>                    <div style={{height:NH,display:'flex',alignItems:'center',gap:10,padding:'0 14px',
                      background:`linear-gradient(135deg,${col}33,${col}11)`,borderBottom:`1px solid ${col}22`,cursor:'grab',flexShrink:0}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:col,boxShadow:`0 0 12px ${col}`,flexShrink:0}}/>
                      <span style={{flex:1,fontSize:11,fontWeight:800,color:'#fff',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{node.label}</span>
                      <span style={{fontSize:9,color:col,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',opacity:.8,flexShrink:0}}>{node.category}</span>
                      <button onMouseDown={e=>e.stopPropagation()} onClick={()=>delNode(node.id)}
                        style={{background:'none',border:'none',color:'rgba(255,255,255,0.25)',cursor:'pointer',fontSize:18,lineHeight:1,padding:'2px 4px',flexShrink:0,transition:'all 0.2s'}}
                        onMouseEnter={e=>(e.currentTarget.style.color='#FF4444')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.25)')}>×</button>
                    </div>
>
                    {def&&def.params.length>0&&(
                      <div style={{padding:'8px 10px',display:'flex',flexDirection:'column',gap:6}} onMouseDown={e=>e.stopPropagation()}>
                        {def.params.map(p=>(
                          <div key={p.key}>
                            <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>{p.label}</div>
                            {p.type==='screen'?(
                              <select value={params[node.id]?.[p.key]||''} onChange={e=>setParams(ps=>({...ps,[node.id]:{...ps[node.id],[p.key]:e.target.value}}))}
                                style={sel}>
                                <option value="">Select screen…</option>
                                {scrns.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            ):p.type==='variable'?(
                              <select value={params[node.id]?.[p.key]||''} onChange={e=>setParams(ps=>({...ps,[node.id]:{...ps[node.id],[p.key]:e.target.value}}))}
                                style={sel}>
                                <option value="">Select variable…</option>
                                {vars.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                              </select>
                            ):(
                              <input type={p.type==='number'?'number':'text'} placeholder={p.label}
                                value={params[node.id]?.[p.key]||''} onChange={e=>setParams(ps=>({...ps,[node.id]:{...ps[node.id],[p.key]:e.target.value}}))}
                                style={{...sel,width:'100%',boxSizing:'border-box'}}/>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Ports Rendering */}
                  <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
                    {/* Inputs */}
                    {def?.inputs?.map((inp, idx) => (
                      <div key={inp.id} style={{position:'absolute', left:-12, top:NH+idx*32+6, display:'flex', alignItems:'center', gap:10, pointerEvents:'auto'}}>
                        <Port col={col} onClick={e=>clickIn(e,node.id,inp.id)}/>
                        <span style={{fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{inp.label}</span>
                      </div>
                    ))}
                    {/* Default input for simple nodes */}
                    {node.category!=='event' && (!def?.inputs || def.inputs.length===0) && (
                      <div style={{position:'absolute', left:-12, top:NH/2-10, pointerEvents:'auto'}}>
                        <Port col={col} onClick={e=>clickIn(e,node.id)}/>
                      </div>
                    )}

                    {/* Outputs */}
                    {def?.outputs?.map((out, idx) => (
                      <div key={out.id} style={{position:'absolute', right:-12, top:NH+idx*32+6, display:'flex', alignItems:'center', gap:10, pointerEvents:'auto', flexDirection:'row-reverse'}}>
                        <Port col={col} onClick={e=>setFromPort(`${node.id}:${out.id}`)}/>
                        <span style={{fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em'}}>{out.label}</span>
                      </div>
                    ))}
                    {/* Default output for simple nodes */}
                    {(!def?.outputs || def.outputs.length===0) && (
                      <div style={{position:'absolute', right:-12, top:NH/2-10, pointerEvents:'auto'}}>
                        <Port col={col} onClick={e=>setFromPort(`${node.id}:out`)}/>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{position:'absolute',bottom:12,left:12,display:'flex',gap:6}}>
            <Pill>{nodes.length} nodes</Pill>
            <Pill>{conns.length} wires</Pill>
            <Pill>Alt+drag · Scroll zoom</Pill>
          </div>
          {fromPort&&<div style={{position:'absolute',bottom:12,right:picker?260:12}}>
            <Pill accent="#F59E0B">Click input port to connect · Click canvas to cancel</Pill>
          </div>}

          {nodes.length===0&&(
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <div style={{padding:24,borderRadius:20,border:'1px solid rgba(139,92,246,0.2)',background:'rgba(139,92,246,0.05)',marginBottom:14}}>
                <Zap size={36} color="rgba(139,92,246,0.4)"/>
              </div>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.25)',fontWeight:500}}>Blueprint Canvas</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.12)',marginTop:4}}>Click "Add Node" to start building logic</p>
            </div>
          )}

          {/* MiniMap */}
          {showMinimap && (
            <div style={{
              position:'absolute', right:picker?252:12, bottom:12, width: 200, height: 140, 
              background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
              overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              transition: 'right 0.2s ease'
            }} onMouseDown={e=>e.stopPropagation()} onMouseMove={e=>e.stopPropagation()}>
              <div style={{padding:'6px 10px', fontSize:9, fontWeight:600, color:'rgba(255,255,255,0.5)', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)'}}>
                MINIMAP
              </div>
              <div style={{position:'relative', width:'100%', height:'calc(100% - 25px)'}}>
                {nodes.map(n => {
                  const mmScale = 0.05;
                  const bx = n.x * mmScale + 100; // Center offset roughly
                  const by = n.y * mmScale + 50;
                  return (
                    <div key={n.id} style={{
                      position: 'absolute', left: bx, top: by,
                      width: Math.max(4, NW * mmScale), height: Math.max(2, nodeH(n) * mmScale),
                      background: CAT_COLOR[n.category], borderRadius: 2,
                      opacity: 0.8
                    }} />
                  );
                })}
                {/* Viewport indicator */}
                <div style={{
                  position: 'absolute',
                  left: (-pan.x / zoom) * 0.05 + 100,
                  top: (-pan.y / zoom) * 0.05 + 50,
                  width: (ref.current?.clientWidth || 800) / zoom * 0.05,
                  height: (ref.current?.clientHeight || 600) / zoom * 0.05,
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.05)',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Node Picker */}
        {picker&&(
          <div style={{width:240,borderLeft:'1px solid rgba(255,255,255,0.06)',background:'#0B0B17',display:'flex',flexDirection:'column',flexShrink:0}}>
            <div style={{padding:'10px 10px 8px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <p style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.5)',marginBottom:8}}>Add Node</p>
              <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,padding:'5px 8px'}}>
                <Search size={12} color="rgba(255,255,255,0.25)"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                  style={{flex:1,background:'none',border:'none',outline:'none',fontSize:11,color:'#fff'}}/>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:6}}>
              {cats.map(cat=>{
                const items=filtered.filter(n=>n.category===cat);
                if(!items.length) return null;
                const col=CAT_COLOR[cat];
                return (
                  <div key={cat} style={{marginBottom:4}}>
                    <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:col,padding:'6px 8px 3px'}}>{cat}</div>
                    {items.map(item=>(
                      <button key={item.type} onClick={()=>addNode(item.type,item.label,item.category)}
                        style={{width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:9,padding:'6px 8px',borderRadius:8,border:'none',background:'none',cursor:'pointer',color:'rgba(255,255,255,0.65)',fontSize:11,transition:'background .15s'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:col,flexShrink:0}}/>
                        {item.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const sel:React.CSSProperties={
  width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:7,color:'#fff',fontSize:11,padding:'5px 8px',outline:'none',
};

const iconBtn:React.CSSProperties={
  background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',
  padding:5,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',
};

const Btn=({children,onClick,accent}:{children:React.ReactNode,onClick:()=>void,accent:string})=>(
  <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,border:'none',background:`${accent}18`,color:accent,fontSize:11,fontWeight:600,cursor:'pointer',letterSpacing:'0.02em'}}>
    {children}
  </button>
);

const Port=({x,y,col,onClick}:{x:number,y:number,col:string,onClick:(e:React.MouseEvent)=>void})=>(
  <div onClick={onClick} onMouseDown={e=>e.stopPropagation()}
    style={{position:'absolute',left:x,top:y,width:20,height:20,borderRadius:'50%',background:'#09091A',
      border:`2.5px solid ${col}`,cursor:'crosshair',zIndex:20,display:'flex',alignItems:'center',justifyContent:'center',
      boxShadow:`0 0 10px ${col}44`,transition:'box-shadow 0.15s'}}
    onMouseEnter={e=>(e.currentTarget.style.boxShadow=`0 0 18px ${col}`)}
    onMouseLeave={e=>(e.currentTarget.style.boxShadow=`0 0 10px ${col}44`)}>
    <div style={{width:8,height:8,borderRadius:'50%',background:col}}/>
  </div>
);

const Pill=({children,accent}:{children:React.ReactNode,accent?:string})=>(
  <div style={{fontSize:9,color:accent||'rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.07)',borderRadius:6,padding:'3px 9px',letterSpacing:'0.05em',whiteSpace:'nowrap'}}>
    {children}
  </div>
);
