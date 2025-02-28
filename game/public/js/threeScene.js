// Three.js scene module
let threeScene, camera, renderer, controls;
const userAvatars = {};
let socket;  // Will be set via initThreeScene

// Initialize Three.js scene
export function initThreeScene(sharedSocket) {
  socket = sharedSocket;  // Use the shared socket instance
  
  // Create scene
  threeScene = new THREE.Scene();
  // Dark elegant background for the presentation hall - slightly lighter
  threeScene.background = new THREE.Color(0x1a1a44);
  // Reduced fog for more visibility
  threeScene.fog = new THREE.FogExp2(0x1a1a44, 0.002);

  // Create camera with wider field of view
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.5, 10); // Higher position to see more of the larger hall

  // Create renderer with enhanced visuals
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
  renderer.outputEncoding = THREE.sRGBEncoding; // Better color rendering
  renderer.toneMappingExposure = 1.2; // Brighter overall scene
  document.getElementById('3d-container').appendChild(renderer.domElement);

  // Add lights for the presentation hall

  // Ambient light - brighter warm glow
  const ambientLight = new THREE.AmbientLight(0x6060a0, 0.6);
  threeScene.add(ambientLight);

  // Main directional light - simulates daylight from skylights 
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 15, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -40;
  directionalLight.shadow.camera.right = 40;
  directionalLight.shadow.camera.top = 40;
  directionalLight.shadow.camera.bottom = -40;
  threeScene.add(directionalLight);

  // Add spotlight for stage area - brighter
  const spotLight = new THREE.SpotLight(0xffffff, 2.0);
  spotLight.position.set(0, 25, -15);
  spotLight.angle = Math.PI / 5;
  spotLight.penumbra = 0.3;
  spotLight.decay = 1.5;
  spotLight.distance = 80;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  threeScene.add(spotLight);
  
  // Add more spotlights that move/rotate for dynamic effect
  for (let i = 0; i < 5; i++) {
    const movingSpotlight = new THREE.SpotLight(
      i % 5 === 0 ? 0x0088ff : 
      i % 5 === 1 ? 0xff3366 : 
      i % 5 === 2 ? 0xffaa00 : 
      i % 5 === 3 ? 0x00ff99 : 0xff00ff, 
      1.8
    );
    movingSpotlight.position.set(
      -30 + i * 15,
      15, 
      i % 2 === 0 ? -20 : -15
    );
    movingSpotlight.angle = Math.PI / 8;
    movingSpotlight.penumbra = 0.4;
    movingSpotlight.decay = 1.5;
    movingSpotlight.distance = 50;
    threeScene.add(movingSpotlight);
    
    // Store spotlight in a property for animation
    threeScene[`movingSpotlight${i}`] = movingSpotlight;
  }

  // Add floor for the presentation hall - larger
  const floorSize = 100;
  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333355, // Slightly brighter blue-gray for elegant flooring
    roughness: 0.1,
    metalness: 0.8,
    envMapIntensity: 0.8
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  threeScene.add(floor);
  
  // Add reflective floor overlay
  const reflectiveFloorGeometry = new THREE.PlaneGeometry(floorSize * 0.6, floorSize * 0.6);
  const reflectiveFloorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x444466,
    roughness: 0.05,
    metalness: 0.9,
    envMapIntensity: 1.0
  });
  const reflectiveFloor = new THREE.Mesh(reflectiveFloorGeometry, reflectiveFloorMaterial);
  reflectiveFloor.rotation.x = -Math.PI / 2;
  reflectiveFloor.position.y = 0.01; // Slightly above the main floor
  reflectiveFloor.receiveShadow = true;
  threeScene.add(reflectiveFloor);

  // Create walls and stage - larger
  createPresentationHall();

  // Add presentation hall decorations
  addPresentationDecorations();

  // Add laser effects
  createLaserEffects();

  // Set up controls (first-person view)
  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 0.25; // Faster movement for larger space

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start animation loop
  animate();

  return { threeScene, camera, renderer, controls };
}

