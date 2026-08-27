/**
 * REALITY BREACH — Gravitational Singularity Image Engine
 * WebGL shader-based gravitational lensing, temporal echoes,
 * chromatic aberration, and dimensional collapse.
 */
(function () {
  'use strict';

  const ECHO_COUNT = 8;

  const VERT = `
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main(){ v_uv = a_uv; gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform sampler2D u_img;
    uniform vec2 u_mouse, u_res;
    uniform vec2 u_echo[8];
    uniform float u_time, u_int, u_vel, u_sing, u_prox;
    varying vec2 v_uv;

    float hash(vec2 p){
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    vec2 gravLens(vec2 uv, vec2 center, float mass){
      vec2 d = uv - center;
      float dist = length(d) + 0.001;
      float pull = min(mass / (dist*dist + 0.008), 0.45);
      return d * pull;
    }

    void main(){
      vec2 uv = v_uv;
      float t = u_time;
      float I = u_int;
      float V = min(u_vel, 1.5);
      vec2 ar = vec2(u_res.x/u_res.y, 1.0);

      // Stage 1: Ambient breathing
      uv += sin(t*0.5)*0.0015*(uv-0.5);

      // Stage 2: Edge micro-noise
      float edge = min(min(uv.x,1.0-uv.x), min(uv.y,1.0-uv.y));
      float ef = 1.0-smoothstep(0.0,0.12,edge);
      uv += noise(uv*70.0+t*0.3)*0.003*ef*max(u_prox, I);

      // Stage 3: Proximity light-bend
      if(u_prox > 0.01){
        vec2 pd = uv - u_mouse;
        float pdist = length(pd*ar);
        uv += normalize(pd+0.0001) * u_prox*0.004/(pdist+0.3);
      }

      // Stage 4: Gravitational distortion
      float gs = I * 0.04 * (1.0 + V*3.0);
      vec2 gd = gravLens(uv, u_mouse, gs);

      // Rotational curvature
      float ang = length(gd)*3.14*0.4;
      mat2 rot = mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
      gd = mix(gd, rot*gd, I*0.3);

      // Organic turbulence
      float turb = noise(uv*20.0+t*0.2)*0.006*I*(1.0+V*2.0);
      gd += turb;

      // Stage 5: Chromatic aberration
      float ab = I*0.006*(1.0+V*4.0);
      vec2 abDir = normalize(gd+0.0001);
      vec2 rUV = clamp(uv+gd*1.12+abDir*ab, 0.0, 1.0);
      vec2 gUV = clamp(uv+gd, 0.0, 1.0);
      vec2 bUV = clamp(uv+gd*0.88-abDir*ab, 0.0, 1.0);

      float r = texture2D(u_img, rUV).r;
      float g = texture2D(u_img, gUV).g;
      float b = texture2D(u_img, bUV).b;
      vec3 col = vec3(r,g,b);

      // Stage 6: Temporal echoes
      for(int i=0; i<8; i++){
        float age = float(i+1)/8.0;
        float op = I * 0.1 * (1.0-age*age);
        if(op < 0.005) continue;
        vec2 em = u_echo[i];
        vec2 ed = gravLens(uv, em, gs*0.4);
        vec2 euv = clamp(uv + ed*(1.0+age*1.5), 0.0, 1.0);
        vec3 ec = texture2D(u_img, euv).rgb;
        // Alternate: ghost/negative
        if(i==1||i==3||i==6) ec = vec3(1.0)-ec;
        // Depth fade
        ec *= (1.0 - age*0.4);
        col = mix(col, ec, op);
      }

      // Stage 7: Singularity collapse
      if(u_sing > 0.01){
        vec2 c = vec2(0.5);
        vec2 sd = uv - c;
        float sdist = length(sd);
        float sp = u_sing*0.85;
        // Spiral compression
        float sa = u_sing*8.0;
        mat2 sr = mat2(cos(sa),-sin(sa),sin(sa),cos(sa));
        vec2 suv = c + sr*sd*(1.0-sp);
        vec3 sc = texture2D(u_img, clamp(suv,0.0,1.0)).rgb;
        // Edge energy ring
        float ring = smoothstep(0.02,0.08,sdist)*(1.0-smoothstep(0.15,0.4,sdist));
        sc += vec3(0.9,0.95,1.0)*ring*u_sing*0.6;
        col = mix(col, sc, u_sing);
      }

      // Stage 8: Micro scanlines
      float scan = sin(v_uv.y*u_res.y*1.5+t*2.0)*0.012*I;
      col -= scan;

      // Stage 9: Distortion edge glow
      float dm = length(gd);
      float eg = smoothstep(0.008,0.04,dm)*(1.0-smoothstep(0.04,0.12,dm));
      col += vec3(0.7,0.85,1.0)*eg*I*0.25;

      // Stage 10: Displacement ripple
      float ripple = sin(length((uv-u_mouse)*ar)*40.0 - t*5.0)*0.008*I*V;
      col += ripple;

      // Vignette
      col *= 1.0 - length(v_uv-0.5)*0.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // ═══ ENGINE ═══
  function init() {
    const scene = document.querySelector('.cuboid-scene');
    if (!scene) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wrap = document.getElementById('reality-breach-wrap');
    if (!wrap) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'reality-canvas';
    wrap.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return; // Fallback: image stays visible

    // ─── Compile shaders ───
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // ─── Geometry (fullscreen quad) ───
    const verts = new Float32Array([
      -1,-1, 0,1,  1,-1, 1,1,  -1,1, 0,0,  1,1, 1,0
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    const aUV = gl.getAttribLocation(prog, 'a_uv');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8);

    // ─── Uniforms ───
    const loc = {};
    ['u_img','u_mouse','u_res','u_time','u_int','u_vel','u_sing','u_prox'].forEach(n => {
      loc[n] = gl.getUniformLocation(prog, n);
    });
    const echoLocs = [];
    for (let i = 0; i < ECHO_COUNT; i++) {
      echoLocs.push(gl.getUniformLocation(prog, `u_echo[${i}]`));
    }

    // ─── Texture ───
    const tex = gl.createTexture();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let textureReady = false;

    img.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureReady = true;

      // Hide the fallback image, show canvas
      const fallback = wrap.querySelector('.rb-fallback');
      if (fallback) fallback.style.opacity = '0';
      canvas.style.opacity = '1';

      requestAnimationFrame(render);
    };
    img.src = 'pic.png';

    // ─── State ───
    let mouseX = 0.5, mouseY = 0.5;
    let targetInt = 0, currentInt = 0;
    let velocity = 0, targetVel = 0;
    let singularity = 0, singTarget = 0;
    let proximity = 0, targetProx = 0;
    let lastMX = 0, lastMY = 0, lastMoveTime = 0;
    let isHovering = false;
    let startTime = performance.now();

    // Echo history buffer
    const echoHistory = [];
    for (let i = 0; i < ECHO_COUNT; i++) echoHistory.push([0.5, 0.5]);
    let lastEchoTime = 0;

    // ─── Sizing ───
    function resize() {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ─── Mouse tracking ───
    function updateMouse(cx, cy) {
      const rect = wrap.getBoundingClientRect();
      mouseX = (cx - rect.left) / rect.width;
      mouseY = (cy - rect.top) / rect.height;

      const now = performance.now();
      const dt = now - lastMoveTime;
      if (dt > 0) {
        const dx = cx - lastMX;
        const dy = cy - lastMY;
        targetVel = Math.min(Math.sqrt(dx * dx + dy * dy) / dt, 2.0);
      }
      lastMX = cx;
      lastMY = cy;
      lastMoveTime = now;
    }

    // Proximity: track mouse even outside the element
    document.addEventListener('mousemove', function (e) {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRange = 300;
      targetProx = Math.max(0, 1 - dist / maxRange);

      if (isHovering) updateMouse(e.clientX, e.clientY);
    }, { passive: true });

    wrap.addEventListener('mouseenter', function () {
      isHovering = true;
      targetInt = 1;
    });
    wrap.addEventListener('mouseleave', function () {
      isHovering = false;
      targetInt = 0;
      targetVel = 0;
    });
    wrap.addEventListener('mousemove', function (e) {
      updateMouse(e.clientX, e.clientY);
    }, { passive: true });

    // Singularity on click
    wrap.addEventListener('mousedown', function () {
      singTarget = 1;
    });
    wrap.addEventListener('mouseup', function () {
      singTarget = 0;
    });

    // Touch support
    wrap.addEventListener('touchstart', function (e) {
      isHovering = true;
      targetInt = 1;
      const touch = e.touches[0];
      updateMouse(touch.clientX, touch.clientY);
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      const touch = e.touches[0];
      updateMouse(touch.clientX, touch.clientY);
    }, { passive: true });
    wrap.addEventListener('touchend', function () {
      isHovering = false;
      targetInt = 0;
      targetVel = 0;
    });

    // Long press = singularity on mobile
    let longPressTimer = null;
    wrap.addEventListener('touchstart', function () {
      longPressTimer = setTimeout(() => { singTarget = 1; }, 400);
    }, { passive: true });
    wrap.addEventListener('touchend', function () {
      clearTimeout(longPressTimer);
      singTarget = 0;
    });

    // ─── Render loop ───
    function render(now) {
      if (!textureReady) { requestAnimationFrame(render); return; }

      const t = (now - startTime) / 1000;

      // Smooth interpolation
      currentInt += (targetInt - currentInt) * 0.08;
      velocity += (targetVel - velocity) * 0.1;
      targetVel *= 0.92;
      proximity += (targetProx - proximity) * 0.06;

      // Singularity: fast attack, faster release
      if (singTarget > singularity) {
        singularity += (singTarget - singularity) * 0.06;
      } else {
        singularity += (singTarget - singularity) * 0.15;
      }

      // Update echo history
      if (now - lastEchoTime > 60) {
        echoHistory.pop();
        echoHistory.unshift([mouseX, mouseY]);
        lastEchoTime = now;
      }

      // Set uniforms
      gl.uniform1i(loc.u_img, 0);
      gl.uniform2f(loc.u_mouse, mouseX, mouseY);
      gl.uniform2f(loc.u_res, canvas.width, canvas.height);
      gl.uniform1f(loc.u_time, t);
      gl.uniform1f(loc.u_int, currentInt);
      gl.uniform1f(loc.u_vel, velocity);
      gl.uniform1f(loc.u_sing, singularity);
      gl.uniform1f(loc.u_prox, proximity);

      for (let i = 0; i < ECHO_COUNT; i++) {
        gl.uniform2f(echoLocs[i], echoHistory[i][0], echoHistory[i][1]);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(render);
    }
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Delay slightly to ensure other scripts have set up the DOM
    setTimeout(init, 100);
  }
})();
