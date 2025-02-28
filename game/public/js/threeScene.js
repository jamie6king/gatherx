// Three.js scene module
let threeScene, camera, renderer, controls;
const userAvatars = {};
let socket;  // Will be set via initThreeScene
let collidableObjects = []; // Array to store objects that can be collided with

// Initialize Three.js scene
export function initThreeScene(sharedSocket) {
  socket = sharedSocket;  // Use the shared socket instance
  collidableObjects = []; // Reset collidable objects array
  
  // Create scene
  threeScene = new THREE.Scene();
  // Enhanced background for the presentation hall - brighter and more vibrant
  threeScene.background = new THREE.Color(0x202060);
  // Reduced fog for better visibility in the larger space
  threeScene.fog = new THREE.FogExp2(0x202060, 0.001);

  // Create camera with wider field of view for the bigger hall
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.position.set(0, 3.0, 20); // Higher position to see more of the larger hall

  // Create enhanced renderer with better visuals
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
  renderer.outputEncoding = THREE.sRGBEncoding; // Better color rendering
  renderer.toneMappingExposure = 1.5; // Significantly brighter overall scene
  document.getElementById('3d-container').appendChild(renderer.domElement);

  // Enhanced lighting for the presentation hall

  // Ambient light - brighter warm glow
  const ambientLight = new THREE.AmbientLight(0x6060a0, 0.8);
  threeScene.add(ambientLight);

  // Main directional light - simulates daylight from skylights 
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 15, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 150;
  directionalLight.shadow.camera.left = -60;
  directionalLight.shadow.camera.right = 60;
  directionalLight.shadow.camera.top = 60;
  directionalLight.shadow.camera.bottom = -60;
  threeScene.add(directionalLight);

  // Add spotlight for stage area - brighter
  const spotLight = new THREE.SpotLight(0xffffff, 2.5);
  spotLight.position.set(0, 35, -20);
  spotLight.angle = Math.PI / 4.5;
  spotLight.penumbra = 0.3;
  spotLight.decay = 1.2;
  spotLight.distance = 120;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  threeScene.add(spotLight);
  
  // Add more spotlights that move/rotate for dynamic effect - increased count
  for (let i = 0; i < 8; i++) {
    const movingSpotlight = new THREE.SpotLight(
      i % 8 === 0 ? 0x0088ff : 
      i % 8 === 1 ? 0xff3366 : 
      i % 8 === 2 ? 0xffaa00 : 
      i % 8 === 3 ? 0x00ff99 : 
      i % 8 === 4 ? 0xff00ff :
      i % 8 === 5 ? 0x66aaff :
      i % 8 === 6 ? 0xffcc00 :
      0x00ffcc, 
      2.2
    );
    movingSpotlight.position.set(
      -50 + i * 15,
      25, 
      i % 2 === 0 ? -30 : -25
    );
    movingSpotlight.angle = Math.PI / 8;
    movingSpotlight.penumbra = 0.4;
    movingSpotlight.decay = 1.5;
    movingSpotlight.distance = 80;
    threeScene.add(movingSpotlight);
    
    // Store spotlight in a property for animation
    threeScene[`movingSpotlight${i}`] = movingSpotlight;
  }

  // Add floor for the presentation hall - much larger
  const floorSize = 160;
  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333366, // Brighter blue-gray for elegant flooring
    roughness: 0.1,
    metalness: 0.8,
    envMapIntensity: 0.9
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  threeScene.add(floor);
  // Add main floor to collidable objects for proper gravity
  collidableObjects.push(floor);
  
  // Add enhanced reflective floor overlay with more glow
  const reflectiveFloorGeometry = new THREE.PlaneGeometry(floorSize * 0.7, floorSize * 0.7);
  const reflectiveFloorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4444aa,
    roughness: 0.02,
    metalness: 0.95,
    envMapIntensity: 1.2,
    emissive: 0x222266,
    emissiveIntensity: 0.2
  });
  const reflectiveFloor = new THREE.Mesh(reflectiveFloorGeometry, reflectiveFloorMaterial);
  reflectiveFloor.rotation.x = -Math.PI / 2;
  reflectiveFloor.position.y = 0.01; // Slightly above the main floor
  reflectiveFloor.receiveShadow = true;
  threeScene.add(reflectiveFloor);

  // Create invisible collision boundaries at the edges of the hall
  createBoundaryWalls(floorSize);

  // Create walls and stage - larger
  createPresentationHall();

  // Add presentation hall decorations
  addPresentationDecorations();

  // Add more enhanced laser effects
  createLaserEffects();
  
  // Add volumetric light beams
  createVolumetricBeams();
  
  // Add holographic displays
  createHolographicDisplays();

  // Set up controls (first-person view with gravity and jumping)
  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 0.35; // Faster movement for larger space

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