// First-person controls
class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = true;
    
    this.movementSpeed = 0.15;
    this.lookSpeed = 0.002;
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Add euler to track rotation
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    this.mouseDragOn = false;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.viewHalfX = window.innerWidth / 2;
    this.viewHalfY = window.innerHeight / 2;
    
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);
    this.domElement.addEventListener('mousemove', this.onMouseMove, false);
    this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    this.domElement.addEventListener('mouseup', this.onMouseUp, false);
    
    this.domElement.requestPointerLock = this.domElement.requestPointerLock ||
                                          this.domElement.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
                               document.mozExitPointerLock;
                               
    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this), false);
    document.addEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this), false);
    
    this.lastPosition = new THREE.Vector3();
    this.lastRotation = new THREE.Euler();
    this.lastPosition.copy(camera.position);
    this.lastRotation.copy(camera.rotation);
  }
  
  onPointerLockChange() {
    if (document.pointerLockElement === this.domElement || 
        document.mozPointerLockElement === this.domElement) {
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }
  
  onMouseMove(event) {
    if (!this.enabled) return;
    
    if (document.pointerLockElement === this.domElement ||
        document.mozPointerLockElement === this.domElement) {
      this.mouseX = event.movementX || event.mozMovementX || 0;
      this.mouseY = event.movementY || event.mozMovementY || 0;
      
      // Update euler angles
      this.euler.setFromQuaternion(this.camera.quaternion);
      
      // Update Y (left/right) rotation
      this.euler.y -= this.mouseX * this.lookSpeed;
      
      // Update X (up/down) rotation with clamping
      this.euler.x = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, 
        this.euler.x - this.mouseY * this.lookSpeed));
      
      // Keep Z at 0
      this.euler.z = 0;
      
      // Apply the rotation
      this.camera.quaternion.setFromEuler(this.euler);
    }
  }
  
  onMouseDown() {
    this.mouseDragOn = true;
  }
  
  onMouseUp() {
    this.mouseDragOn = false;
  }
  
  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
        
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
        
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
        
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
        
      case 'Space':
        // Add jump functionality if needed
        break;
    }
  }
  
  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
        
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
        
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
        
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
    }
  }
  
  update() {
    if (!this.enabled) return;
    
    // Reset velocity
    this.velocity.x = 0;
    this.velocity.z = 0;
    
    // Calculate movement direction based on camera's current rotation
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    // Get the camera's forward and right directions
    this.camera.getWorldDirection(forward);
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    
    // Zero out Y component to keep movement horizontal
    forward.y = 0;
    right.y = 0;
    
    // Normalize the vectors to ensure consistent movement speed
    forward.normalize();
    right.normalize();
    
    // Apply movement based on input
    if (this.moveForward) this.velocity.add(forward.multiplyScalar(this.movementSpeed));
    if (this.moveBackward) this.velocity.sub(forward.multiplyScalar(this.movementSpeed));
    if (this.moveRight) this.velocity.add(right.multiplyScalar(this.movementSpeed));
    if (this.moveLeft) this.velocity.sub(right.multiplyScalar(this.movementSpeed));
    
    // Update camera position
    this.camera.position.add(this.velocity);
    
    // Check if position or rotation has changed significantly
    const positionChanged = this.lastPosition.distanceTo(this.camera.position) > 0.01;
    const rotationChanged = Math.abs(this.lastRotation.y - this.camera.rotation.y) > 0.01;
    
    // Send position update to server if position changed
    if (positionChanged && socket) {
      socket.emit('move', {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      });
      this.lastPosition.copy(this.camera.position);
    }
    
    // Send rotation update to server if rotation changed
    if (rotationChanged && socket) {
      socket.emit('rotate', { y: this.camera.rotation.y });
      this.lastRotation.copy(this.camera.rotation);
    }
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Animate moving spotlights
  const currentTime = Date.now() * 0.001; // Convert to seconds
  
  // Animate all 5 spotlights with varying patterns
  for (let i = 0; i < 5; i++) {
    if (threeScene[`movingSpotlight${i}`]) {
      const spotlight = threeScene[`movingSpotlight${i}`];
      
      // Different patterns for each spotlight
      if (i % 2 === 0) {
        spotlight.position.x = -30 + (i * 15) + Math.sin(currentTime * (0.2 + i * 0.05)) * 10;
        spotlight.position.z = (i % 2 === 0 ? -20 : -15) + Math.cos(currentTime * (0.3 + i * 0.05)) * 8;
      } else {
        spotlight.position.x = -30 + (i * 15) + Math.cos(currentTime * (0.25 + i * 0.05)) * 10;
        spotlight.position.z = (i % 2 === 0 ? -20 : -15) + Math.sin(currentTime * (0.35 + i * 0.05)) * 8;
      }
      
      // Vary the intensity to create pulsing effect
      spotlight.intensity = 1.8 + Math.sin(currentTime * (1 + i * 0.2)) * 0.5;
    }
  }
  
  // Animate particle systems if they exist
  if (threeScene.particleSystem) {
    const particles = threeScene.particleSystem.geometry.attributes.position;
    const count = particles.count;
    
    for (let i = 0; i < count; i++) {
      // For 3rd coordinate (y - height)
      const yVal = particles.getY(i);
      particles.setY(i, yVal < 25 ? yVal + 0.07 : 0);
    }
    
    particles.needsUpdate = true;
  }
  
  // Animate lasers
  if (threeScene.laserBeams) {
    threeScene.laserBeams.forEach((laser, index) => {
      // Rotate each laser in a different pattern
      laser.rotation.y = (currentTime * (0.2 + index * 0.1)) % (Math.PI * 2);
      
      // Vary the thickness/intensity
      const scaleVal = 0.8 + Math.sin(currentTime * (2 + index * 0.5)) * 0.3;
      laser.scale.x = scaleVal;
      laser.scale.z = scaleVal;
    });
  }
  
  // Animate floating objects
  if (threeScene.floatingObjects) {
    threeScene.floatingObjects.forEach((obj, index) => {
      // Bobbing motion
      obj.position.y = obj.userData.baseY + Math.sin(currentTime * (0.5 + index * 0.1)) * 0.5;
      
      // Slow rotation
      obj.rotation.y = (currentTime * (0.1 + index * 0.05)) % (Math.PI * 2);
    });
  }
  
  if (controls) {
    controls.update();
  }
  
  renderer.render(threeScene, camera);
}

