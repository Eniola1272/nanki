import React, { useEffect, useState } from 'react';
import { AppState, Alert, Pressable, Text, View } from 'react-native';
import { OfflineService } from '../lib/offline';
import type { Deck, Quiz } from '../types';
export function useOfflineSync(){
 const [status,setStatus]=useState({owner:'guest',pending:0,syncing:false,message:'Loading offline library…',downloads:0});
 useEffect(()=>{
  let mounted=true;
  const update=()=>{void OfflineService.status().then(value=>{if(mounted)setStatus(value);}).catch(()=>{if(mounted)setStatus(p=>({...p,message:'Could not read device storage. Please free space and restart.'}));});};
  const retry=()=>{if(AppState.currentState==='active'||AppState.currentState===null)void OfflineService.sync();};
  const stop=OfflineService.subscribe(update);
  void OfflineService.initialize().then(()=>{update();retry();});
  const listener=AppState.addEventListener('change',state=>{if(state==='active')retry();});
  const timer=setInterval(retry,15000);
  return()=>{mounted=false;stop();listener.remove();clearInterval(timer);};
 },[]);
 return status;
}
export function OfflineStatus({status}:{status:ReturnType<typeof useOfflineSync>}){
 return <View style={{backgroundColor:'#eee5f7',padding:12,gap:4}}><Text style={{color:'#55317f',fontSize:12}}>{status.message}{status.owner!=='guest'&&status.pending?` · ${status.pending} waiting`:''} · {status.downloads} downloads</Text><Pressable accessibilityRole="button" disabled={status.syncing} onPress={()=>void OfflineService.sync()}><Text style={{color:'#674099',fontWeight:'600'}}>{status.owner==='guest'?'Guest study is offline; sign in from Profile to sync future activity':status.syncing?'Syncing…':'Sync now'}</Text></Pressable></View>;
}
export function DownloadButton({kind,item}:{kind:'quiz'|'deck';item:Quiz|Deck}){
 const [saved,setSaved]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{let mounted=true;const update=()=>{void OfflineService.read().then(data=>{if(mounted)setSaved(data.downloads.some(d=>d.kind===kind&&d.item.id===item.id));}).catch(()=>{});};update();const stop=OfflineService.subscribe(update);return()=>{mounted=false;stop();};},[kind,item.id]);
 const download=async()=>{setBusy(true);try{await OfflineService.download(kind,item);setSaved(true);}catch{Alert.alert('Download not saved','Free some device storage and try again.');}finally{setBusy(false);}};
 const remove=()=>Alert.alert('Remove offline download?','Your saved results and pending uploads will stay on this device.',[{text:'Cancel',style:'cancel'},{text:'Remove',onPress:()=>{void OfflineService.removeDownload(kind,item.id).catch(()=>Alert.alert('Could not remove download'));}}]);
 return <View style={{flexDirection:'row',gap:16,paddingVertical:8,flexWrap:'wrap'}}><Pressable accessibilityRole="button" disabled={busy} onPress={e=>{e.stopPropagation();void download();}}><Text style={{color:'#674099',fontWeight:'600',fontSize:13}}>{busy?'Saving…':saved?'✓ Offline · update copy':'↓ Save offline'}</Text></Pressable>{saved&&<Pressable accessibilityRole="button" onPress={e=>{e.stopPropagation();remove();}}><Text style={{color:'#716b77',fontSize:13}}>Remove download</Text></Pressable>}</View>;
}
