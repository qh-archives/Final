import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // Black background
  
  const camera = new THREE.PerspectiveCamera(
    90, // Reduced FOV for better framing
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // Position camera to see all canvases - elevated and zoomed out
  // Conveyor radius is 3, scaled by 2.5 = 7.5, so position camera far enough to see entire circle
  camera.position.set(0, 30, 35); // Elevated and zoomed out to see all canvases
  camera.lookAt(0, 30, 0); // Look at center of conveyor belt
  
  // Soft ambient lighting
  const ambientLight = new THREE.AmbientLight(0xFFFFF0, 0.8);
  scene.add(ambientLight);
  
  // Main directional light - positioned to hit the conveyor belt
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 10, 10); // Above and in front
  scene.add(directionalLight);
 
  
  // Top light for better metal reflection
  const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
  topLight.position.set(0, 12, 0); // Directly above
  scene.add(topLight);
  
  // Warm sun light at the center of the conveyor belt (360-degree omnidirectional)
  const sunLight = new THREE.PointLight(0xFFA500, 2.0, 50); // Warm orange/yellow sunlight color
  sunLight.position.set(0, 1.8, 0); // Center of conveyor belt (track is at y=3, group offset is -1.2, so 3-1.2=1.8)
  sunLight.castShadow = false; // Optional: can enable shadows if needed
  scene.add(sunLight);
  
  // Create rectangular planes that form a connected box
  // All four planes: 1920 × 1080 (16:9 aspect ratio)
  const planeWidth = 1920;
  const planeHeight = 1080;
  
  // Top plane: 1920 wide × 1080 deep
  const planeTop = new THREE.Mesh( 
    new THREE.PlaneGeometry( planeWidth, planeHeight ), // 1920 × 1080
    new THREE.MeshStandardMaterial( { color: 0xffffff } ) 
  );
  planeTop.position.set(0, planeHeight, 0); // At top, centered
  planeTop.rotateX( Math.PI / 2 );
  scene.add( planeTop );

  // Bottom plane: 1920 wide × 1080 deep
  const planeBottom = new THREE.Mesh( 
    new THREE.PlaneGeometry( planeWidth, planeHeight ), // 1920 × 1080
    new THREE.MeshPhongMaterial( { color: 0xffffff } ) 
  );
  planeBottom.position.set(0, 0, 0); // At bottom, centered
  planeBottom.rotateX( - Math.PI / 2 );
  scene.add( planeBottom );

  // Right plane: 1920 deep × 1080 tall (rotated around Y, so first param is depth, second is height)
  const planeRight = new THREE.Mesh(
    new THREE.PlaneGeometry( planeWidth, planeHeight ), // 1920 × 1080 (depth × height when rotated around Y)
    new THREE.MeshPhongMaterial( { color: 0xffffff } )
  );
  planeRight.position.set(planeWidth / 2, planeHeight / 2, 0); // At right edge, centered vertically
  planeRight.rotateY( - Math.PI / 2 );
  scene.add( planeRight );

  // Left plane: 1920 deep × 1080 tall
  const planeLeft = new THREE.Mesh(
    new THREE.PlaneGeometry( planeWidth, planeHeight ), // 1920 × 1080 (depth × height when rotated around Y)
    new THREE.MeshPhongMaterial( { color: 0xffffff } )
  );
  planeLeft.position.set(-planeWidth / 2, planeHeight / 2, 0); // At left edge, centered vertically
  planeLeft.rotateY( Math.PI / 2 );
  scene.add( planeLeft );


  // Conveyor system group
  const conveyorGroup = new THREE.Group();
  conveyorGroup.scale.set(7, 7, 7); // Enlarge by 2x
  conveyorGroup.position.y = 17;
  conveyorGroup.position.x = 0; // Move down by 30 pixels (approximately 1.2 units)
  scene.add(conveyorGroup);
  
  // Create the curved track (main rail)
  const trackGeometry = new THREE.TorusGeometry(3, 0.05, 8, 64);
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White
    emissive: 0x000000,
    roughness: 1,
    fog: true,
    metalness: 0.5,
    roughness: 0.5,
    metalnessNode: 0.5,
  });
  const track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.rotation.x = Math.PI / 2;
  track.position.y = 3;
  conveyorGroup.add(track);
  
  // Load all image textures for canvases
  const textureLoader = new THREE.TextureLoader();
  const canvasTextures = [];
  const imagePaths = ['/image2.jpg', '/image3.jpg', '/image4.jpg', '/image5.jpg', '/image6.jpg', '/image7.jpg'];
  
  // Load all canvas textures
  imagePaths.forEach((path, index) => {
    textureLoader.load(path, (texture) => {
      // Configure texture settings
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1); // Single image, no repeat
      texture.flipY = false; // Adjust if image is flipped
      canvasTextures[index] = texture;
      console.log(`Image texture ${index + 2} (${path}) loaded successfully`);
      
     
      canvasData.forEach((canvasItem, canvasIdx) => {
        const expectedTextureIdx = canvasIdx + 3; // Start from image5 (index 3)
        if (index === expectedTextureIdx && canvasItem.mesh && canvasItem.mesh.material) {
          canvasItem.mesh.material.map = texture;
          canvasItem.mesh.material.needsUpdate = true;
        }
      });
    }, undefined, (error) => {
      console.error(`Error loading image texture ${index + 2}:`, error);
      // Use default texture if loading fails
      canvasTextures[index] = canvasTextures[0] || fabricTexture;
    });
  });
  
  // Default fallback texture
  const fabricTexture = textureLoader.load('/image1.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.flipY = false;
  });
  
  // Create fabric canvas with SkinnedMesh
  function createFabricCanvas(width, height, segments = 10, texture = null) {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments * 1.5);
    
    // Create bones for the fabric
    const bones = [];
    const boneCount = segments + 1;
    
    // Create root bone
    const rootBone = new THREE.Bone();
    bones.push(rootBone);
    
    // Create vertical bones for fabric flow (along the height of the canvas)
    for (let i = 0; i < boneCount; i++) {
      const bone = new THREE.Bone();
      const boneY = (i / (boneCount - 1)) * height - height / 2;
      bone.position.x = 0;
      bone.position.y = boneY;
      bone.position.z = 0;
      rootBone.add(bone);
      bones.push(bone);
    }
    
    const skeleton = new THREE.Skeleton(bones);
    
    // Create skin indices and weights for each vertex
    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    const skinIndices = [];
    const skinWeights = [];
    
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      
      // Find closest bones based on Y position (vertical)
      const y = vertex.y;
      const normalizedY = (y + height / 2) / height; // 0 to 1
      const boneIndex = Math.floor(normalizedY * (boneCount - 1));
      
      // Calculate weights based on distance to bones
      const bone1Index = Math.max(0, Math.min(boneIndex, boneCount - 1)) + 1; // +1 for root bone
      const bone2Index = Math.max(0, Math.min(boneIndex + 1, boneCount - 1)) + 1;
      
      const bone1Y = ((bone1Index - 1) / (boneCount - 1)) * height - height / 2;
      const bone2Y = ((bone2Index - 1) / (boneCount - 1)) * height - height / 2;
      
      const dist1 = Math.abs(y - bone1Y);
      const dist2 = Math.abs(y - bone2Y);
      const totalDist = dist1 + dist2 || 0.0001;
      
      const weight1 = dist2 / totalDist;
      const weight2 = dist1 / totalDist;
      
      skinIndices.push(
        bone1Index, bone2Index, 0, 0
      );
      skinWeights.push(
        weight1, weight2, 0, 0
      );
    }
    
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
    
    // Create fabric material with specified texture or default
    const material = new THREE.MeshPhongMaterial({
      map: texture || fabricTexture,
      shininess: 100,
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.05,
      emissive: 0x000000,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.add(bones[0]);
    mesh.bind(skeleton);
    
    return { mesh, skeleton, bones };
  }
  
  const canvasData = [];
  const numCanvases = 6; // Reduced number of hangers/canvases
  const canvasHeight = 1.4;
  const canvasWidth = 2; // 4:3 aspect ratio (1.2 * 4/3 = 1.6)
  const hangerInstances = [];
  const hangerGroups = [];
  
  // Load metal hanger GLTF model
  const loader = new GLTFLoader();
  
  // Load both models, then create hangers once both are loaded
  let hangerModel = null;
  let jacketModel = null;
  let hangersCreated = false;
  
  function createHangers() {
    // Only create hangers once the hanger model is loaded
    // (jacket is optional - will be added if loaded)
    if (!hangerModel || hangersCreated) return;
    
    hangersCreated = true; // Prevent duplicate creation
    
    // Get the bounding box to help with positioning
    const box = new THREE.Box3().setFromObject(hangerModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Create hanger instances for each canvas position
    for (let i = 0; i < numCanvases; i++) {
      // Create a group for hanger and canvas/jacket together
      const itemGroup = new THREE.Group();
      
      const hangerClone = hangerModel.clone();
      const angle = (i / numCanvases) * Math.PI * 2;
      const radius = 3;
      
      // Position hanger hook at the track level (y=3)
      // Adjust position based on hanger model's center/offset
      hangerClone.position.x = 0; // Relative to group
      hangerClone.position.z = 0;
      hangerClone.position.y = -0.75; // Adjust so hook is at y=0 relative to group
      
      // Rotate hanger to face outward
      hangerClone.rotation.y = 0; // Will be rotated with group
      hangerClone.rotation.x = 0;
      
      // Scale if needed (adjust based on model size)
      const scale = 0.1; // Start with 1.0, adjust if needed
      hangerClone.scale.set(scale, scale, scale);
      
      // Position the entire group along the circular track
      itemGroup.position.x = Math.cos(angle) * radius;
      itemGroup.position.z = Math.sin(angle) * radius;
      itemGroup.position.y = 3; // Track level
      
      // Rotate the entire group to face outward
      itemGroup.rotation.y = angle;
      
      // Add hanger to group
      itemGroup.add(hangerClone);
      
      // Add puffer jacket to hangers (first few hangers)
      if (i < 3 && jacketModel) {
        const jacketClone = jacketModel.clone();
        

        
        itemGroup.add(jacketClone);
      } else {
     
        const canvasIndex = i - 3;
        // Use image5 (index 3), image6 (index 4), image7 (index 5)
        const textureIndex = Math.min(canvasIndex + 3, canvasTextures.length - 1); // Start from image5
        const canvasTexture = canvasTextures[textureIndex] || fabricTexture;
        const { mesh, skeleton, bones } = createFabricCanvas(canvasWidth, canvasHeight, 10, canvasTexture);
        
        // Position canvas hanging from the hanger (below the hook)
        // The hook is typically at the top of the hanger, so canvas should be below
        const hangerHeight = size.y * scale; // Approximate hanger height
        mesh.position.x = 0; // Relative to group
        mesh.position.z = 0;
        mesh.position.y = -1.139; // Lower the canvas
        
        // Rotate canvas to face forward (radially outward from center)
        mesh.rotation.y = 0; // Relative to group (group handles rotation)
        mesh.rotation.x = 0; // Hang straight down
        
        // Store data for animation
        mesh.userData.angle = angle;
        mesh.userData.bones = bones;
        mesh.userData.skeleton = skeleton;
        mesh.userData.baseRotation = mesh.rotation.clone();
        
        // Add canvas to group
        itemGroup.add(mesh);
        
        // Store canvas data for animation
        canvasData.push({ mesh, bones, skeleton });
      }
      
      // Add group to conveyor
      conveyorGroup.add(itemGroup);
      
      // Store references
      hangerInstances.push(hangerClone);
      hangerGroups.push(itemGroup);
    }
    
  }

  
  // Load the metal hanger model
  loader.load('/metal_hanger_gltf/scene.gltf', (gltf) => {
    hangerModel = gltf.scene;
    createHangers(); // Will create hangers immediately
  }, undefined, (error) => {
    console.error('Error loading metal hanger model:', error);
    // Fallback: create canvases without hangers if model fails to load
    for (let i = 0; i < numCanvases; i++) {
      const { mesh, skeleton, bones } = createFabricCanvas(0.8, canvasHeight, 10);
      const angle = (i / numCanvases) * Math.PI * 2;
      const radius = 3;
      
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.position.y = 3 - canvasHeight / 2;
      
      mesh.rotation.y = angle;
      mesh.rotation.x = 0;
      
      mesh.userData.angle = angle;
      mesh.userData.bones = bones;
      mesh.userData.skeleton = skeleton;
      mesh.userData.baseRotation = mesh.rotation.clone();
      
      conveyorGroup.add(mesh);
      canvasData.push({ mesh, bones, skeleton });
    }
  });
  
  
  
  // Add rollers on the track
  for (let i = 0; i < 16; i++) {
    const rollerGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
    const rollerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White
      emissive: 0x000000,
      roughness: 1,
      fog: true,
      metalness: 0.5,
      roughness: 0.5,
      metalnessNode: 0.5,
    });
    const roller = new THREE.Mesh(rollerGeometry, rollerMaterial);
    const angle = (i / 16) * Math.PI * 2;
    roller.position.set(
      Math.cos(angle) * 3,
      3,
      Math.sin(angle) * 3
    );
    roller.rotation.z = Math.PI / 2;
    roller.userData.angle = angle;
    conveyorGroup.add(roller);
  }
  
  // Scroll-based animation - endless scroll
  let scrollProgress = 0;
  let totalScrollDistance = 0;
  let lastScrollY = 0;
  const scrollUnit = 1000; // Distance for one full rotation
  
  function handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    
    // Accumulate total scroll distance
    totalScrollDistance += scrollDelta;
    
    // Calculate progress based on total scroll distance (endless)
    scrollProgress = (totalScrollDistance % scrollUnit) / scrollUnit;
    
    // If scrolled past the end, reset scroll position to create seamless loop
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (currentScrollY >= maxScroll * 0.9) {
      // Reset scroll position when near the end for seamless looping
      window.scrollTo(0, maxScroll * 0.1);
      lastScrollY = window.scrollY;
    } else {
      lastScrollY = currentScrollY;
    }
  }
  
  // Make page scrollable with very large height for endless scrolling
  document.body.style.height = '10000vh'; // Very large height for continuous scrolling
  document.body.style.overflow = 'auto';
  
  window.addEventListener('scroll', handleScroll);
  
  // Initialize last scroll position
  lastScrollY = window.scrollY;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate conveyor based on total scroll distance (endless rotation)
    // Each scrollUnit (1000px) = one full rotation
    const totalRotation = (totalScrollDistance / scrollUnit) * Math.PI * 2;
    conveyorGroup.rotation.y = totalRotation;
    
    // Animate rollers based on scroll position
    conveyorGroup.children.forEach(child => {
      if (child.userData.angle !== undefined && child.geometry instanceof THREE.CylinderGeometry) {
        child.rotation.x = totalRotation * 2;
      }
    });
    
    // Animate fabric canvases with flowing effect (both scroll and static)
    const time = Date.now() * 0.001;
    const scrollVelocity = scrollProgress;
    
    canvasData.forEach(({ mesh, bones }, index) => {
      if (bones && bones.length > 1) {
        // Calculate flow based on scroll position and position on track
        const angle = mesh.userData.angle + totalRotation;
        
        // Static gentle sway (always active)
        const staticSway = Math.sin(time * 0.5 + angle * 2) * 0.1;
        const staticFlow = Math.cos(time * 0.7 + angle * 1.5) * 0.08;
        
        // Scroll-based flow (more pronounced when scrolling)
        const scrollFlow = Math.sin(angle * 2 + time) * scrollVelocity * 0.4;
        const scrollSideFlow = Math.cos(angle * 3 + time * 0.5) * scrollVelocity * 0.3;
        
        // Combine static and scroll effects
        const flowAmount = staticFlow + scrollFlow;
        const sideFlow = staticSway + scrollSideFlow;
        
        // Animate bones to create fabric flow
        for (let i = 1; i < bones.length; i++) {
          const bone = bones[i];
          const progress = (i - 1) / (bones.length - 2); // 0 to 1 (top to bottom)
          
          // Create flowing effect - more movement at bottom (like fabric hanging)
          const verticalFlow = Math.sin(progress * Math.PI + time + angle) * flowAmount * (1 - progress);
          const horizontalFlow = Math.cos(progress * Math.PI * 2 + time * 0.7 + angle) * sideFlow * (1 - progress);
          
          // Add subtle wave effect
          const wave = Math.sin(progress * Math.PI * 3 + time * 1.2 + angle * 0.5) * 0.15 * (1 - progress);
          
          // Apply rotation to bones for fabric flow
          bone.rotation.x = verticalFlow * 0.6 + wave * 0.3;
          bone.rotation.z = horizontalFlow * 0.4 + wave * 0.2;
          bone.rotation.y = Math.sin(progress * Math.PI * 1.5 + time * 0.8 + angle) * (scrollVelocity * 0.15 + 0.05) * (1 - progress);
        }
        
        // Update skeleton
        if (mesh.userData.skeleton) {
          mesh.userData.skeleton.update();
        }
        
        // Canvas is static - no billboarding, stays in fixed rotation
      }
    });
    
    // Camera stays static (no movement)
    // camera.position.x = Math.sin(scrollProgress * Math.PI * 2) * 4;
    // camera.lookAt(0, 4, 0);
    
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  animate();
}

main();