// Create presentation hall elements - larger
function createPresentationHall() {
  // Modern wall material
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a55, // Slightly brighter blue-gray
    roughness: 0.2,
    metalness: 0.5
  });
  
  // Stage/podium material
  const stageMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a66, // Slightly lighter than walls
    roughness: 0.3,
    metalness: 0.6
  });
  
  // Accent material
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x00aaff, // Brighter blue accent
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x0055dd,
    emissiveIntensity: 0.5
  });
  
  // Back wall (with screen) - larger
  const backWallGeometry = new THREE.BoxGeometry(100, 40, 1);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.set(0, 20, -50);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  threeScene.add(backWall);
  
  // Side walls - larger
  const leftWallGeometry = new THREE.BoxGeometry(1, 40, 100);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.set(-50, 20, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  threeScene.add(leftWall);
  
  const rightWall = leftWall.clone();
  rightWall.position.x = 50;
  threeScene.add(rightWall);
  
  // Stage platform - larger
  const stageGeometry = new THREE.BoxGeometry(60, 2, 30);
  const stage = new THREE.Mesh(stageGeometry, stageMaterial);
  stage.position.set(0, 1, -30);
  stage.castShadow = true;
  stage.receiveShadow = true;
  threeScene.add(stage);
  
  // Stage steps - wider
  const stepGeometry = new THREE.BoxGeometry(20, 0.5, 3);
  const step1 = new THREE.Mesh(stepGeometry, stageMaterial);
  step1.position.set(0, 0.25, -14);
  step1.castShadow = true;
  step1.receiveShadow = true;
  threeScene.add(step1);
  
  const step2 = new THREE.Mesh(stepGeometry, stageMaterial);
  step2.position.set(0, 0.75, -17);
  step2.castShadow = true;
  step2.receiveShadow = true;
  threeScene.add(step2);
  
  // Presentation screen - larger
  const screenGeometry = new THREE.PlaneGeometry(48, 27); // 16:9 aspect ratio, doubled size
  const screenMaterial = new THREE.MeshLambertMaterial({
    color: 0x202040, // Darker blue-gray to reduce contrast issues
    emissive: 0x000000, // No emissive component
    reflectivity: 0, // No reflection
    transparent: false,
    depthWrite: true,
    flatShading: true
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 22, -49.0); // Move forward slightly from the wall
  threeScene.add(screen);
  
  // Screen border/frame - larger
  const frameBorderSize = 0.8;
  const frameGeometry = new THREE.BoxGeometry(48 + frameBorderSize * 2, 27 + frameBorderSize * 2, 0.2);
  const frame = new THREE.Mesh(frameGeometry, accentMaterial);
  frame.position.set(0, 22, -49.5);
  threeScene.add(frame);
  
  // Add dynamic lighting strips around the screen
  addLightingStrips(48 + frameBorderSize * 2, 27 + frameBorderSize * 2, 0, 22, -49.3);
  
  // Ceiling - higher
  const ceilingGeometry = new THREE.PlaneGeometry(100, 100);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a44,
    roughness: 0.9,
    metalness: 0.2,
    side: THREE.DoubleSide
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 40;
  ceiling.receiveShadow = true;
  threeScene.add(ceiling);
  
  // Add podium - larger
  const podiumBaseGeometry = new THREE.BoxGeometry(5, 2, 3);
  const podium = new THREE.Mesh(podiumBaseGeometry, accentMaterial);
  podium.position.set(15, 2, -28);
  podium.castShadow = true;
  podium.receiveShadow = true;
  threeScene.add(podium);
  
  // Add slanted top to podium
  const podiumTopGeometry = new THREE.BoxGeometry(5, 0.2, 3);
  const podiumTop = new THREE.Mesh(podiumTopGeometry, accentMaterial);
  podiumTop.position.set(15, 3.1, -27.6);
  podiumTop.rotation.x = Math.PI * 0.1;
  podiumTop.castShadow = true;
  threeScene.add(podiumTop);
  
  // Add glowing strip around the stage edge
  const edgeGeometry = new THREE.BoxGeometry(60, 0.1, 0.5);
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    emissive: 0x00aaff,
    emissiveIntensity: 1.0
  });
  
  const frontEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  frontEdge.position.set(0, 2.05, -15);
  threeScene.add(frontEdge);
  
  const backEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  backEdge.position.set(0, 2.05, -45);
  threeScene.add(backEdge);
  
  const leftEdgeGeometry = new THREE.BoxGeometry(0.5, 0.1, 30);
  const leftEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
  leftEdge.position.set(-30, 2.05, -30);
  threeScene.add(leftEdge);
  
  const rightEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
  rightEdge.position.set(30, 2.05, -30);
  threeScene.add(rightEdge);
}