// Create invisible boundary walls for collision detection
function createBoundaryWalls(floorSize) {
  const wallMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.0, // Invisible
    side: THREE.DoubleSide 
  });
  
  // North wall (back)
  const northWallGeometry = new THREE.BoxGeometry(floorSize, 60, 1);
  const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
  northWall.position.set(0, 30, -floorSize/2);
  threeScene.add(northWall);
  collidableObjects.push(northWall);
  
  // South wall (front)
  const southWall = northWall.clone();
  southWall.position.z = floorSize/2;
  threeScene.add(southWall);
  collidableObjects.push(southWall);
  
  // East wall (right)
  const eastWallGeometry = new THREE.BoxGeometry(1, 60, floorSize);
  const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
  eastWall.position.set(floorSize/2, 30, 0);
  threeScene.add(eastWall);
  collidableObjects.push(eastWall);
  
  // West wall (left)
  const westWall = eastWall.clone();
  westWall.position.x = -floorSize/2;
  threeScene.add(westWall);
  collidableObjects.push(westWall);
}

// First-person controls with jumping and collision detection
class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = true;
    
    this.movementSpeed = 0.15;
    this.lookSpeed = 0.002;
    this.collisionRadius = 0.8; // Radius for collision detection
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.jump = false;
    
    // Physics parameters
    this.gravity = 0.015; // Increased gravity strength
    this.jumpStrength = 0.2;
    this.isOnGround = true;
    this.floorHeight = 0; // Default floor level
    this.playerHeight = 2; // Height of the camera from the ground
    this.groundCheckDistance = 3; // Distance to check for ground below player
    
    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0; // For jumping/falling
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
        // Jump functionality
        if (this.isOnGround) {
          this.verticalVelocity = this.jumpStrength;
          this.isOnGround = false;
        }
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
  
  checkCollision(position) {
    // Create a ray from the player position to detect the floor
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(position.x, position.y, position.z),
      new THREE.Vector3(0, -1, 0)
    );
    
    // Check for floor collision - to detect stage or ground beneath
    const floorIntersections = raycaster.intersectObjects(collidableObjects);
    
    // Default to not on ground unless we find ground below
    let wasOnGround = this.isOnGround;
    this.isOnGround = false;
    
    // If we have a floor intersection and it's close enough, we're on the ground
    if (floorIntersections.length > 0) {
      const dist = floorIntersections[0].distance;
      
      // If we're close enough to the floor, snap to it
      if (dist <= this.groundCheckDistance) {
        this.isOnGround = true;
        this.floorHeight = floorIntersections[0].point.y;
        return true;
      }
    }

    // Check for wall collisions - horizontal rays in a circle
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
      
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(position.x, position.y, position.z),
        direction
      );
      
      const intersections = raycaster.intersectObjects(collidableObjects);
      
      // If we have a wall intersection within our collision radius, there's a collision
      if (intersections.length > 0 && intersections[0].distance < this.collisionRadius) {
        return false;
      }
    }
    
    // If we were on ground but now aren't, start falling
    if (wasOnGround && !this.isOnGround) {
      this.verticalVelocity = 0; // Start with zero velocity when walking off edges
    }
    
    return true;
  }
  
  update() {
    if (!this.enabled) return;
    
    // Always apply gravity when not on ground
    if (!this.isOnGround) {
      this.verticalVelocity -= this.gravity;
    } else {
      // Reset vertical velocity when on ground
      this.verticalVelocity = 0;
    }
    
    // Reset horizontal velocity
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
    
    // Calculate the proposed new position
    const proposedPosition = new THREE.Vector3().copy(this.camera.position);
    proposedPosition.add(this.velocity);
    
    // Only update horizontal position if there's no collision
    if (this.checkCollision(proposedPosition)) {
      this.camera.position.x = proposedPosition.x;
      this.camera.position.z = proposedPosition.z;
    }
    
    // Always update vertical position (jumping/falling)
    this.camera.position.y += this.verticalVelocity;
    
    // Check if we're on ground after position update
    const afterMoveRaycaster = new THREE.Raycaster(
      this.camera.position,
      new THREE.Vector3(0, -1, 0)
    );
    const groundCheck = afterMoveRaycaster.intersectObjects(collidableObjects);
    
    // Update ground status after movement
    if (groundCheck.length > 0) {
      const groundDist = groundCheck[0].distance;
      if (groundDist <= this.playerHeight + 0.1) {
        this.isOnGround = true;
        this.floorHeight = groundCheck[0].point.y;
        
        // Ensure player doesn't fall through the floor
        if (this.camera.position.y < this.floorHeight + this.playerHeight) {
          this.camera.position.y = this.floorHeight + this.playerHeight;
        }
      } else {
        this.isOnGround = false;
      }
    } else {
      this.isOnGround = false;
    }
    
    // Apply maximum fall speed to prevent excessive acceleration
    const maxFallSpeed = -0.5;
    if (this.verticalVelocity < maxFallSpeed) {
      this.verticalVelocity = maxFallSpeed;
    }
    
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
  
  // Animate all spotlights with varying patterns
  for (let i = 0; i < 8; i++) {
    if (threeScene[`movingSpotlight${i}`]) {
      const spotlight = threeScene[`movingSpotlight${i}`];
      
      // Different patterns for each spotlight
      if (i % 3 === 0) {
        spotlight.position.x = -50 + (i * 15) + Math.sin(currentTime * (0.2 + i * 0.05)) * 15;
        spotlight.position.z = (i % 2 === 0 ? -30 : -25) + Math.cos(currentTime * (0.3 + i * 0.05)) * 12;
      } else if (i % 3 === 1) {
        spotlight.position.x = -50 + (i * 15) + Math.cos(currentTime * (0.25 + i * 0.05)) * 15;
        spotlight.position.z = (i % 2 === 0 ? -30 : -25) + Math.sin(currentTime * (0.35 + i * 0.05)) * 12;
      } else {
        spotlight.position.x = -50 + (i * 15) + Math.sin(currentTime * (0.15 + i * 0.05) + Math.PI) * 15;
        spotlight.position.z = (i % 2 === 0 ? -30 : -25) + Math.cos(currentTime * (0.25 + i * 0.05) + Math.PI) * 12;
      }
      
      // Vary the intensity to create pulsing effect
      spotlight.intensity = 2.2 + Math.sin(currentTime * (1 + i * 0.2)) * 0.8;
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
  
  // Animate lasers with more dramatic effects
  if (threeScene.laserBeams) {
    threeScene.laserBeams.forEach((laser, index) => {
      // Rotate each laser in a different pattern
      laser.rotation.y = (currentTime * (0.3 + index * 0.15)) % (Math.PI * 2);
      
      // Also adjust rotation.z for more dynamic movement
      laser.rotation.z = Math.sin(currentTime * (0.2 + index * 0.1)) * 0.2;
      
      // Vary the thickness/intensity
      const scaleVal = 0.8 + Math.sin(currentTime * (2 + index * 0.5)) * 0.4;
      laser.scale.x = scaleVal;
      laser.scale.z = scaleVal;
    });
  }
  
  // Animate volumetric beams
  if (threeScene.volumetricBeams) {
    threeScene.volumetricBeams.forEach((beam, index) => {
      // Rotate the beams
      beam.rotation.y = (currentTime * (0.1 + index * 0.05)) % (Math.PI * 2);
      
      // Pulse the opacity
      const material = beam.material;
      material.opacity = 0.1 + Math.sin(currentTime * (0.5 + index * 0.2)) * 0.05;
    });
  }
  
  // Animate holographic displays
  if (threeScene.holographicDisplays) {
    threeScene.holographicDisplays.forEach((display, index) => {
      // Rotate slowly
      display.rotation.y = (currentTime * (0.1 + index * 0.05)) % (Math.PI * 2);
      
      // Pulse the emission
      const material = display.material;
      material.emissiveIntensity = 0.8 + Math.sin(currentTime * (0.7 + index * 0.3)) * 0.2;
    });
  }
  
  // Animate floating objects
  if (threeScene.floatingObjects) {
    threeScene.floatingObjects.forEach((obj, index) => {
      // Enhanced bobbing motion
      obj.position.y = obj.userData.baseY + Math.sin(currentTime * (0.5 + index * 0.1)) * 0.8;
      
      // Slow rotation on multiple axes
      obj.rotation.y = (currentTime * (0.1 + index * 0.05)) % (Math.PI * 2);
      obj.rotation.x = Math.sin(currentTime * (0.05 + index * 0.03)) * 0.2;
    });
  }
  
  if (controls) {
    controls.update();
  }
  
  renderer.render(threeScene, camera);
}

// Create presentation hall elements - larger
function createPresentationHall() {
  // Modern wall material with higher reflectivity
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a66, // Brighter blue-gray
    roughness: 0.1,
    metalness: 0.6,
    envMapIntensity: 0.8
  });
  
  // Stage/podium material
  const stageMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a77, // Lighter than walls
    roughness: 0.2,
    metalness: 0.7,
    envMapIntensity: 0.9
  });
  
  // Accent material with more glow
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x00aaff, // Brighter blue accent
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x0066ff,
    emissiveIntensity: 0.7
  });
  
  // Back wall (with screen) - much larger
  const backWallGeometry = new THREE.BoxGeometry(160, 60, 1);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.set(0, 30, -80);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  threeScene.add(backWall);
  collidableObjects.push(backWall);
  
  // Side walls - much larger
  const leftWallGeometry = new THREE.BoxGeometry(1, 60, 160);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.set(-80, 30, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  threeScene.add(leftWall);
  collidableObjects.push(leftWall);
  
  const rightWall = leftWall.clone();
  rightWall.position.x = 80;
  threeScene.add(rightWall);
  collidableObjects.push(rightWall);
  
  // Stage platform - much larger
  const stageGeometry = new THREE.BoxGeometry(100, 2, 50);
  const stage = new THREE.Mesh(stageGeometry, stageMaterial);
  stage.position.set(0, 1, -45);
  stage.castShadow = true;
  stage.receiveShadow = true;
  threeScene.add(stage);
  collidableObjects.push(stage);
  
  // Stage steps - wider
  const stepGeometry = new THREE.BoxGeometry(30, 0.5, 3);
  const step1 = new THREE.Mesh(stepGeometry, stageMaterial);
  step1.position.set(0, 0.25, -19);
  step1.castShadow = true;
  step1.receiveShadow = true;
  threeScene.add(step1);
  collidableObjects.push(step1);
  
  const step2 = new THREE.Mesh(stepGeometry, stageMaterial);
  step2.position.set(0, 0.75, -22);
  step2.castShadow = true;
  step2.receiveShadow = true;
  threeScene.add(step2);
  collidableObjects.push(step2);
  
  // Presentation screen - much larger
  const screenGeometry = new THREE.PlaneGeometry(80, 45); // 16:9 aspect ratio, much larger
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x202040, // Darker blue-gray base
    emissive: 0x101030, // Slight emissive glow
    roughness: 0.1,
    metalness: 0.9,
    envMapIntensity: 1.0
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 30, -79.0); // Move forward slightly from the wall
  threeScene.add(screen);
  
  // Screen border/frame - larger with more glow
  const frameBorderSize = 1.2;
  const frameGeometry = new THREE.BoxGeometry(80 + frameBorderSize * 2, 45 + frameBorderSize * 2, 0.3);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x0066ff,
    emissiveIntensity: 0.8
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, 30, -79.5);
  threeScene.add(frame);
  
  // Add dynamic lighting strips around the screen
  addLightingStrips(80 + frameBorderSize * 2, 45 + frameBorderSize * 2, 0, 30, -79.3);
  
  // Add multi-colored accent lighting strips on walls
  addLightingStrips(120, 0.5, 0, 15, -79.8); // Lower horizontal strip on back wall
  addLightingStrips(120, 0.5, 0, 45, -79.8); // Upper horizontal strip on back wall
  
  // Vertical accent lights on side walls
  addLightingStrips(0.5, 40, -79.8, 30, -40); // Left wall
  addLightingStrips(0.5, 40, 79.8, 30, -40); // Right wall
  
  // Ceiling - higher with accent lighting
  const ceilingGeometry = new THREE.PlaneGeometry(160, 160);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a55,
    roughness: 0.9,
    metalness: 0.3,
    side: THREE.DoubleSide
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 60;
  ceiling.receiveShadow = true;
  threeScene.add(ceiling);
  
  // Add podium - larger and add to collidable objects
  const podiumBaseGeometry = new THREE.BoxGeometry(7, 2.5, 4);
  const podium = new THREE.Mesh(podiumBaseGeometry, accentMaterial);
  podium.position.set(25, 2.25, -35);
  podium.castShadow = true;
  podium.receiveShadow = true;
  threeScene.add(podium);
  collidableObjects.push(podium);
  
  // Add slanted top to podium
  const podiumTopGeometry = new THREE.BoxGeometry(7, 0.3, 4);
  const podiumTop = new THREE.Mesh(podiumTopGeometry, accentMaterial);
  podiumTop.position.set(25, 3.5, -34.5);
  podiumTop.rotation.x = Math.PI * 0.1;
  podiumTop.castShadow = true;
  threeScene.add(podiumTop);
  collidableObjects.push(podiumTop);
  
  // Add glowing strip around the stage edge
  const edgeGeometry = new THREE.BoxGeometry(100, 0.15, 0.6);
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    emissive: 0x00aaff,
    emissiveIntensity: 1.2
  });
  
  const frontEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  frontEdge.position.set(0, 2.05, -20);
  threeScene.add(frontEdge);
  
  const backEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  backEdge.position.set(0, 2.05, -70);
  threeScene.add(backEdge);
  
  const leftEdgeGeometry = new THREE.BoxGeometry(0.6, 0.15, 50);
  const leftEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
  leftEdge.position.set(-50, 2.05, -45);
  threeScene.add(leftEdge);
  
  const rightEdge = new THREE.Mesh(leftEdgeGeometry, edgeMaterial);
  rightEdge.position.set(50, 2.05, -45);
  threeScene.add(rightEdge);
  
  // Add accent columns at the corners of the stage
  const columnRadius = 1.5;
  const columnHeight = 15;
  const columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 16);
  const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a77,
    roughness: 0.2,
    metalness: 0.8,
    envMapIntensity: 0.9
  });
  
  const columnPositions = [
    [-49, -19], // Front left
    [49, -19],  // Front right
    [-49, -70], // Back left
    [49, -70]   // Back right
  ];
  
  columnPositions.forEach(pos => {
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(pos[0], columnHeight/2 + 1, pos[1]);
    column.castShadow = true;
    column.receiveShadow = true;
    threeScene.add(column);
    collidableObjects.push(column);
    
    // Add glowing ring at top and bottom of each column
    const ringGeometry = new THREE.TorusGeometry(columnRadius + 0.2, 0.3, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1
    });
    
    // Top ring
    const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
    topRing.position.set(pos[0], columnHeight + 1, pos[1]);
    topRing.rotation.x = Math.PI/2;
    threeScene.add(topRing);
    
    // Bottom ring
    const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
    bottomRing.position.set(pos[0], 1, pos[1]);
    bottomRing.rotation.x = Math.PI/2;
    threeScene.add(bottomRing);
  });
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
  // Add audience seating
  createAudienceSeating();
  
  // Add visual effects
  createVisualEffects();
  
  // Add tech elements around the room
  createTechElements();
  
  // Add floating decorative objects
  createFloatingObjects();
}

