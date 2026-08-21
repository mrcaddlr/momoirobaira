(()=>{
  function setup(){
    if(document.getElementById('momoPortraitBlock')) return;
    const portrait=document.createElement('div');
    portrait.id='momoPortraitBlock';
    portrait.innerHTML='<div class="momo-portrait-card"><div class="momo-rotate-icon">↻</div><h2>Landscape only</h2><p>Momoirobara is designed for a wide screen. Please rotate your device sideways to continue.</p></div>';
    document.body.appendChild(portrait);

    const menu=document.createElement('button');
    menu.id='momoResponsiveMenuBtn';
    menu.type='button';
    menu.setAttribute('aria-label','Open menu');
    menu.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    document.body.appendChild(menu);

    const close=document.createElement('button');
    close.id='momoResponsiveMenuClose';
    close.type='button';
    close.setAttribute('aria-label','Close menu');
    close.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    document.body.appendChild(close);

    const isLandscape=()=>matchMedia('(orientation: landscape)').matches;
    const isLarge=()=>isLandscape() && innerWidth>=900;
    const side=()=>document.querySelector('.side');
    function sync(){
      if(!isLandscape() || isLarge()){
        document.body.classList.remove('momo-responsive-menu','momo-menu-open');
        return;
      }
      document.body.classList.remove('momo-responsive-menu');
      document.body.classList.remove('momo-menu-open');
    }
    function open(){
      if(isLarge()) return;
      document.body.classList.add('momo-responsive-menu','momo-menu-open');
    }
    function shut(){
      document.body.classList.remove('momo-responsive-menu','momo-menu-open');
    }
    menu.addEventListener('click',open);
    close.addEventListener('click',shut);
    document.addEventListener('click',e=>{
      if(!document.body.classList.contains('momo-responsive-menu')) return;
      const s=side();
      if(s && !s.contains(e.target) && e.target!==menu && e.target!==close) shut();
    },true);
    addEventListener('resize',sync,{passive:true});
    addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
    sync();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true}); else setup();
})();