// Create dynamic lighting strips around objects
function addLightingStrips(width, height, x, y, z) {
  const colors = [0x00aaff, 0xff3366, 0xffaa00, 0x00ff99, 0xff00ff];
  
  // Create strips for the four sides
  const stripThickness = 0.15;
  const emissiveIntensity = 1.0;
  
  // Top strip
  const topGeometry = new THREE.BoxGeometry(width, stripThickness, stripThickness);
  const topMaterial = new THREE.MeshBasicMaterial({
    color: colors[0],
    emissive: colors[0],
    emissiveIntensity: emissiveIntensity
  });
  const topStrip = new THREE.Mesh(topGeometry, topMaterial);
  topStrip.position.set(x, y + height/2 + stripThickness, z);
  threeScene.add(topStrip);
  
  // Bottom strip
  const bottomGeometry = new THREE.BoxGeometry(width, stripThickness, stripThickness);
  const bottomMaterial = new THREE.MeshBasicMaterial({
    color: colors[1],
    emissive: colors[1],
    emissiveIntensity: emissiveIntensity
  });
  const bottomStrip = new THREE.Mesh(bottomGeometry, bottomMaterial);
  bottomStrip.position.set(x, y - height/2 - stripThickness, z);
  threeScene.add(bottomStrip);
  
  // Left strip
  const leftGeometry = new THREE.BoxGeometry(stripThickness, height, stripThickness);
  const leftMaterial = new THREE.MeshBasicMaterial({
    color: colors[2],
    emissive: colors[2],
    emissiveIntensity: emissiveIntensity
  });
  const leftStrip = new THREE.Mesh(leftGeometry, leftMaterial);
  leftStrip.position.set(x - width/2 - stripThickness, y, z);
  threeScene.add(leftStrip);
  
  // Right strip
  const rightGeometry = new THREE.BoxGeometry(stripThickness, height, stripThickness);
  const rightMaterial = new THREE.MeshBasicMaterial({
    color: colors[3],
    emissive: colors[3],
    emissiveIntensity: emissiveIntensity
  });
  const rightStrip = new THREE.Mesh(rightGeometry, rightMaterial);
  rightStrip.position.set(x + width/2 + stripThickness, y, z);
  threeScene.add(rightStrip);
  
  // Store strips for animation
  threeScene.lightingStrips = threeScene.lightingStrips || [];
  threeScene.lightingStrips.push(topStrip, bottomStrip, leftStrip, rightStrip);
}

