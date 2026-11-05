/* HARIT UTSAV AI — single-page module router. No module opens a new tab. */
(()=>{
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  const nav=document.getElementById('nav');
  const back=document.getElementById('huBack');
  const routeLinks=[...(nav?.querySelectorAll('a[href^="#"]')||[])];
  const routes=new Set(routeLinks.map(a=>a.getAttribute('href').slice(1)).filter(Boolean));
  routes.add('home');
  const valid=id=>routes.has(id)&&!!document.getElementById(id);

  // Group supporting sections with the module they belong to.
  let currentGroup='home';
  [...main.children].forEach(el=>{
    if(el.matches('section[id]')&&valid(el.id))currentGroup=el.id;
    if(el.classList.contains('intro-grid'))currentGroup='home';
    if(el.classList.contains('principles'))currentGroup='research';
    if(el.classList.contains('cta-section'))currentGroup='home';
    el.dataset.huView=currentGroup;
  });
  const footer=document.querySelector('footer');
  if(footer)footer.dataset.huView='home';

  let active='home';
  const render=id=>{
    active=valid(id)?id:'home';
    document.body.classList.add('hu-routed');
    [...main.children].forEach(el=>{
      const show=el.dataset.huView===active;
      el.classList.toggle('hu-screen-hidden',!show);
      el.classList.toggle('hu-screen-active',show);
      if(show&&el.classList.contains('section'))el.classList.add('in');
      el.setAttribute('aria-hidden',show?'false':'true');
    });
    if(footer){const show=footer.dataset.huView===active;footer.classList.toggle('hu-screen-hidden',!show);footer.classList.toggle('hu-screen-active',show);footer.setAttribute('aria-hidden',show?'false':'true');}
    routeLinks.forEach(a=>{
      const selected=a.getAttribute('href')==='#'+active;
      a.classList.toggle('active',selected);
      if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    if(back)back.hidden=active==='home';
    if(nav){nav.classList.remove('open');document.getElementById('menuToggle')?.setAttribute('aria-expanded','false');}
    window.scrollTo({top:0,left:0,behavior:'instant'});
    document.dispatchEvent(new CustomEvent('hu:viewchange',{detail:{view:active}}));
  };

  const navigate=(id,replace=false)=>{
    if(!valid(id))return false;
    if(id===active){render(id);return true;}
    const state={...(history.state||{}),huRouter:true,view:id,previous:active};
    history[replace?'replaceState':'pushState'](state,'','#'+id);
    render(id);
    return true;
  };
  window.HU_navigate=navigate;
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a)return;
    const id=a.getAttribute('href').slice(1);
    if(!valid(id))return; // e.g. #legal is handled by the existing legal dialog.
    e.preventDefault();
    navigate(id);
  },true);
  back?.addEventListener('click',()=>{
    const state=history.state;
    if(state?.huRouter&&state.previous){history.back();return;}
    if(active!=='home')navigate('home');
  });
  window.addEventListener('popstate',e=>{
    const state=e.state;
    const fromState=state?.huRouter&&valid(state.view)?state.view:null;
    const fromHash=location.hash.slice(1);
    render(fromState|| (valid(fromHash)?fromHash:'home'));
  });

  const initial=location.hash.slice(1);
  const start=valid(initial)?initial:'home';
  history.replaceState({...(history.state||{}),huRouter:true,view:start,previous:null},'','#'+start);
  render(start);
})();