// Create audience seating - more rows and columns for larger hall
function createAudienceSeating() {
  const seatMaterial = new THREE.MeshStandardMaterial({
    color: 0x263245, // Dark blue-gray
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Create rows of seats - more rows and columns for the larger hall
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 18; col++) {
      // Skip some chairs to create walking paths
      if ((row === 4 && (col >= 6 && col <= 11)) || 
          (row === 8 && (col >= 6 && col <= 11))) continue;
      
      const seatGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.8);
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(
        -32 + col * 4, 
        0.25 + row * 0.4,  // Each row slightly higher 
        0 + row * 5
      );
      seat.castShadow = true;
      seat.receiveShadow = true;
      threeScene.add(seat);
      collidableObjects.push(seat);
      
      // Chair back
      const backGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.2);
      const back = new THREE.Mesh(backGeometry, seatMaterial);
      back.position.set(
        -32 + col * 4,
        0.85 + row * 0.4,
        0.8 + row * 5
      );
      back.castShadow = true;
      back.receiveShadow = true;
      threeScene.add(back);
      collidableObjects.push(back);
    }
  }
}

// Create visual effects - enhanced significantly
function createVisualEffects() {
  // Particle system for floating light particles - balanced particle count
  const particleCount = 3000;
  const particlesGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 150; // x
    particlePositions[i3+1] = Math.random() * 55; // y
    particlePositions[i3+2] = (Math.random() - 0.5) * 150; // z
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.25, // Slightly larger particles to compensate for reduced count
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  
  const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
  threeScene.add(particleSystem);
  threeScene.particleSystem = particleSystem; // Store for animation
  
  // Add light beams from ceiling to stage - more and brighter
  for (let i = 0; i < 15; i++) {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 1.5, 60, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: i % 5 === 0 ? 0x00ffff : 
             i % 5 === 1 ? 0xff3366 : 
             i % 5 === 2 ? 0xffaa00 : 
             i % 5 === 3 ? 0x00ff99 : 0xff00ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(
      -60 + i * 10,
      30,
      -45
    );
    threeScene.add(beam);
  }
  
  // Add volumetric fog light - dramatic effect on stage
  const fogLightGeometry = new THREE.ConeGeometry(30, 60, 32);
  const fogLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  
  const fogLight = new THREE.Mesh(fogLightGeometry, fogLightMaterial);
  fogLight.position.set(0, 60, -45);
  fogLight.rotation.x = Math.PI;
  threeScene.add(fogLight);
}