// Add presentation hall decorations
function addPresentationDecorations() {
  // Create audience seating - more rows and columns
  createAudienceSeating();
  
  // Create visual effects - enhanced
  createVisualEffects();
  
  // Create tech elements - enhanced
  createTechElements();
  
  // Add floating decorative objects
  createFloatingObjects();
}

// Create audience seating - more rows and columns
function createAudienceSeating() {
  const seatMaterial = new THREE.MeshStandardMaterial({
    color: 0x263245, // Dark blue-gray
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Create rows of seats
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 12; col++) {
      // Skip some chairs to create walking paths
      if ((row === 3 && (col === 4 || col === 5 || col === 6 || col === 7)) || 
          (row === 6 && (col === 4 || col === 5 || col === 6 || col === 7))) continue;
      
      const seatGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.8);
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(
        -22 + col * 4, 
        0.25 + row * 0.3,  // Each row slightly higher 
        0 + row * 5
      );
      seat.castShadow = true;
      seat.receiveShadow = true;
      threeScene.add(seat);
      
      // Chair back
      const backGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.2);
      const back = new THREE.Mesh(backGeometry, seatMaterial);
      back.position.set(
        -22 + col * 4,
        0.85 + row * 0.3,
        0.8 + row * 5
      );
      back.castShadow = true;
      back.receiveShadow = true;
      threeScene.add(back);
    }
  }
}

// Create visual effects - enhanced
function createVisualEffects() {
  // Particle system for floating light particles - more particles, brighter
  const particleCount = 2000;
  const particlesGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 90; // x
    particlePositions[i3+1] = Math.random() * 35; // y
    particlePositions[i3+2] = (Math.random() - 0.5) * 90; // z
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x55aaff,
    size: 0.15,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  
  const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
  threeScene.add(particleSystem);
  threeScene.particleSystem = particleSystem; // Store for animation
  
  // Add light beams from ceiling to stage - more and brighter
  for (let i = 0; i < 10; i++) {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 1.0, 40, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: i % 5 === 0 ? 0x00ffff : 
             i % 5 === 1 ? 0xff3366 : 
             i % 5 === 2 ? 0xffaa00 : 
             i % 5 === 3 ? 0x00ff99 : 0xff00ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(
      -40 + i * 8,
      20,
      -30
    );
    threeScene.add(beam);
  }
  
  // Add volumetric fog light - dramatic effect on stage
  const fogLightGeometry = new THREE.ConeGeometry(20, 40, 32);
  const fogLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  
  const fogLight = new THREE.Mesh(fogLightGeometry, fogLightMaterial);
  fogLight.position.set(0, 40, -30);
  fogLight.rotation.x = Math.PI;
  threeScene.add(fogLight);
}

