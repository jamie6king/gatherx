// Three.js scene module
let threeScene, camera, renderer, controls;
const userAvatars = {};
const socket = io();

// Initialize Three.js scene
export function initThreeScene() {
  // Create scene
  threeScene = new THREE.Scene();
  // Changing to bright sky blue background instead of dark space
  threeScene.background = new THREE.Color(0x87CEEB);
  // Remove fog for a clearer view like Habbo
  // threeScene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById('3d-container').appendChild(renderer.domElement);

  // Add lights - brighter for Habbo style
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  threeScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 3, 2);
  directionalLight.castShadow = true;
  threeScene.add(directionalLight);

  // Add floor - Habbo style colorful carpet
  const floorSize = 50;
  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFF9E80, // Warm orange/peach color for the carpet
    roughness: 0.9,
    metalness: 0.0
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  threeScene.add(floor);

  // Create grid pattern on the floor like Habbo
  const gridHelper = new THREE.GridHelper(floorSize, 50, 0x888888, 0xcccccc);
  gridHelper.position.y = 0.01; // Slightly above the floor
  threeScene.add(gridHelper);

  // Add walls
  createWalls();

  // Add Habbo-style decorative elements
  addHabboDecorations();

  // Set up controls (first-person view)
  controls = new FirstPersonControls(camera, renderer.domElement);

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
    
    this.movementSpeed = 0.1;
    this.lookSpeed = 0.002;
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    this.mouseDragOn = false;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.viewHalfX = 0;
    this.viewHalfY = 0;
    
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
      
      this.camera.rotation.y -= this.mouseX * this.lookSpeed;
      
      // Limit vertical rotation to avoid flipping
      const verticalRotation = this.camera.rotation.x - this.mouseY * this.lookSpeed;
      this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, verticalRotation));
      
      // Send rotation update to server
      socket.emit('rotate', { y: this.camera.rotation.y });
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
    
    this.velocity.x = 0;
    this.velocity.z = 0;
    
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();
    
    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * this.movementSpeed;
    }
    
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * this.movementSpeed;
    }
    
    // Apply rotation to movement
    const angle = this.camera.rotation.y;
    const moveX = this.velocity.x * Math.cos(angle) - this.velocity.z * Math.sin(angle);
    const moveZ = this.velocity.x * Math.sin(angle) + this.velocity.z * Math.cos(angle);
    
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;
    
    // Send position update to server if moving
    if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
      socket.emit('move', {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      });
    }
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (controls) {
    controls.update();
  }
  
  renderer.render(threeScene, camera);
}

// Create walls for the room - Habbo style
function createWalls() {
  // Light blue wall color like Habbo rooms
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x6FA8DC, // Light blue
    roughness: 0.9,
    metalness: 0.0
  });
  
  // North wall
  const northWallGeometry = new THREE.BoxGeometry(50, 10, 1);
  const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
  northWall.position.set(0, 5, -25);
  northWall.castShadow = true;
  northWall.receiveShadow = true;
  threeScene.add(northWall);
  
  // South wall
  const southWall = northWall.clone();
  southWall.position.z = 25;
  threeScene.add(southWall);
  
  // East wall
  const eastWallGeometry = new THREE.BoxGeometry(1, 10, 50);
  const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
  eastWall.position.set(25, 5, 0);
  eastWall.castShadow = true;
  eastWall.receiveShadow = true;
  threeScene.add(eastWall);
  
  // West wall
  const westWall = eastWall.clone();
  westWall.position.x = -25;
  threeScene.add(westWall);
  
  // Adding a Habbo-style wallpaper border at the top of the walls
  const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFD700, // Gold color for the border
    roughness: 0.5,
    metalness: 0.3
  });
  
  // Top borders
  const northBorderGeometry = new THREE.BoxGeometry(50, 0.5, 0.2);
  const northBorder = new THREE.Mesh(northBorderGeometry, borderMaterial);
  northBorder.position.set(0, 9.8, -24.9);
  threeScene.add(northBorder);
  
  const southBorder = northBorder.clone();
  southBorder.position.z = 24.9;
  threeScene.add(southBorder);
  
  const eastBorderGeometry = new THREE.BoxGeometry(0.2, 0.5, 50);
  const eastBorder = new THREE.Mesh(eastBorderGeometry, borderMaterial);
  eastBorder.position.set(24.9, 9.8, 0);
  threeScene.add(eastBorder);
  
  const westBorder = eastBorder.clone();
  westBorder.position.x = -24.9;
  threeScene.add(westBorder);
  
  // Ceiling - white like Habbo
  const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 10;
  ceiling.receiveShadow = true;
  threeScene.add(ceiling);
}

