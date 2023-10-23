const MathEx = {
    degrees: function(radian) {
      return radian / Math.PI * 180;
    },
    radians: function(degree) {
      return degree * Math.PI / 180;
    },
    clamp: function(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },
    mix: function(x1, x2, a) {
      return x1 * (1 - a) + x2 * a;
    },
    polar: function(radian1, radian2, radius) {
      return [
        Math.cos(radian1) * Math.cos(radian2) * radius,
        Math.sin(radian1) * radius,
        Math.cos(radian1) * Math.sin(radian2) * radius,
      ];
    }
  };
  
  const debounce = (callback, duration) => {
    var timer;
    return function(event) {
      clearTimeout(timer);
      timer = setTimeout(function(){
        callback(event);
      }, duration);
    };
  };
  
  const computeFaceNormal = (v0, v1, v2) => {
    const n = [];
    const v1a = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
    const v2a = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
    n[0] = v1a[1] * v2a[2] - v1a[2] * v2a[1];
    n[1] = v1a[2] * v2a[0] - v1a[0] * v2a[2];
    n[2] = v1a[0] * v2a[1] - v1a[1] * v2a[0];
    const l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2], 2);
    for (var i = 0; i < n.length; i++) {
      n[i] = n[i] / l;
    }
    return n;
  };
  
  class SkyOctahedron {
    constructor() {
      this.uniforms = {
        time: {
          type: 'f',
          value: 0
        },
      };
      this.obj = this.createObj();
    }
    createObj() {
      const geometry = new THREE.OctahedronBufferGeometry(90, 4);
      const positions = geometry.attributes.position.array;
      const faceNormalsBase = [];
      const centersBase = [];
      const delaysBase = [];
      for (var i = 0; i < positions.length; i += 9) {
        const n = computeFaceNormal(
          [positions[i + 0], positions[i + 1], positions[i + 2]],
          [positions[i + 3], positions[i + 4], positions[i + 5]],
          [positions[i + 6], positions[i + 7], positions[i + 8]]
        );
        faceNormalsBase.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
        const c = [
          (positions[i + 0] + positions[i + 3] + positions[i + 6]) / 3,
          (positions[i + 1] + positions[i + 4] + positions[i + 7]) / 3,
          (positions[i + 2] + positions[i + 5] + positions[i + 8]) / 3
        ];
        const delay = Math.random() * 0.5;
        centersBase.push(c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2]);
        delaysBase.push(delay, delay, delay);
      }
      const faceNormals = new Float32Array(faceNormalsBase);
      const centers = new Float32Array(centersBase);
      const delays = new Float32Array(delaysBase);
      geometry.addAttribute('faceNormal', new THREE.BufferAttribute(faceNormals, 3))
      geometry.addAttribute('center', new THREE.BufferAttribute(centers, 3))
      geometry.addAttribute('delay', new THREE.BufferAttribute(delays, 1))
      return new THREE.Mesh(
        geometry,
        new THREE.RawShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: document.getElementById('vs').textContent,
          fragmentShader: document.getElementById('fs').textContent,
          shading: THREE.FlatShading,
          transparent: true,
          side: THREE.DoubleSide
        })
      )
    }
    render(time) {
      this.uniforms.time.value += time;
    }
  }
  
  class SkyOctahedronShell {
    constructor() {
      this.uniforms = {
        time: {
          type: 'f',
          value: 0
        },
      };
      this.obj = this.createObj();
    }
    createObj() {
      const geometry = new THREE.OctahedronBufferGeometry(150, 4);
      return new THREE.Mesh(
        geometry,
        new THREE.RawShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: document.getElementById('vs-shell').textContent,
          fragmentShader: document.getElementById('fs-shell').textContent,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      )
    }
    render(time) {
      this.uniforms.time.value += time;
    }
  }
  
  const canvas = document.getElementById('canvas-webgl');
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: canvas,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  const clock = new THREE.Clock();
  
  const skyOctahedron = new SkyOctahedron();
  const skyOctahedronShell = new SkyOctahedronShell();
  
  const resizeWindow = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  const render = () => {
    const time = clock.getDelta();
    skyOctahedron.render(time);
    skyOctahedronShell.render(time);
    renderer.render(scene, camera);
  }
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  }
  const on = () => {
    window.addEventListener('resize', debounce(() => {
      resizeWindow();
    }), 1000);
  }
  
  const init = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111, 1.0);
    camera.position.set(0, 400, 600);
    camera.lookAt(new THREE.Vector3());
  
    scene.add(skyOctahedron.obj);
    scene.add(skyOctahedronShell.obj);
    on();
    resizeWindow();
    renderLoop();
  }
  init();
  