// Create laser effects
function createLaserEffects() {
  threeScene.laserBeams = [];
  
  const laserColors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00];
  
  for (let i = 0; i < 10; i++) {
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 100, 8);
    const laserMaterial = new THREE.MeshBasicMaterial({
      color: laserColors[i % 5],
      emissive: laserColors[i % 5],
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.7
    });
    
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.set(
      -35 + i * 7,
      30,
      -40
    );
    laser.rotation.x = Math.PI / 2;
    
    threeScene.add(laser);
    threeScene.laserBeams.push(laser);
  }
}

// Create floating decorative objects
function createFloatingObjects() {
  threeScene.floatingObjects = [];
  
  // Create different types of floating objects
  const objectTypes = [
    { geometry: new THREE.TorusGeometry(1, 0.3, 16, 32), color: 0x00aaff },
    { geometry: new THREE.IcosahedronGeometry(1, 1), color: 0xff3366 },
    { geometry: new THREE.OctahedronGeometry(1, 0), color: 0xffaa00 },
    { geometry: new THREE.TorusKnotGeometry(1, 0.3, 64, 8), color: 0x00ff99 }
  ];
  
  // Position objects around the hall
  for (let i = 0; i < 12; i++) {
    const typeIndex = i % objectTypes.length;
    const objType = objectTypes[typeIndex];
    
    const material = new THREE.MeshStandardMaterial({
      color: objType.color,
      emissive: objType.color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const obj = new THREE.Mesh(objType.geometry, material);
    
    // Distribute objects throughout the space
    const posX = -40 + Math.random() * 80;
    const posY = 10 + Math.random() * 25;
    const posZ = -45 + Math.random() * 80;
    
    obj.position.set(posX, posY, posZ);
    obj.userData.baseY = posY; // Store for animation
    
    threeScene.add(obj);
    threeScene.floatingObjects.push(obj);
  }
}

// Create tech elements - enhanced
function createTechElements() {
  // Holographic display near the stage - larger
  const holoStandGeometry = new THREE.CylinderGeometry(0.6, 1.0, 3, 16);
  const holoStandMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.2,
    metalness: 0.9
  });
  
  const holoStand = new THREE.Mesh(holoStandGeometry, holoStandMaterial);
  holoStand.position.set(-15, 1.5, -28);
  holoStand.castShadow = true;
  holoStand.receiveShadow = true;
  threeScene.add(holoStand);
  
  // Holographic projection - larger and more complex
  const holoGeometry = new THREE.SphereGeometry(2, 32, 24);
  const holoMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
    wireframe: true
  });
  
  const hologram = new THREE.Mesh(holoGeometry, holoMaterial);
  hologram.position.set(-15, 6, -28);
  threeScene.add(hologram);
  
  // Add inner hologram for more complexity
  const innerHoloGeometry = new THREE.IcosahedronGeometry(1.2, 1);
  const innerHoloMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.7,
    wireframe: true
  });
  
  const innerHologram = new THREE.Mesh(innerHoloGeometry, innerHoloMaterial);
  innerHologram.position.set(-15, 6, -28);
  threeScene.add(innerHologram);
  
  // Animation for holograms
  threeScene.hologram = hologram;
  threeScene.innerHologram = innerHologram;
  
  // Add track lighting along the ceiling - more tracks, brighter
  const trackLightGeometry = new THREE.BoxGeometry(90, 0.3, 0.3);
  const trackLightMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.2,
    metalness: 0.9
  });
  
  for (let i = 0; i < 5; i++) {
    const trackLight = new THREE.Mesh(trackLightGeometry, trackLightMaterial);
    trackLight.position.set(0, 39.7, -40 + i * 20);
    threeScene.add(trackLight);
    
    // Add small lights along the track - more lights, brighter
    for (let j = 0; j < 18; j++) {
      const smallLightGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const smallLightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
        emissiveIntensity: 1.0
      });
      
      const smallLight = new THREE.Mesh(smallLightGeometry, smallLightMaterial);
      smallLight.position.set(-45 + j * 5, 39.4, -40 + i * 20);
      threeScene.add(smallLight);
      
      // Add light cones from ceiling spots
      if (j % 3 === 0) {
        const lightConeGeometry = new THREE.CylinderGeometry(0.1, 2, 8, 16, 1, true);
        const lightConeMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffee,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide
        });
        
        const lightCone = new THREE.Mesh(lightConeGeometry, lightConeMaterial);
        lightCone.position.set(-45 + j * 5, 35, -40 + i * 20);
        threeScene.add(lightCone);
      }
    }
  }
}

