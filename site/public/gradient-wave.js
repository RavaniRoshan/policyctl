/*
 * policyctl — vanilla WebGL gradient wave.
 * Ported from the React component (web/src/components/ui/gradient-wave.tsx).
 * Drops into any container via <script src="/gradient-wave.js"> then
 *   PolicyctlGradientWave.mount(document.getElementById('hero-gradient'), opts);
 * No framework required. All WebGL runtime is self-contained.
 */
(function (global) {
  "use strict";

  function normalizeColor(hexCode) {
    return [
      ((hexCode >> 16) & 255) / 255,
      ((hexCode >> 8) & 255) / 255,
      (255 & hexCode) / 255,
    ];
  }

  class MiniGl {
    constructor(canvas) {
      this.canvas = canvas;
      const gl = canvas.getContext("webgl", { antialias: true });
      if (!gl) throw new Error("WebGL not supported");
      this.gl = gl;
      this.meshes = [];
      const context = this.gl;
      const _miniGl = this;

      this.Uniform = class {
        constructor(e) {
          Object.assign(this, e);
          this.type = e.type || "float";
          const m = { float: "1f", int: "1i", vec2: "2fv", vec3: "3fv", vec4: "4fv", mat4: "Matrix4fv" };
          this.typeFn = m[this.type] || "1f";
        }
        update(location) {
          if (this.value === undefined || location === null) return;
          const isMatrix = this.typeFn.indexOf("Matrix") === 0;
          const fn = "uniform" + this.typeFn;
          if (isMatrix) context[fn](location, this.transpose || false, this.value);
          else context[fn](location, this.value);
        }
        getDeclaration(name, type, length) {
          if (this.excludeFrom === type) return "";
          if (this.type === "array") {
            return this.value[0].getDeclaration(name, type, this.value.length) + `\nconst int ${name}_length = ${this.value.length};`;
          }
          if (this.type === "struct") {
            let np = name.replace("u_", "");
            np = np.charAt(0).toUpperCase() + np.slice(1);
            const fields = Object.entries(this.value).map(([n, u]) => u.getDeclaration(n, type).replace(/^uniform/, "")).join("");
            return `uniform struct ${np} \n{\n${fields}\n} ${name}${length ? `[${length}]` : ""};`;
          }
          return `uniform ${this.type} ${name}${length ? `[${length}]` : ""};`;
        }
      };

      this.Attribute = class {
        constructor(e) {
          this.buffer = context.createBuffer();
          Object.assign(this, e);
          this.type = e.type || context.FLOAT;
          this.normalized = false;
        }
        update() {
          if (this.values) { context.bindBuffer(this.target, this.buffer); context.bufferData(this.target, this.values, context.STATIC_DRAW); }
        }
        attach(e, t) {
          const n = context.getAttribLocation(t, e);
          if (this.target === context.ARRAY_BUFFER) {
            context.bindBuffer(this.target, this.buffer);
            context.enableVertexAttribArray(n);
            context.vertexAttribPointer(n, this.size, this.type, this.normalized, 0, 0);
          }
          return n;
        }
        use(e) {
          context.bindBuffer(this.target, this.buffer);
          if (this.target === context.ARRAY_BUFFER) {
            context.enableVertexAttribArray(e);
            context.vertexAttribPointer(e, this.size, this.type, this.normalized, 0, 0);
          }
        }
      };

      this.Material = class {
        constructor(vertexShaders, fragments, uniforms = {}) {
          const material = this;
          function getShader(type, source) {
            const s = context.createShader(type);
            context.shaderSource(s, source);
            context.compileShader(s);
            if (!context.getShaderParameter(s, context.COMPILE_STATUS)) throw new Error(context.getShaderInfoLog(s) || "Shader compilation error");
            return s;
          }
          function decl(u, type) { return Object.entries(u).map(([k, v]) => v.getDeclaration(k, type)).join("\n"); }
          this.uniforms = uniforms;
          const prefix = "precision highp float;";
          const vs = `${prefix}\nattribute vec4 position;\nattribute vec2 uv;\nattribute vec2 uvNorm;\n${decl(_miniGl.commonUniforms, "vertex")}\n${decl(uniforms, "vertex")}\n${vertexShaders}`;
          const fs = `${prefix}\n${decl(_miniGl.commonUniforms, "fragment")}\n${decl(uniforms, "fragment")}\n${fragments}`;
          this.program = context.createProgram();
          context.attachShader(this.program, getShader(context.VERTEX_SHADER, vs));
          context.attachShader(this.program, getShader(context.FRAGMENT_SHADER, fs));
          context.linkProgram(this.program);
          if (!context.getProgramParameter(this.program, context.LINK_STATUS)) throw new Error(context.getProgramInfoLog(this.program) || "Program linking error");
          context.useProgram(this.program);
          this.attachUniforms(undefined, _miniGl.commonUniforms);
          this.attachUniforms(undefined, this.uniforms);
        }
        attachUniforms(name, uniforms) {
          if (name === undefined) Object.entries(uniforms).forEach(([n, u]) => this.attachUniforms(n, u));
          else if (uniforms.type === "array") uniforms.value.forEach((u, i) => this.attachUniforms(`${name}[${i}]`, u));
          else if (uniforms.type === "struct") Object.entries(uniforms.value).forEach(([u, i]) => this.attachUniforms(`${name}.${u}`, i));
          else this.uniformInstances.push({ uniform: uniforms, location: context.getUniformLocation(this.program, name) });
        }
      };

      this.PlaneGeometry = class {
        constructor() {
          this.width = 1; this.height = 1; this.vertexCount = 0; this.xSegCount = 0; this.ySegCount = 0;
          this.attributes = {
            position: new _miniGl.Attribute({ target: context.ARRAY_BUFFER, size: 3 }),
            uv: new _miniGl.Attribute({ target: context.ARRAY_BUFFER, size: 2 }),
            uvNorm: new _miniGl.Attribute({ target: context.ARRAY_BUFFER, size: 2 }),
            index: new _miniGl.Attribute({ target: context.ELEMENT_ARRAY_BUFFER, size: 3, type: context.UNSIGNED_SHORT }),
          };
        }
        setTopology(xSegs = 1, ySegs = 1) {
          this.xSegCount = xSegs; this.ySegCount = ySegs;
          this.vertexCount = (xSegs + 1) * (ySegs + 1);
          const qc = xSegs * ySegs * 2;
          this.attributes.uv.values = new Float32Array(2 * this.vertexCount);
          this.attributes.uvNorm.values = new Float32Array(2 * this.vertexCount);
          this.attributes.index.values = new Uint16Array(3 * qc);
          for (let y = 0; y <= ySegs; y++) for (let x = 0; x <= xSegs; x++) {
            const i = y * (xSegs + 1) + x;
            this.attributes.uv.values[2 * i] = x / xSegs;
            this.attributes.uv.values[2 * i + 1] = 1 - y / ySegs;
            this.attributes.uvNorm.values[2 * i] = (x / xSegs) * 2 - 1;
            this.attributes.uvNorm.values[2 * i + 1] = 1 - (y / ySegs) * 2;
            if (x < xSegs && y < ySegs) {
              const s = y * xSegs + x;
              this.attributes.index.values[6 * s] = i;
              this.attributes.index.values[6 * s + 1] = i + 1 + xSegs;
              this.attributes.index.values[6 * s + 2] = i + 1;
              this.attributes.index.values[6 * s + 3] = i + 1;
              this.attributes.index.values[6 * s + 4] = i + 1 + xSegs;
              this.attributes.index.values[6 * s + 5] = i + 2 + xSegs;
            }
          }
          this.attributes.uv.update(); this.attributes.uvNorm.update(); this.attributes.index.update();
        }
        setSize(width = 1, height = 1) {
          this.width = width; this.height = height;
          this.attributes.position.values = new Float32Array(3 * this.vertexCount);
          const ox = width / -2, oy = height / -2, sw = width / this.xSegCount, sh = height / this.ySegCount;
          for (let y = 0; y <= this.ySegCount; y++) for (let x = 0; x <= this.xSegCount; x++) {
            const idx = y * (this.xSegCount + 1) + x;
            this.attributes.position.values[3 * idx] = ox + x * sw;
            this.attributes.position.values[3 * idx + 1] = -(oy + y * sh);
            this.attributes.position.values[3 * idx + 2] = 0;
          }
          this.attributes.position.update();
        }
      };

      this.Mesh = class {
        constructor(geometry, material) {
          this.geometry = geometry; this.material = material;
          this.attributeInstances = [];
          Object.entries(this.geometry.attributes).forEach(([e, attribute]) => {
            this.attributeInstances.push({ attribute, location: attribute.attach(e, this.material.program) });
          });
          _miniGl.meshes.push(this);
        }
        draw() {
          context.useProgram(this.material.program);
          this.material.uniformInstances.forEach(({ uniform, location }) => uniform.update(location));
          this.attributeInstances.forEach(({ attribute, location }) => attribute.use(location));
          context.drawElements(context.TRIANGLES, this.geometry.attributes.index.values.length, context.UNSIGNED_SHORT, 0);
        }
      };

      const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      this.commonUniforms = {
        projectionMatrix: new this.Uniform({ type: "mat4", value: I }),
        modelViewMatrix: new this.Uniform({ type: "mat4", value: I }),
        resolution: new this.Uniform({ type: "vec2", value: [1, 1] }),
        aspectRatio: new this.Uniform({ type: "float", value: 1 }),
      };
    }
    setSize(w = 640, h = 480) { this.width = w; this.height = h; this.canvas.width = w; this.canvas.height = h; this.gl.viewport(0, 0, w, h); this.commonUniforms.resolution.value = [w, h]; this.commonUniforms.aspectRatio.value = w / h; }
    setOrthographicCamera() {
      this.commonUniforms.projectionMatrix.value = [2 / this.width, 0, 0, 0, 0, 2 / this.height, 0, 0, 0, 0, -0.001, 0, 0, 0, 0, 1];
    }
    render() { this.gl.clearColor(0, 0, 0, 0); this.gl.clearDepth(1); this.meshes.forEach((m) => m.draw()); }
  }

  class Gradient {
    constructor(canvas, colors) {
      this.canvas = canvas; this.colors = colors;
      this.minigl = new MiniGl(canvas); this.time = 0; this.last = 0;
      this.animationId = null; this.isPlaying = false;
      this.init();
    }
    init() {
      const sectionColors = this.colors.map((hex) => normalizeColor(parseInt(hex.replace("#", "0x"), 16)));
      const U = {
        u_time: new this.minigl.Uniform({ value: 0 }),
        u_shadow_power: new this.minigl.Uniform({ value: 5 }),
        u_darken_top: new this.minigl.Uniform({ value: 0 }),
        u_active_colors: new this.minigl.Uniform({ value: [1, 1, 1, 1], type: "vec4" }),
        u_global: new this.minigl.Uniform({ value: { noiseFreq: new this.minigl.Uniform({ value: [0.00014, 0.00029], type: "vec2" }), noiseSpeed: new this.minigl.Uniform({ value: 0.000005 }) }, type: "struct" }),
        u_vertDeform: new this.minigl.Uniform({ value: { incline: new this.minigl.Uniform({ value: 0 }), offsetTop: new this.minigl.Uniform({ value: -0.5 }), offsetBottom: new this.minigl.Uniform({ value: -0.5 }), noiseFreq: new this.minigl.Uniform({ value: [3, 4], type: "vec2" }), noiseAmp: new this.minigl.Uniform({ value: 320 }), noiseSpeed: new this.minigl.Uniform({ value: 10 }), noiseFlow: new this.minigl.Uniform({ value: 3 }), noiseSeed: new this.minigl.Uniform({ value: 5 }) }, type: "struct", excludeFrom: "fragment" }),
        u_baseColor: new this.minigl.Uniform({ value: sectionColors[0], type: "vec3", excludeFrom: "fragment" }),
        u_waveLayers: new this.minigl.Uniform({ value: [], excludeFrom: "fragment", type: "array" }),
      };
      for (let i = 1; i < sectionColors.length; i++) {
        U.u_waveLayers.value.push(new this.minigl.Uniform({ value: {
          color: new this.minigl.Uniform({ value: sectionColors[i], type: "vec3" }),
          noiseFreq: new this.minigl.Uniform({ value: [2 + i / sectionColors.length, 3 + i / sectionColors.length], type: "vec2" }),
          noiseSpeed: new this.minigl.Uniform({ value: 11 + 0.3 * i }),
          noiseFlow: new this.minigl.Uniform({ value: 6.5 + 0.3 * i }),
          noiseSeed: new this.minigl.Uniform({ value: 5 + 10 * i }),
          noiseFloor: new this.minigl.Uniform({ value: 0.1 }),
          noiseCeil: new this.minigl.Uniform({ value: 0.63 + 0.07 * i }),
        }, type: "struct" }));
      }
      const vertex = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
vec3 blendNormal(vec3 base,vec3 blend,float opacity){return(blend*opacity+base*(1.0-opacity));}
varying vec3 v_color;
void main(){
  float time=u_time*u_global.noiseSpeed;vec2 noiseCoord=resolution*uvNorm*u_global.noiseFreq;
  float tilt=resolution.y/2.0*uvNorm.y;float incline=resolution.x*uvNorm.x/2.0*u_vertDeform.incline;
  float offset=resolution.x/2.0*u_vertDeform.incline*mix(u_vertDeform.offsetBottom,u_vertDeform.offsetTop,uv.y);
  float noise=snoise(vec3(noiseCoord.x*u_vertDeform.noiseFreq.x+time*u_vertDeform.noiseFlow,noiseCoord.y*u_vertDeform.noiseFreq.y,time*u_vertDeform.noiseSpeed+u_vertDeform.noiseSeed))*u_vertDeform.noiseAmp;
  noise*=1.0-pow(abs(uvNorm.y),2.0);noise=max(0.0,noise);
  vec3 pos=vec3(position.x,position.y+tilt+incline+noise-offset,position.z);v_color=u_baseColor;
  for(int i=0;i<u_waveLayers_length;i++){
    if(u_active_colors[i+1]==1.){
      WaveLayers layer=u_waveLayers[i];
      float ln=smoothstep(layer.noiseFloor,layer.noiseCeil,snoise(vec3(noiseCoord.x*layer.noiseFreq.x+time*layer.noiseFlow,noiseCoord.y*layer.noiseFreq.y,time*layer.noiseSpeed+layer.noiseSeed))/2.0+0.5);
      v_color=blendNormal(v_color,layer.color,pow(ln,4.));
    }
  }
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);}`;
      const fragment = `varying vec3 v_color;void main(){vec3 color=v_color;if(u_darken_top==1.0){vec2 st=gl_FragCoord.xy/resolution.xy;color.g-=pow(st.y+sin(-12.0)*st.x,u_shadow_power)*0.4;}gl_FragColor=vec4(color,1.0);}`;
      const material = new this.minigl.Material(vertex, fragment, U);
      const geometry = new this.minigl.PlaneGeometry();
      this.mesh = new this.minigl.Mesh(geometry, material);
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }
    resize() {
      const w = window.innerWidth, h = window.innerHeight;
      this.minigl.setSize(w, h); this.minigl.setOrthographicCamera();
      this.mesh.geometry.setTopology(Math.ceil(w * 0.02), Math.ceil(h * 0.05));
      this.mesh.geometry.setSize(w, h);
      this.mesh.material.uniforms.u_shadow_power.value = w < 600 ? 5 : 6;
    }
    animate = (timestamp) => {
      if (!this.isPlaying) return;
      this.time += Math.min(timestamp - this.last, 1000 / 15);
      this.last = timestamp;
      this.mesh.material.uniforms.u_time.value = this.time;
      this.minigl.render();
      this.animationId = requestAnimationFrame(this.animate);
    };
    start() { this.isPlaying = true; this.animationId = requestAnimationFrame(this.animate); }
    stop() { this.isPlaying = false; if (this.animationId) cancelAnimationFrame(this.animationId); }
  }

  /** Mount a gradient wave behind (or inside) a container element. */
  function mount(el, opts = {}) {
    if (!el) return null;
    const colors = opts.colors || ["#0D9373", "#02241e", "#F59E0B", "#043a2f", "#34d399", "#086651"];
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "block" });
    const first = el.firstChild;
    el.style.position = el.style.position || "relative";
    el.insertBefore(canvas, first);
    try {
      const gradient = new Gradient(canvas, colors);
      gradient.mesh.material.uniforms.u_shadow_power.value = opts.shadowPower ?? 8;
      gradient.mesh.material.uniforms.u_darken_top.value = opts.darkenTop ? 1 : 0;
      gradient.mesh.material.uniforms.u_global.value.noiseFreq.value = opts.noiseFrequency || [0.0001, 0.0009];
      gradient.mesh.material.uniforms.u_global.value.noiseSpeed.value = opts.noiseSpeed ?? 0.00001;
      Object.assign(gradient.mesh.material.uniforms.u_vertDeform.value, { ...gradient.mesh.material.uniforms.u_vertDeform.value, ...(opts.deform || {}) });
      if (opts.isPlaying !== false) gradient.start();
      return gradient;
    } catch (e) {
      console.error("policyctl: failed to initialize gradient wave:", e);
      return null;
    }
  }

  global.PolicyctlGradientWave = { mount, Gradient, MiniGl };
})(typeof window !== "undefined" ? window : globalThis);
