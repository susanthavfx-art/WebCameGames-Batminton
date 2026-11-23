export function createLoadingScreen(doc=document, reload=()=>location.reload()) {
  const screen=doc.getElementById('loadingScreen'),app=doc.getElementById('app');
  const message=doc.getElementById('loadingMessage'),bar=doc.getElementById('loadingProgress');
  const percent=doc.getElementById('loadingPercent'),retry=doc.getElementById('loadingRetry'),note=doc.getElementById('loadingNote');
  let failed=false,finished=false;
  retry.onclick=reload;
  const slowTimer=setTimeout(()=>{if(!finished&&!failed){note.textContent='Taking longer than usual. Check your connection or retry.';retry.hidden=false;}},20000);
  function update(text,error=false,value=0){
    if(error){screen.setAttribute('aria-busy','false');failed=true;finished=false;clearTimeout(slowTimer);screen.hidden=false;app.inert=true;doc.body.classList.add('is-loading');screen.classList.add('load-error');message.textContent=text;note.textContent='Your game has not started. Reload to try again.';retry.hidden=false;retry.focus();return;}
    if(failed||finished)return;
    message.textContent=text;bar.value=value;percent.textContent=`${value}%`;
    if(value===100){
      screen.setAttribute('aria-busy','false');finished=true;clearTimeout(slowTimer);note.textContent='Arena ready. Let’s play!';
      // Allow a paint of the prepared scene, with no artificial loading delay.
      requestAnimationFrame(()=>requestAnimationFrame(()=>{if(failed)return;screen.hidden=true;app.inert=false;doc.body.classList.remove('is-loading');}));
    }
  }
  return {update};
}