// Add user to scene
export function addUserToScene(user) {
  // Create a group for the entire avatar
  const avatarGroup = new THREE.Group();
  avatarGroup.position.set(user.position.x, 0, user.position.z);
  
  // Rotate the avatar 180 degrees so it faces forward by default
  avatarGroup.rotation.y = (user.rotation.y || 0) + Math.PI;
  
  // Different color based on the avatar type
  let primaryColor, secondaryColor;
  
  switch (user.avatar) {
    case 'robot':
      primaryColor = 0x4caf50; // Green
      secondaryColor = 0x2e7d32; // Dark green
      break;
    case 'alien':
      primaryColor = 0xe91e63; // Pink
      secondaryColor = 0xad1457; // Dark pink
      break;
    case 'cyborg':
      primaryColor = 0x2196f3; // Blue
      secondaryColor = 0x0d47a1; // Dark blue
      break;
    case 'ghost':
      primaryColor = 0xb3e5fc; // Light blue
      secondaryColor = 0x90caf9; // Slightly darker blue
      break;
    default:
      primaryColor = 0x9c27b0; // Purple
      secondaryColor = 0x6a1b9a; // Dark purple
  }
  
  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness: 0.8,
    metalness: 0.2
  });
  
  const secondaryMaterial = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Body parts with Habbo-style
  
  // Torso (slightly wider at the top, tapered at bottom)
  const torsoGeometry = new THREE.BoxGeometry(0.8, 0.9, 0.5);
  const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
  torso.position.y = 0.9;
  torso.castShadow = true;
  avatarGroup.add(torso);
  
  // Head (larger and more cubic - Habbo style)
  const headGeometry = new THREE.BoxGeometry(0.9, 0.8, 0.75);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.y = 1.8;
  head.castShadow = true;
  avatarGroup.add(head);
  
  // Hair or hat depends on avatar type
  if (user.avatar === 'robot') {
    // Robot antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
    const antenna = new THREE.Mesh(antennaGeometry, secondaryMaterial);
    antenna.position.set(0, 2.25, 0);
    avatarGroup.add(antenna);
    
    const antennaBallGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const antennaBall = new THREE.Mesh(antennaBallGeometry, new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    }));
    antennaBall.position.set(0, 2.4, 0);
    avatarGroup.add(antennaBall);
  } else if (user.avatar === 'alien') {
    // Alien ears
    const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(-0.3, 2.05, 0);
    leftEar.rotation.z = Math.PI / 4;
    avatarGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.position.set(0.3, 2.05, 0);
    rightEar.rotation.z = -Math.PI / 4;
    avatarGroup.add(rightEar);
  } else if (user.avatar === 'cyborg') {
    // Cyborg visor/eye
    const visorGeometry = new THREE.BoxGeometry(0.9, 0.15, 0.1);
    const visor = new THREE.Mesh(visorGeometry, new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    }));
    visor.position.set(0, 1.85, 0.425);
    avatarGroup.add(visor);
  } else if (user.avatar === 'ghost') {
    // Ghost is semi-transparent
    bodyMaterial.transparent = true;
    bodyMaterial.opacity = 0.7;
    
    // Wavy bottom
    const wavyBottomGeometry = new THREE.CylinderGeometry(0.4, 0, 0.4, 8);
    const wavyBottom = new THREE.Mesh(wavyBottomGeometry, bodyMaterial);
    wavyBottom.position.set(0, 0.35, 0);
    avatarGroup.add(wavyBottom);
  }
  
  // Arms
  const armGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.25);
  
  const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
  leftArm.position.set(-0.525, 1.05, 0);
  leftArm.castShadow = true;
  avatarGroup.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
  rightArm.position.set(0.525, 1.05, 0);
  rightArm.castShadow = true;
  avatarGroup.add(rightArm);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.35, 0.7, 0.35);
  
  const leftLeg = new THREE.Mesh(legGeometry, secondaryMaterial);
  leftLeg.position.set(-0.2, 0.35, 0);
  leftLeg.castShadow = true;
  avatarGroup.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, secondaryMaterial);
  rightLeg.position.set(0.2, 0.35, 0);
  rightLeg.castShadow = true;
  avatarGroup.add(rightLeg);
  
  // Face details based on avatar type
  const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  // Left eye
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 1.85, 0.38);
  avatarGroup.add(leftEye);
  
  // Right eye
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.2, 1.85, 0.38);
  avatarGroup.add(rightEye);
  
  // Pupils
  const pupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  // Left pupil
  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.set(-0.2, 1.85, 0.46);
  avatarGroup.add(leftPupil);
  
  // Right pupil
  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  rightPupil.position.set(0.2, 1.85, 0.46);
  avatarGroup.add(rightPupil);
  
  // Mouth (different for each avatar type)
  if (user.avatar === 'robot') {
    // Robot grid mouth
    const mouthGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
    const mouth = new THREE.Mesh(mouthGeometry, secondaryMaterial);
    mouth.position.set(0, 1.65, 0.4);
    avatarGroup.add(mouth);
    
    // Grid lines
    for (let i = -1; i <= 1; i += 2) {
      const lineGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.06);
      const line = new THREE.Mesh(lineGeometry, new THREE.MeshStandardMaterial({ color: 0x333333 }));
      line.position.set(i * 0.1, 1.65, 0.4);
      avatarGroup.add(line);
    }
  } else if (user.avatar === 'ghost') {
    // Ghost "oooooo" mouth
    const mouthGeometry = new THREE.TorusGeometry(0.1, 0.03, 8, 16);
    const mouth = new THREE.Mesh(mouthGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
    mouth.position.set(0, 1.65, 0.4);
    mouth.rotation.x = Math.PI / 2;
    avatarGroup.add(mouth);
  } else {
    // Normal smile for others
    const mouthGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(mouthGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
    mouth.position.set(0, 1.65, 0.4);
    mouth.rotation.x = Math.PI / 2;
    avatarGroup.add(mouth);
  }
  
  // Add username label
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.font = 'bold 32px Arial';
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.lineWidth = 4;
  context.textAlign = 'center';
  context.strokeText(user.username, 128, 40);
  context.fillText(user.username, 128, 40);
  
  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.SpriteMaterial({
    map: labelTexture,
    transparent: true
  });
  
  const label = new THREE.Sprite(labelMaterial);
  label.scale.set(3, 0.75, 1);
  label.position.y = 2.5;
  avatarGroup.add(label);
  
  // Store user ID in the avatar for interaction
  avatarGroup.userData.userId = user.id;
  
  // Add to scene and store in userAvatars object
  threeScene.add(avatarGroup);
  userAvatars[user.id] = avatarGroup;
}

// Move user
export function moveUser(userId, position) {
  if (userAvatars[userId]) {
    // Use lerp for smooth movement
    const avatar = userAvatars[userId];
    const targetPosition = new THREE.Vector3(position.x, 0, position.z);
    avatar.position.lerp(targetPosition, 0.1);
  }
}

// Rotate user
export function rotateUser(userId, rotation) {
  if (userAvatars[userId]) {
    // Use lerp for smooth rotation
    const avatar = userAvatars[userId];
    const currentRotation = avatar.rotation.y;
    // Add PI to make the avatar face the correct direction
    const targetRotation = rotation.y + Math.PI;
    
    // Calculate the shortest rotation path
    let delta = targetRotation - currentRotation;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    
    avatar.rotation.y = currentRotation + delta * 0.1;
  }
}

// Remove user
export function removeUser(userId) {
  if (userAvatars[userId]) {
    threeScene.remove(userAvatars[userId]);
    delete userAvatars[userId];
  }
} 