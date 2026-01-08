import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"
import { X, Calendar, MapPin, Heart, ChevronLeft, ChevronRight, RotateCw, ZoomIn } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import { getAiDiariesApi } from "@/features/diary/api/diary-api"
import { useAuth } from "@/features/auth/context/auth-context"

interface PortfolioDiary {
  id: number;
  src: string;
  title: string;
  date: string;
  location: string;
  content: string;
  likes: number;
  weather: string;
  images?: any[];
  isPlaceholder?: boolean;
  color?: string; // [NEW] - for card color
}

// --- Constants ---
const PAW_PALETTE = [
  '#FFC4C4', // Soft Strawberry Pink
  '#FFE8A1', // Custard Yellow
  '#B8E0BF', // Soft Sage Green
  '#D7C0AE', // Warm Beige/Latte
  '#FFD1DC', // Muted Rose
  '#ABC8E2', // Soft Sky Blue
  '#E6E6FA', // Lavender Mist
  '#F5F5DC', // Cream
  '#FFB7B2', // Soft Coral Pink
  '#C8E6C9', // Pale Mint
];

export default function PortfolioPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioDiary | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [diaries, setDiaries] = useState<PortfolioDiary[]>([])
  const { user, token } = useAuth()
  const navigate = useNavigate();

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

      // Main Pad
      ctx.beginPath();
      // Ellipse logic for main pad
      ctx.ellipse(256, 340, 70, 60, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Outer Toes
      ctx.beginPath(); ctx.arc(136, 220, 50, 0, 2 * Math.PI); ctx.fill(); // Left
      ctx.beginPath(); ctx.arc(376, 220, 50, 0, 2 * Math.PI); ctx.fill(); // Right

      // Inner Toes
      ctx.beginPath(); ctx.arc(196, 130, 45, 0, 2 * Math.PI); ctx.fill(); // Inner Left
      ctx.beginPath(); ctx.arc(316, 130, 45, 0, 2 * Math.PI); ctx.fill(); // Inner Right

      return canvas.toDataURL('image/png');
    }

    const fetchDiaries = async () => {
      const PLACEHOLDER_COUNT = 24;
      const placeholders: PortfolioDiary[] = Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => ({
        id: -1 * (i + 1),
        src: generatePlaceholderImage(i),
        title: "미래의 추억 🐾",
        date: "Coming Soon",
        location: "행복한 장소",
        content: "이곳에 당신과 반려동물의 소중한 추억이 채워질 거예요!",
        likes: 0,
        weather: "🌈",
        isPlaceholder: true,
        color: PAW_PALETTE[i % PAW_PALETTE.length] // Assign color
      }));

      if (!user?.id || !token) {
        setDiaries(placeholders);
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
              color: PAW_PALETTE[index % PAW_PALETTE.length] // Assign color cyclically
            }
          })

          const displayedDiaries = [...mapped];
          if (displayedDiaries.length < PLACEHOLDER_COUNT) {
            const startIdx = displayedDiaries.length;
            const remaining = PLACEHOLDER_COUNT - displayedDiaries.length;
            const newPlaceholders = Array.from({ length: remaining }).map((_, i) => ({
              ...placeholders[0],
              id: -1 * (startIdx + i + 1),
              src: generatePlaceholderImage(startIdx + i),
              isPlaceholder: true,
              color: PAW_PALETTE[(startIdx + i) % PAW_PALETTE.length]
            }));
            displayedDiaries.push(...newPlaceholders);
          }
          setDiaries(displayedDiaries)
        } else {
          setDiaries(placeholders);
        }
      } catch (e: any) {
        if (e.response && e.response.status === 401) navigate('/login');
        setDiaries(placeholders);
      }
    }
    fetchDiaries()
  }, [user, token, navigate])


  // --- Three.js Logic ---
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
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
        c: { value: 0.8 },
        p: { value: 2.5 },
        glowColor: { value: new THREE.Color(0x7C4DFF) }, // Deep Purple/Blueish Glow
        viewVector: { value: camera.position }
      },
      vertexShader: `
            uniform vec3 viewVector;
            uniform float c;
            uniform float p;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * viewVector );
                intensity = pow( c - dot(vNormal, vNormel), p );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
      fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                // Add a solid base color to center to make it look like a planet
                vec3 baseColor = vec3(0.05, 0.0, 0.1); 
                gl_FragColor = vec4( baseColor + glow, 0.8 ); 
            }
        `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);


    // --- The Sphere of Cards ---
    const group = new THREE.Group();
    group.add(coreSphere);
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

      coreSphere.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(camera.position, coreSphere.position);

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
      {/* --- Header (White) --- */}
      <div className="absolute top-0 left-0 right-0 z-10 p-8 flex flex-col items-center pointer-events-none">
        <div className="w-full flex justify-between items-start">
          {/* Empty div for spacing/layout balance if needed, or just let the title center naturally via absolute centering or flex logic. 
               The current layout has the title centered. Let's keep the title centered and put the counter on the right. 
               The original code had flex-col items-center. To place something on the right while keeping title centered, 
               we might need a different layout structure or absolute positioning for the counter.
           */}
          <div /> {/* Spacer */}

          {/* Title - Centered */}
          <div className="bg-black/30 backdrop-blur-md px-8 py-4 rounded-full shadow-lg border border-white/10 flex flex-col items-center gap-2 transform hover:scale-105 transition-transform pointer-events-auto cursor-help">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-['Jua'] flex items-center gap-2 drop-shadow-lg">
              <span>✨</span> 3D 다이어리 포트폴리오 <span>✨</span>
            </h1>
            <p className="text-sm font-['Gaegu'] text-gray-300 flex items-center gap-4">
              <span className="flex items-center gap-1"><RotateCw size={14} /> 드래그하여 회전, 휠로 확대/축소하세요</span>
            </p>
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
      <div ref={containerRef} className="absolute inset-0 z-1 cursor-grab active:cursor-grabbing" />

      {/* --- Detail Modal --- */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => { setSelectedPhoto(null); setCurrentImageIndex(0); }}
        >
          <div
            className="relative max-w-4xl w-full bg-[#E8EAF6] rounded-3xl shadow-2xl p-2 transform rotate-1"
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
              <div className="w-full md:w-80 bg-indigo-50 p-6 flex flex-col">
                <h2 className="text-2xl font-bold font-['Jua'] text-indigo-900 mb-2">{selectedPhoto.title}</h2>
                <div className="flex flex-wrap gap-2 text-sm font-['Gaegu'] text-indigo-800 mb-4">
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm">{selectedPhoto.date}</span>
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm">{selectedPhoto.weather}</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-inner flex-grow overflow-y-auto max-h-[250px] md:max-h-[400px] custom-scrollbar">
                  <p className="font-['Gaegu'] text-lg text-indigo-900 leading-relaxed whitespace-pre-wrap">
                    {selectedPhoto.content}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <div className="flex items-center gap-2 bg-indigo-200 px-4 py-2 rounded-full text-white font-bold">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{selectedPhoto.likes}</span>
                  </div>
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