// Create laser effects - more lasers and effects
function createLaserEffects() {
  threeScene.laserBeams = [];
  
  const laserColors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00, 
    0x00ffff, 0xff8800, 0x8800ff, 0x00ff88, 0xff0088
  ];
  
  // Create more laser beams with varied positions and angles
  for (let i = 0; i < 16; i++) {
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 160, 8);
    const laserMaterial = new THREE.MeshBasicMaterial({
      color: laserColors[i % 10],
      emissive: laserColors[i % 10],
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    
    // Position lasers in different locations
    if (i < 8) {
      // Ceiling-mounted lasers
      laser.position.set(
        -60 + i * 18,
        58,
        -45
      );
    } else {
      // Side-mounted lasers
      laser.position.set(
        i % 2 === 0 ? -79 : 79,
        20 + (i % 8) * 5,
        -60 + (i % 4) * 15
      );
    }
    
    // Randomized initial rotation
    laser.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    laser.rotation.z = (Math.random() - 0.5) * 0.5;
    
    threeScene.add(laser);
    threeScene.laserBeams.push(laser);
  }
  
  // Add laser light dots scattering effect
  const scatterGeometry = new THREE.BufferGeometry();
  const scatterVertices = [];
  
  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 160;
    const y = Math.random() * 60;
    const z = (Math.random() - 0.5) * 160;
    
    scatterVertices.push(x, y, z);
  }
  
  scatterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(scatterVertices, 3));
  
  const scatterMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  
  const laserScatter = new THREE.Points(scatterGeometry, scatterMaterial);
  threeScene.add(laserScatter);
  threeScene.laserScatter = laserScatter;
}