// Add Habbo-style decorative elements
function addHabboDecorations() {
  // Add Habbo style furniture
  
  // 1. Colorful sofas
  addSofa(-15, 0, -20, 0x66BB6A); // Green sofa
  addSofa(-10, 0, -20, 0x66BB6A);
  addSofa(-5, 0, -20, 0x66BB6A);
  
  // 2. Tables
  addTable(-12, 0, -15, 0xA1887F); // Brown table
  
  // 3. Plants/trees
  addPlant(-20, 0, -20, 0x81C784);
  addPlant(20, 0, -20, 0x81C784);
  addPlant(20, 0, 20, 0x81C784);
  addPlant(-20, 0, 20, 0x81C784);
  
  // 4. Habbo pool area
  createPool(10, 0, 10);
  
  // 5. DJ Booth
  createDJBooth(-15, 0, 15);
  
  // 6. Dance floor with colorful tiles
  createDanceFloor(5, 0.05, 0, 8, 8);
}

// Helper functions for Habbo decorations

// Sofa
function addSofa(x, y, z, color) {
  const baseGeometry = new THREE.BoxGeometry(4, 0.8, 1.5);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    metalness: 0.1
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(x, y + 0.4, z);
  base.castShadow = true;
  base.receiveShadow = true;
  threeScene.add(base);
  
  // Back of sofa
  const backGeometry = new THREE.BoxGeometry(4, 1.5, 0.5);
  const back = new THREE.Mesh(backGeometry, baseMaterial);
  back.position.set(x, y + 1.35, z - 0.5);
  back.castShadow = true;
  threeScene.add(back);
  
  // Arms of sofa
  const armGeometry = new THREE.BoxGeometry(0.5, 1, 1.5);
  
  const leftArm = new THREE.Mesh(armGeometry, baseMaterial);
  leftArm.position.set(x + 1.75, y + 0.9, z);
  leftArm.castShadow = true;
  threeScene.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, baseMaterial);
  rightArm.position.set(x - 1.75, y + 0.9, z);
  rightArm.castShadow = true;
  threeScene.add(rightArm);
}

// Table
function addTable(x, y, z, color) {
  const tableTopGeometry = new THREE.BoxGeometry(5, 0.3, 5);
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.2
  });
  const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
  tableTop.position.set(x, y + 1, z);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  threeScene.add(tableTop);
  
  // Table legs
  const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
  
  // Four legs
  for (let i = 0; i < 4; i++) {
    const xPos = i < 2 ? x + 2 : x - 2;
    const zPos = i % 2 === 0 ? z + 2 : z - 2;
    
    const leg = new THREE.Mesh(legGeometry, tableMaterial);
    leg.position.set(xPos, y + 0.5, zPos);
    leg.castShadow = true;
    threeScene.add(leg);
  }
}

// Plant
function addPlant(x, y, z, color) {
  // Pot
  const potGeometry = new THREE.CylinderGeometry(0.7, 0.5, 1, 8);
  const potMaterial = new THREE.MeshStandardMaterial({
    color: 0xE57373, // Red pot
    roughness: 0.9,
    metalness: 0.1
  });
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.position.set(x, y + 0.5, z);
  pot.castShadow = true;
  pot.receiveShadow = true;
  threeScene.add(pot);
  
  // Plant
  const plantGeometry = new THREE.SphereGeometry(1, 8, 8);
  const plantMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 1.0,
    metalness: 0.0
  });
  
  const plant = new THREE.Mesh(plantGeometry, plantMaterial);
  plant.position.set(x, y + 2, z);
  plant.scale.set(1, 1.5, 1);
  plant.castShadow = true;
  threeScene.add(plant);
}

// Pool
function createPool(x, y, z) {
  // Pool base
  const poolBaseGeometry = new THREE.BoxGeometry(10, 0.5, 10);
  const poolBaseMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.8,
    metalness: 0.2
  });
  const poolBase = new THREE.Mesh(poolBaseGeometry, poolBaseMaterial);
  poolBase.position.set(x, y, z);
  poolBase.receiveShadow = true;
  threeScene.add(poolBase);
  
  // Pool water
  const waterGeometry = new THREE.BoxGeometry(9, 0.25, 9);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x90CAF9, // Light blue water
    roughness: 0.3,
    metalness: 0.6,
    transparent: true,
    opacity: 0.7
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.set(x, y + 0.3, z);
  threeScene.add(water);
  
  // Pool edges
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x64B5F6, // Slightly darker blue
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Edge geometry
  const longEdgeGeometry = new THREE.BoxGeometry(10, 0.5, 1);
  const shortEdgeGeometry = new THREE.BoxGeometry(1, 0.5, 8);
  
  // North edge
  const northEdge = new THREE.Mesh(longEdgeGeometry, edgeMaterial);
  northEdge.position.set(x, y + 0.5, z - 4.5);
  northEdge.castShadow = true;
  threeScene.add(northEdge);
  
  // South edge
  const southEdge = new THREE.Mesh(longEdgeGeometry, edgeMaterial);
  southEdge.position.set(x, y + 0.5, z + 4.5);
  southEdge.castShadow = true;
  threeScene.add(southEdge);
  
  // East edge
  const eastEdge = new THREE.Mesh(shortEdgeGeometry, edgeMaterial);
  eastEdge.position.set(x + 4.5, y + 0.5, z);
  eastEdge.castShadow = true;
  threeScene.add(eastEdge);
  
  // West edge
  const westEdge = new THREE.Mesh(shortEdgeGeometry, edgeMaterial);
  westEdge.position.set(x - 4.5, y + 0.5, z);
  westEdge.castShadow = true;
  threeScene.add(westEdge);
}

