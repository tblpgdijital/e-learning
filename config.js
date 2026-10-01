// TUI BLUE Palm Garden Eğitim Portalı - ORTAK OneSignal / PWA yapılandırması
// Güvenlik + Eğitim aynı OneSignal uygulamasını kullanır.
window.TBPG_EDUCATION_CONFIG = {
  APP_URL: "https://script.google.com/macros/s/AKfycbz41b8SJ886o5_JMnTOF38AK2JwOA5zTtuUKVOOVH_eUshCagQJOytmdrhoThpQehW9/exec",
  ONESIGNAL_APP_ID: "42b7220b-661b-45f3-907c-e54b9ea99aec",
  ONESIGNAL_SAFARI_WEB_ID: "web.onesignal.auto.166712e5-2aee-41ea-b95e-8df3d8ab1f28",
  ONESIGNAL_WORKER_PATH: "/e-learning/service-worker.js",
  ONESIGNAL_WORKER_SCOPE: "/e-learning/",
  PWA_URL: "https://tblpgdijital.github.io/e-learning/"
};

/*
 * V20 — Dış giriş aksiyonu köprüsü
 * Gelişim'den:
 *   /e-learning/?open=sifreUnuttum
 *   /e-learning/?open=yeniUyelik
 * geldiğinde bu bilgi Apps Script iframe URL'sine eklenir.
 */
(function(){
  'use strict';

  function allowedAction(){
    try{
      var p=new URLSearchParams(window.location.search||'');
      var v=String(p.get('open')||'').trim();
      return (v==='sifreUnuttum'||v==='yeniUyelik') ? v : '';
    }catch(e){ return ''; }
  }

  function isPersonelShell(){
    try{
      var p=String(window.location.pathname||'').replace(/\/+$/,'/');
      return p==='/e-learning/' || /\/e-learning\/index\.html$/i.test(window.location.pathname||'');
    }catch(e){ return false; }
  }

  function bridgeOpenAction(){
    if(!isPersonelShell()) return;
    var action=allowedAction();
    if(!action) return;

    var frame=document.getElementById('appFrame');
    if(!frame) return;

    var applying=false;

    function apply(){
      if(applying) return;
      var raw=frame.getAttribute('src')||'';
      if(!raw || raw==='about:blank') return;

      try{
        var u=new URL(raw,window.location.href);
        if(u.searchParams.get('open')===action) return;
        applying=true;
        u.searchParams.set('open',action);
        frame.src=u.toString();
        setTimeout(function(){applying=false},0);
      }catch(e){
        applying=false;
      }
    }

    var obs=new MutationObserver(function(mutations){
      for(var i=0;i<mutations.length;i++){
        if(mutations[i].type==='attributes' && mutations[i].attributeName==='src'){
          apply();
          break;
        }
      }
    });
    obs.observe(frame,{attributes:true,attributeFilter:['src']});

    // index.html ana scripti frame.src'yi DOMContentLoaded öncesi atadığı için
    // ilk kontrol burada yapılır.
    setTimeout(apply,0);
    setTimeout(apply,120);

    window.addEventListener('message',function(event){
      var d=event.data||{};
      if(d.type!=='TBPG_LOGIN_ACTION_CONSUMED' || d.portal!=='EGITIM') return;
      if(String(d.action||'')!==action) return;

      try{
        var clean=window.location.pathname+(window.location.hash||'');
        window.history.replaceState({},document.title,clean);
      }catch(e){}

      try{obs.disconnect()}catch(e){}
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',bridgeOpenAction,{once:true});
  }else{
    bridgeOpenAction();
  }
})();
