AFRAME.registerComponent('follow-mouse', {
    schema: {
      sensitivity: { type: 'number', default: 0.001 },
      limitX: { type: 'number', default: 0.5 },
      limitY: { type: 'number', default: 0.5 }
    },
    init: function () {
      this.el.sceneEl.canvas.addEventListener('click', () => {
        this.el.sceneEl.canvas.requestPointerLock();
      });
      this.mouse = { x: 0, y: 0 };
      this.el.sceneEl.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    },
    onMouseMove: function (event) {
      if (document.pointerLockElement === this.el.sceneEl.canvas) {
        this.mouse.x += event.movementX * this.data.sensitivity;
        this.mouse.y += event.movementY * this.data.sensitivity;
      }
    },
    tick: function () {
      const camera = this.el.sceneEl.camera;
      const racket = this.el;
      const cameraRig = document.getElementById('cameraRig');
      const position = new THREE.Vector3();

      position.set(this.mouse.x, -this.mouse.y, -1).unproject(camera);
      position.add(cameraRig.object3D.position);

      // Apply limits
      const limitX = this.data.limitX;
      const limitY = this.data.limitY;

      // Ensure the racket stays within the visible field of view
      const cameraRigPos = cameraRig.object3D.position;
      position.x = THREE.MathUtils.clamp(position.x, cameraRigPos.x - limitX, cameraRigPos.x + limitX);
      position.y = THREE.MathUtils.clamp(position.y, cameraRigPos.y - limitY, cameraRigPos.y + limitY);

      racket.object3D.position.copy(position);
    }
  });

  AFRAME.registerComponent('ball-controller', {
    init: function () {
      this.el.addEventListener('collide', this.onCollide.bind(this));
    },
    onCollide: function (e) {
      if (e.detail.body.el.id === 'tennisRacket') {
        const direction = new THREE.Vector3().subVectors(this.el.object3D.position, e.detail.body.el.object3D.position).normalize();
        this.el.body.velocity.set(direction.x * 5, direction.y * 5, direction.z * 5);
      }
    }
  });

  AFRAME.registerComponent('look-at-ball', {
    tick: function () {
      const ball = document.getElementById('tennisBall');
      if (ball) {
        const cameraRig = this.el;
        cameraRig.object3D.lookAt(ball.object3D.position);
      }
    }
  });

  document.addEventListener('pointerlockchange', function () {
    if (document.pointerLockElement === document.querySelector('canvas')) {
      console.log('Pointer locked');
    } else {
      console.log('Pointer unlocked');
    }
  }, false);