// DJ Booth
function createDJBooth(x, y, z) {
  // Main desk
  const deskGeometry = new THREE.BoxGeometry(6, 1.5, 2);
  const deskMaterial = new THREE.MeshStandardMaterial({
    color: 0x424242, // Dark gray
    roughness: 0.8,
    metalness: 0.3
  });
  const desk = new THREE.Mesh(deskGeometry, deskMaterial);
  desk.position.set(x, y + 0.75, z);
  desk.castShadow = true;
  desk.receiveShadow = true;
  threeScene.add(desk);
  
  // DJ equipment on top
  const equipmentGeometry = new THREE.BoxGeometry(5, 0.4, 1.5);
  const equipmentMaterial = new THREE.MeshStandardMaterial({
    color: 0x212121, // Almost black
    roughness: 0.5,
    metalness: 0.7
  });
  const equipment = new THREE.Mesh(equipmentGeometry, equipmentMaterial);
  equipment.position.set(x, y + 1.7, z - 0.1);
  equipment.castShadow = true;
  threeScene.add(equipment);
  
  // Turntables
  for (let i = 0; i < 2; i++) {
    const turntableGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16);
    const turntableMaterial = new THREE.MeshStandardMaterial({
      color: 0x9E9E9E, // Gray
      roughness: 0.5,
      metalness: 0.5
    });
    const turntable = new THREE.Mesh(turntableGeometry, turntableMaterial);
    turntable.rotation.x = Math.PI / 2;
    turntable.position.set(x + (i === 0 ? -1.5 : 1.5), y + 1.95, z - 0.1);
    turntable.castShadow = true;
    threeScene.add(turntable);
    
    // Vinyl record
    const vinylGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16);
    const vinylMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000, // Black
      roughness: 0.9,
      metalness: 0.1
    });
    const vinyl = new THREE.Mesh(vinylGeometry, vinylMaterial);
    vinyl.rotation.x = Math.PI / 2;
    vinyl.position.set(x + (i === 0 ? -1.5 : 1.5), y + 2.0, z - 0.1);
    vinyl.castShadow = true;
    threeScene.add(vinyl);
  }
}

// Dance floor
function createDanceFloor(x, y, z, width, depth) {
  const tileSize = 1;
  const colors = [0xFF5252, 0xFFFF00, 0x4CAF50, 0x2196F3, 0x9C27B0]; // Red, yellow, green, blue, purple
  
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < depth; j++) {
      const colorIndex = (i + j) % colors.length;
      
      const tileGeometry = new THREE.BoxGeometry(tileSize, 0.1, tileSize);
      const tileMaterial = new THREE.MeshStandardMaterial({
        color: colors[colorIndex],
        roughness: 0.8,
        metalness: 0.3,
        emissive: colors[colorIndex],
        emissiveIntensity: 0.2
      });
      
      const tile = new THREE.Mesh(tileGeometry, tileMaterial);
      tile.position.set(
        x - (width * tileSize / 2) + (i * tileSize) + tileSize / 2,
        y,
        z - (depth * tileSize / 2) + (j * tileSize) + tileSize / 2
      );
      tile.receiveShadow = true;
      threeScene.add(tile);
    }
  }
}

// Add user to scene
export function addUserToScene(user) {
  // Create a group for the entire avatar
  const avatarGroup = new THREE.Group();
  avatarGroup.position.set(user.position.x, 0, user.position.z);
  avatarGroup.rotation.y = user.rotation.y || 0;
  
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
    userAvatars[userId].position.set(position.x, 0, position.z);
  }
}

// Rotate user
export function rotateUser(userId, rotation) {
  if (userAvatars[userId]) {
    userAvatars[userId].rotation.y = rotation.y;
  }
}

// Remove user
export function removeUser(userId) {
  if (userAvatars[userId]) {
    threeScene.remove(userAvatars[userId]);
    delete userAvatars[userId];
  }
} 