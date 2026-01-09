import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"
import { X, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'
import { getAiDiariesApi } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"
import { PortfolioDiary } from "@/features/diary/types/diary"
import MemoryAlbum from "../components/MemoryAlbum"



// --- Constants ---
const PAW_PALETTE = [
  '#FF7EB3', // Vivid Pink
  '#48DBFB', // Vivid Sky Blue
  '#1DD1A1', // Vivid Green
  '#FDCB6E', // Vivid Yellow
  '#FF9F43', // Vivid Orange
  '#A29BFE', // Vivid Periwinkle
  '#FF6B6B', // Vivid Coral Red
  '#00D2D3', // Bright Teal
  '#6C5CE7', // Vivid Purple
  '#FD79A8', // Pixie Pink
  '#FFC312', // Sunflower Yellow
  '#C4E538', // Lime Green
  '#12CBC4', // Aqua
  '#FDA7DF', // Lavender Rose
  '#ED4C67', // Deep Rose
  '#F79F1F', // Radiant Orange
  '#A3CB38', // Olive Green
  '#1289A7', // Ocean Blue
  '#D980FA', // Orchid
  '#B53471', // Berry
  '#E056FD', // Electric Violet
  '#686DE0', // Royal Blue
  '#7ED6DF', // Heliotrope
  '#22A6B3', // Green-Blue
];

export default function PortfolioPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioDiary | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [diaries, setDiaries] = useState<PortfolioDiary[]>([])
  const [viewMode, setViewMode] = useState<'3d' | 'album'>('3d')
  const { user, token } = useAuth()
  const navigate = useNavigate();

  // Store all fetched diaries to shuffle from locally - declared at top level
  const allDiariesRef = useRef<PortfolioDiary[]>([]);

  // --- Data Fetching ---
  useEffect(() => {
    // Cute placeholder generator (Canvas)
    const generatePlaceholderImage = (index: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return "/placeholder.svg";

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 512, 512);

      // Paw Pattern Color (Use the card's assigned color for harmony)
      // We want a slightly darker/stronger version of the card color for visibility
      const cardColor = PAW_PALETTE[index % PAW_PALETTE.length];
      ctx.fillStyle = cardColor;

      // Draw Paw Print (Scaled up from 24x24 vector)
      // Scale ~20x, Center ~256

      // Main Pad (Soft Triangular Shape)
      ctx.beginPath();
      const py = 340; // Pad center Y
      ctx.moveTo(256, py - 40); // Top center dip
      // Right lobe
      ctx.bezierCurveTo(296, py - 60, 386, py - 20, 386, py + 40);
      // Bottom curve
      ctx.bezierCurveTo(386, py + 120, 126, py + 120, 126, py + 40);
      // Left lobe
      ctx.bezierCurveTo(126, py - 20, 216, py - 60, 256, py - 40);
      ctx.fill();

      // Toes - Vertical Ovals (arranged in arch)

      // Far Left
      ctx.beginPath();
      ctx.ellipse(90, 200, 35, 55, -0.4, 0, 2 * Math.PI);
      ctx.fill();

      // Inner Left
      ctx.beginPath();
      ctx.ellipse(190, 110, 40, 60, -0.2, 0, 2 * Math.PI);
      ctx.fill();

      // Inner Right
      ctx.beginPath();
      ctx.ellipse(322, 110, 40, 60, 0.2, 0, 2 * Math.PI);
      ctx.fill();

      // Far Right
      ctx.beginPath();
      ctx.ellipse(422, 200, 35, 55, 0.4, 0, 2 * Math.PI);
      ctx.fill();

      return canvas.toDataURL('image/png');
    }

    // Store all fetched diaries to shuffle from locally


    const fetchDiaries = async () => {
      const PLACEHOLDER_COUNT = 30; // Increased to 30 for better density

      const generatePlaceholders = (count: number, startIdx: number) => {
        return Array.from({ length: count }).map((_, i) => ({
          id: -1 * (startIdx + i + 1),
          src: generatePlaceholderImage(startIdx + i),
          title: "미래의 추억 🐾",
          date: "Coming Soon",
          location: "행복한 장소",
          content: "이곳에 당신과 반려동물의 소중한 추억이 채워질 거예요!",
          likes: 0,
          weather: "🌈",
          isPlaceholder: true,
          color: PAW_PALETTE[(startIdx + i) % PAW_PALETTE.length]
        }));
      };

      // Default placeholders if no user/token
      if (!user?.id || !token) {
        setDiaries(generatePlaceholders(PLACEHOLDER_COUNT, 0));
        return;
      }

      try {
        const res = await getAiDiariesApi(Number(user.id))
        if (Array.isArray(res)) {
          const mapped: PortfolioDiary[] = res.map((d: any, index: number) => {
            let firstImage = "/placeholder-diary.jpg";
            if (d.imageUrls && d.imageUrls.length > 0) firstImage = d.imageUrls[0];
            else if (d.images && d.images.length > 0) {
              if (typeof d.images[0] === 'string') firstImage = d.images[0];
              else if (d.images[0].imageUrl) firstImage = d.images[0].imageUrl;
            }

            if (firstImage.includes('petlog-images-bucket.s3.ap-northeast-2.amazonaws.com')) {
              if (import.meta.env.DEV) {
                firstImage = firstImage.replace('https://petlog-images-bucket.s3.ap-northeast-2.amazonaws.com', '/s3-images');
              }
            }

            return {
              id: d.diaryId,
              src: firstImage,
              title: d.title || "무제",
              date: d.date,
              location: d.locationName || "어딘가",
              content: d.content,
              likes: 0,
              weather: d.weather || "맑음 ☀️",
              images: d.images || [],
              isPlaceholder: false,
              color: PAW_PALETTE[index % PAW_PALETTE.length]
            }
          });

          allDiariesRef.current = mapped;
          updateDisplayDiaries(mapped); // Initial load
        } else {
          setDiaries(generatePlaceholders(PLACEHOLDER_COUNT, 0));
        }
      } catch (e: any) {
        if (e.response && e.response.status === 401) navigate('/login');
        setDiaries(generatePlaceholders(PLACEHOLDER_COUNT, 0));
      }
    }

    const updateDisplayDiaries = (sourceDiaries: PortfolioDiary[]) => {
      const PLACEHOLDER_COUNT = 30;
      // 1. Shuffle
      const shuffled = [...sourceDiaries].sort(() => 0.5 - Math.random());

      // 2. Take top 30
      let selected = shuffled.slice(0, PLACEHOLDER_COUNT);

      // 3. Fill if less than 30
      if (selected.length < PLACEHOLDER_COUNT) {
        const remaining = PLACEHOLDER_COUNT - selected.length;
        const startIdx = selected.length;
        const newPlaceholders = Array.from({ length: remaining }).map((_, i) => ({
          id: -1 * (startIdx + i + 1),
          src: generatePlaceholderImage(startIdx + i),
          title: "미래의 추억 🐾",
          date: "Coming Soon",
          location: "행복한 장소",
          content: "이곳에 당신과 반려동물의 소중한 추억이 채워질 거예요!",
          likes: 0,
          weather: "🌈",
          isPlaceholder: true,
          color: PAW_PALETTE[(startIdx + i) % PAW_PALETTE.length]
        }));
        selected = [...selected, ...newPlaceholders];
      }
      setDiaries(selected);
    };

    fetchDiaries();

    // Random shuffle interval (e.g., every 20 seconds)
    const intervalId = setInterval(() => {
      if (allDiariesRef.current.length > 0) {
        console.log('[Portfolio] 🔄 Refreshing diary selection...'); // Log for debugging
        updateDisplayDiaries(allDiariesRef.current);
      }
    }, 20000); // 20000ms = 20s

    return () => clearInterval(intervalId);

  }, [user, token, navigate])


  // --- Three.js Logic ---
  const containerRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Interaction
  const mouseRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const rotationRef = useRef({ x: 0, y: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current || diaries.length === 0) return

    const scene = new THREE.Scene()



    // Camera
    const camera = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000)
    camera.position.set(0, 0, 36)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }
    containerRef.current.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(10, 10, 20)
    dirLight.castShadow = true;
    scene.add(dirLight)

    const blueLight = new THREE.DirectionalLight(0x448AFF, 1.0);
    blueLight.position.set(-15, -5, -10);
    scene.add(blueLight);

    const purpleLight = new THREE.DirectionalLight(0xE040FB, 0.8);
    purpleLight.position.set(15, 5, -10);
    scene.add(purpleLight);

    // --- Stars Background (Particles) ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.6,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);


    // --- Core Volumetric Sphere (The "Planet") ---
    // Using Fresnel Shader for that "Atmosphere/Glow" 3D look
    const coreGeo = new THREE.SphereGeometry(9, 64, 64);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x9D50BB) }, // Bright Purple/Pinkish Rim
        baseColor: { value: new THREE.Color(0x240046) }, // Deep Dark Indigo/Purple Center
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform vec3 baseColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float dotNM = max(0.0, dot(normal, viewDir)); 
          
          // Fresnel factor (0 at center, 1 at edge)
          float fresnel = pow(1.0 - dotNM, 2.0); 
          
          // Smooth Gradient: Mix base (center) to glow (edge)
          vec3 finalColor = mix(baseColor, glowColor, fresnel);
          
          // Brightness boost
          gl_FragColor = vec4(finalColor * 1.5, 0.95);
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);


    // --- The Sphere of Cards ---
    const group = new THREE.Group();
    scene.add(coreSphere); // Add sphere directly to scene (Static)
    // group.add(coreSphere); // Do NOT add to rotating group
    scene.add(group);
    groupRef.current = group;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    const radius = 11.5;
    const clickableMeshes: THREE.Object3D[] = [];

    diaries.forEach((photo, index) => {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / diaries.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      const cardGroup = new THREE.Group();
      cardGroup.position.set(x, y, z);
      cardGroup.lookAt(x * 2, y * 2, z * 2);

      // 1. Base Card (Colorful)
      const frameGeo = new THREE.BoxGeometry(3.6, 4.5, 0.1);
      const frameMat = new THREE.MeshStandardMaterial({
        color: photo.color || 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      frame.receiveShadow = true;
      cardGroup.add(frame);

      // 2. Image (Fills the upper card area - no white border)
      const imgGeo = new THREE.PlaneGeometry(3.4, 3.4);
      const tex = textureLoader.load(photo.src || "/placeholder.svg");

      const imgMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide
      });
      const imgMesh = new THREE.Mesh(imgGeo, imgMat);
      imgMesh.position.y = 0.4; // Upper area of card
      imgMesh.position.z = 0.06; // On top of base
      imgMesh.userData = { photo, index };
      cardGroup.add(imgMesh);

      // --- 4. Date Label (Handwritten Style) ---
      const createDateLabelTexture = (dateText: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128; // Wide strip
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Transparent background
        ctx.clearRect(0, 0, 512, 128);

        // Text settings - improved readability
        ctx.fillStyle = '#FFFFFF'; // White for maximum visibility
        ctx.font = 'bold 80px "Gaegu", cursive'; // Larger handwritten font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(dateText, 256, 64);

        return new THREE.CanvasTexture(canvas);
      };

      const dateTex = createDateLabelTexture(photo.date);
      if (dateTex) {
        const dateGeo = new THREE.PlaneGeometry(3.0, 0.7);
        const dateMat = new THREE.MeshBasicMaterial({
          map: dateTex,
          transparent: true,
          side: THREE.DoubleSide
        });
        const dateMesh = new THREE.Mesh(dateGeo, dateMat);
        dateMesh.position.y = -1.5; // Bottom area
        dateMesh.position.z = 0.06;
        cardGroup.add(dateMesh);
      }


      clickableMeshes.push(imgMesh);
      // Make the whole card clickable for easier interaction
      clickableMeshes.push(frame);
      frame.userData = { photo, index };

      group.add(cardGroup);
    });

    // --- Animation ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const animate = () => {
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.05;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.05;

      // Auto rotate
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0005;
        stars.rotation.y -= 0.0002;
      }

      group.rotation.y = rotationRef.current.y;
      group.rotation.x = rotationRef.current.x;

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    animate();


    // --- Events ---
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - mouseRef.current.x;
      const deltaY = e.clientY - mouseRef.current.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;

      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    const handleMouseUp = () => { isDraggingRef.current = false; }

    const handleClick = (e: MouseEvent) => {
      if (isDraggingRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        setSelectedPhoto(hit.userData.photo);
        setCurrentImageIndex(0);
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(15, Math.min(60, camera.position.z));
    }

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(dom)) {
        containerRef.current.removeChild(dom);
      }
    }

  }, [diaries])

  return (
    <div className="relative w-full h-screen overflow-hidden text-gray-800"
      style={{
        background: 'radial-gradient(circle at center, #1E1B4B 0%, #000000 100%)', // Dark Space Gradient
      }}
    >
      {/* --- Header (White) - Only visible in 3D mode --- */}
      <div className={`absolute top-0 left-0 right-0 z-10 p-8 flex flex-col items-center pointer-events-none transition-opacity duration-300 ${viewMode === '3d' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full flex justify-between items-start">
          {/* Empty div for spacing/layout balance if needed, or just let the title center naturally via absolute centering or flex logic. 
               The current layout has the title centered. Let's keep the title centered and put the counter on the right. 
               The original code had flex-col items-center. To place something on the right while keeping title centered, 
               we might need a different layout structure or absolute positioning for the counter.
           */}
          <div /> {/* Spacer */}

          {/* Title - Centered */}
          <div className="bg-black/30 backdrop-blur-md px-8 py-4 rounded-full shadow-lg border border-white/10 flex flex-col items-center gap-2 pointer-events-auto transition-all duration-300">
            {/* View Toggle Tabs */}
            <div className="flex bg-black/40 rounded-full p-1 mb-2 border border-white/20">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-5 py-2 rounded-full font-['Jua'] text-lg transition-all flex items-center gap-2 ${viewMode === '3d'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span>🔮</span> 3D 스페이스
              </button>
              <button
                onClick={() => setViewMode('album')}
                className={`px-5 py-2 rounded-full font-['Jua'] text-lg transition-all flex items-center gap-2 ${viewMode === 'album'
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span>📒</span> 추억 앨범
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white font-['Jua'] flex items-center gap-2 drop-shadow-lg">
              <span>✨</span> 3D 다이어리 포트폴리오 <span>✨</span>
            </h1>

            {viewMode === '3d' && (
              <p className="text-xl font-['Jua'] text-white flex items-center gap-4 mt-1 drop-shadow-md animate-fade-in">
                <span className="flex items-center gap-2"><RotateCw size={20} /> 드래그하여 회전, 휠로 확대/축소하세요</span>
              </p>
            )}
          </div>

          {/* Counter - Right aligned */}
          <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-6 py-3 rounded-[2rem] border border-white/10 shadow-xl flex items-center gap-3">
            <span className="font-['Jua'] text-4xl text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)]">
              {diaries.filter(d => !d.isPlaceholder).length}
            </span>
            <span className="font-['Jua'] text-xl text-white tracking-wide">AI 다이어리</span>
          </div>
        </div>
      </div>

      {/* --- 3D Canvas --- */}
      {/* --- 3D Canvas --- */}
      <div
        ref={containerRef}
        className={`absolute inset-0 z-1 cursor-grab active:cursor-grabbing transition-opacity duration-500 ${viewMode === '3d' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* --- 2D Memory Album --- */}
      {viewMode === 'album' && (
        <div className="absolute inset-0 z-20 animate-fade-in">
          <MemoryAlbum
            diaries={diaries}
            onSwitchView={setViewMode}
            onSelect={(diary: PortfolioDiary) => {
              setSelectedPhoto(diary);
              setCurrentImageIndex(0);
            }}
          />
        </div>
      )}

      {/* --- Detail Modal --- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => { setSelectedPhoto(null); setCurrentImageIndex(0); }}
        >
          <div
            className="relative max-w-6xl w-full bg-[#E8EAF6] rounded-3xl shadow-2xl p-2 transform rotate-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setSelectedPhoto(null); setCurrentImageIndex(0); }}
              className="absolute -top-5 -right-5 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 transition-colors z-50 border-4 border-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white rounded-[20px] overflow-hidden border-2 border-indigo-200 flex flex-col md:flex-row max-h-[85vh]">
              {/* Image */}
              <div className="flex-1 bg-gray-50 relative min-h-[300px] md:min-h-[500px] flex items-center justify-center p-4">
                <img
                  src={selectedPhoto.images && selectedPhoto.images.length > 0
                    ? selectedPhoto.images[currentImageIndex]?.imageUrl || selectedPhoto.src
                    : selectedPhoto.src || "/placeholder.svg"}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-full object-contain drop-shadow-md rounded-lg border-4 border-white bg-white"
                />
                {/* Navigation */}
                {selectedPhoto.images && selectedPhoto.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + selectedPhoto.images!.length) % selectedPhoto.images!.length);
                      }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % selectedPhoto.images!.length);
                      }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              {/* Content */}
              <div className="w-full md:w-[450px] bg-indigo-50 p-6 flex flex-col">
                <h2 className="text-2xl font-bold font-['Jua'] text-indigo-900 mb-2">{selectedPhoto.title}</h2>
                <div className="flex flex-wrap gap-2 text-base font-['Jua'] text-indigo-800 mb-4">
                  <span className="bg-white px-3 py-1 rounded-md shadow-sm">{selectedPhoto.date}</span>
                  <span className="bg-white px-3 py-1 rounded-md shadow-sm">{selectedPhoto.weather}</span>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-inner flex-grow overflow-y-auto custom-scrollbar h-full">
                  <p className="font-['Jua'] text-xl text-indigo-950 leading-loose whitespace-pre-wrap">
                    {selectedPhoto.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } 
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #C5CAE9; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9FA8DA; }
      `}</style>
    </div>
  )
}
