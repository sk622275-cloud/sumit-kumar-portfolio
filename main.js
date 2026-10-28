(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Three.js particle field ----------
  var canvas = document.getElementById('bg');
  if (window.THREE && canvas) {
    var renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 7;

    var COUNT = innerWidth < 700 ? 1400 : 3200;
    var pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    var palette = [0x7C5CFF, 0x22D3EE, 0xF472B6].map(function(h){return new THREE.Color(h);});
    for (var i = 0; i < COUNT; i++) {
      var r = 3 + Math.random() * 7, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
      pos[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      pos[i*3+2] = r * Math.cos(ph) - 2;
      var c = palette[i % 3];
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({size: 0.045, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending});
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var mx = 0, my = 0, sy = 0;
    addEventListener('pointermove', function(e){ mx = (e.clientX / innerWidth - 0.5); my = (e.clientY / innerHeight - 0.5); });
    addEventListener('scroll', function(){ sy = scrollY; }, {passive: true});
    function resize(){
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();

    var t = 0;
    (function loop(){
      requestAnimationFrame(loop);
      if (!reduce) t += 0.0007;
      points.rotation.y = t * 2 + mx * 0.6;
      points.rotation.x = t + my * 0.4 + sy * 0.0004;
      camera.position.z = 7 - Math.min(sy / 500, 2);
      renderer.render(scene, camera);
    })();
  }

  // ---------- Scroll reveals, bars and counters ----------
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      el.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(el);
    });
  }, {threshold: 0.18});
  document.querySelectorAll('.reveal').forEach(function(el, i){
    el.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(el);
  });

  function count(el){
    var end = +el.dataset.count, start = performance.now(), dur = 1400;
    (function tick(now){
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + '+';
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  // ---------- Scroll progress ----------
  var bar = document.getElementById('progress');
  addEventListener('scroll', function(){
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (scrollY / h * 100) + '%';
  }, {passive: true});

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