// Create volumetric light beams
function createVolumetricBeams() {
  threeScene.volumetricBeams = [];
  
  const beamColors = [0x6688ff, 0xff88aa, 0xffcc66, 0x66ddff, 0xdd88ff];
  
  for (let i = 0; i < 8; i++) {
    const coneHeight = 40 + Math.random() * 20;
    const coneRadius = 5 + Math.random() * 5;
    
    const beamGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: beamColors[i % 5],
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    
    // Position beams in a circular pattern around the stage
    const angle = (i / 8) * Math.PI * 2;
    const radius = 35;
    
    beam.position.set(
      Math.cos(angle) * radius, 
      60, 
      -45 + Math.sin(angle) * radius
    );
    
    beam.rotation.x = Math.PI; // Point down
    beam.rotation.z = Math.random() * Math.PI * 2;
    
    threeScene.add(beam);
    threeScene.volumetricBeams.push(beam);
  }
}

// Create holographic displays floating around the hall
function createHolographicDisplays() {
  threeScene.holographicDisplays = [];
  
  const displayGeometries = [
    new THREE.TorusGeometry(2, 0.5, 16, 32),
    new THREE.IcosahedronGeometry(2, 1),
    new THREE.OctahedronGeometry(2, 0),
    new THREE.SphereGeometry(2, 32, 16)
  ];
  
  const displayMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    emissive: 0x4488ff,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.7,
    wireframe: true
  });
  
  for (let i = 0; i < 12; i++) {
    const geometry = displayGeometries[i % 4];
    const display = new THREE.Mesh(geometry, displayMaterial.clone());
    
    // Spread displays around the hall
    display.position.set(
      (Math.random() - 0.5) * 120,
      10 + Math.random() * 30,
      (Math.random() - 0.5) * 120
    );
    
    // Random initial rotation
    display.rotation.x = Math.random() * Math.PI * 2;
    display.rotation.y = Math.random() * Math.PI * 2;
    display.rotation.z = Math.random() * Math.PI * 2;
    
    threeScene.add(display);
    threeScene.holographicDisplays.push(display);
  }
}

// Create tech elements around the room
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

// Add user to scene
export function addUserToScene(user) {
  // Create a group for the entire avatar
  const avatarGroup = new THREE.Group();
  avatarGroup.position.set(user.position.x, user.position.y, user.position.z);
  
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
    const targetPosition = new THREE.Vector3(position.x, position.y, position.z);
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