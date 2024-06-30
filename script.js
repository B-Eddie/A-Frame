// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xb0e0e6); // Light blue background color
document.body.appendChild(renderer.domElement);

// Create a plane (ground)
const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0x404040, 15); // Soft white light
scene.add(ambientLight);


// Load the car model
const loader = new THREE.GLTFLoader();
let car;

loader.load('models/4.glb', function (gltf) {
    car = gltf.scene; 
    // 4 8 14
    // 13 need to zoom out
    car.position.set(0, 1, 0); // Adjust the start position as needed
    // car.traverse((child) => {
    //     if (child.isMesh) {
    //         child.material = new THREE.MeshStandardMaterial({ color: 0x2E3034 );
    //     }
    // });
    scene.add(car);

    // Start the animation loop after the car is loaded
    animate();
}, undefined, function (error) {
    console.error(error);
});

// Properties for car physics
const baseMaxSpeed = 0.5; // Base maximum speed of the car
let maxSpeed = baseMaxSpeed; // Maximum speed of the car (can be adjusted with shift key)
const acceleration = 0.01; // Acceleration rate
const deceleration = 0.001; // Deceleration rate
const turnSpeed = 0.03; // Turning speed
const reverseSpeed = maxSpeed / 2; // Speed when moving backward

let speed = 0; // Current speed of the car
let angularVelocity = 0; // Angular velocity (turning speed)

// Position the camera
camera.position.set(0, 10, 25);

// Setup keyboard controls
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false // Shift key for faster speed
};

function onKeyDown(event) {
    switch (event.keyCode) {
        case 87: // W key (forward)
            keys.forward = true;
            break;
        case 83: // S key (backward)
            keys.backward = true;
            break;
        case 65: // A key (left)
            keys.left = true;
            break;
        case 68: // D key (right)
            keys.right = true;
            break;
        case 16: // Shift key
            keys.shift = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.keyCode) {
        case 87: // W key (forward)
            keys.forward = false;
            break;
        case 83: // S key (backward)
            keys.backward = false;
            break;
        case 65: // A key (left)
            keys.left = false;
            break;
        case 68: // D key (right)
            keys.right = false;
            break;
        case 16: // Shift key
            keys.shift = false;
            break;
    }
}

// Add event listeners for keydown and keyup events
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// Function to animate the scene
function animate() {
    requestAnimationFrame(animate);

    // Update car physics if the car model is loaded
    if (car) {
        updateCarPhysics();
        moveCar();

        // Update camera position to follow the car
        camera.position.copy(car.position).add(new THREE.Vector3(6, 5, 9));
        camera.lookAt(car.position);
    }

    renderer.render(scene, camera);
}

function updateCarPhysics() {
    // Adjust maximum speed based on shift key state
    maxSpeed = keys.shift ? baseMaxSpeed * 2 : baseMaxSpeed;

    // Acceleration and deceleration based on key input
    if (keys.forward) {
        speed = Math.min(speed + acceleration, maxSpeed);
    } else if (keys.backward) {
        speed = Math.max(speed - acceleration, -reverseSpeed);
    } else {
        if (speed > 0) {
            speed = Math.max(speed - deceleration, 0);
        } else if (speed < 0) {
            speed = Math.min(speed + deceleration, 0);
        }
    }

    // Turning based on key input and current speed
    if ((keys.left || keys.right) && Math.abs(speed) > 0.01) {
        angularVelocity = turnSpeed * (keys.left ? 1 : -1);
    } else {
        angularVelocity = 0;
    }

    // Apply rotation (angular velocity) to the car
    car.rotation.y += angularVelocity;
}

function moveCar() {
    // Move the car in the direction it's facing
    car.position.x += speed * Math.sin(car.rotation.y);
    car.position.z += speed * Math.cos(car.rotation.y);
}

// Removed the initial animate call because we only start it after the car is loaded
