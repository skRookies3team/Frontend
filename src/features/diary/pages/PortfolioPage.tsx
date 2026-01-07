import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as THREE from "three"
import { X, Calendar, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/shared/ui/button"
import "@/shared/assets/styles/PortfolioPage.css"
import "./PortfolioPage.css"

// [REMOVED] Static diaryPhotos constant
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
  images?: any[]; // [NEW] Images array for carousel
  isPlaceholder?: boolean; // [FIX] Re-add flag
}

export default function PortfolioPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioDiary | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // [NEW] Real Data State
  const [diaries, setDiaries] = useState<PortfolioDiary[]>([])
  const { user, token } = useAuth() // [FIX] Get token
  const navigate = useNavigate();

  // [NEW] Fetch Diaries and fill with placeholders
  useEffect(() => {
    // [NEW] Helper to generate cute puppy Data URL
    const generatePlaceholderImage = (index: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) return "/placeholder.svg";

      // Tone-on-Tone Palettes (Light BG, Darker Outline)
      const palettes = [
        { bg: '#FFF0F5', icon: '#FFB6C1' }, // Pink
        { bg: '#F0F8FF', icon: '#87CEFA' }, // Alice Blue
        { bg: '#F5F5DC', icon: '#DAC680' }, // Beige
        { bg: '#E0FFFF', icon: '#48D1CC' }, // Cyan
        { bg: '#F0FFF0', icon: '#90EE90' }, // Honeydew
        { bg: '#E6E6FA', icon: '#9370DB' }, // Lavender
        { bg: '#FFFACD', icon: '#F4CA16' }, // Lemon
      ];
      const palette = palettes[index % palettes.length];

      // Background
      ctx.fillStyle = palette.bg;
      ctx.beginPath();
      ctx.rect(0, 0, 512, 640);
      ctx.fill();

      // Icon Style (Outline Monoline)
      const cx = 256;
      const cy = 320;
      const scale = 1.3;

      ctx.strokeStyle = palette.icon;
      ctx.lineWidth = 25;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Ears (Floppy Outline)
      ctx.beginPath();
      // Left Ear
      ctx.moveTo(cx - 50 * scale, cy - 60 * scale);
      ctx.bezierCurveTo(cx - 130 * scale, cy - 80 * scale, cx - 140 * scale, cy + 20 * scale, cx - 80 * scale, cy + 20 * scale);
      ctx.stroke();

      // Right Ear
      ctx.beginPath();
      ctx.moveTo(cx + 50 * scale, cy - 60 * scale);
      ctx.bezierCurveTo(cx + 130 * scale, cy - 80 * scale, cx + 140 * scale, cy + 20 * scale, cx + 80 * scale, cy + 20 * scale);
      ctx.stroke();

      // 2. Face Outline
      ctx.beginPath();
      ctx.arc(cx, cy + 30 * scale, 90 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Face Details
      ctx.fillStyle = palette.icon;

      // Eyes
      ctx.beginPath();
      ctx.arc(cx - 35 * scale, cy + 20 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 35 * scale, cy + 20 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.beginPath();
      const ny = cy + 50 * scale;
      ctx.moveTo(cx - 15 * scale, ny);
      ctx.quadraticCurveTo(cx, ny - 10 * scale, cx + 15 * scale, ny);
      ctx.quadraticCurveTo(cx, ny + 20 * scale, cx - 15 * scale, ny);
      ctx.fill();

      return canvas.toDataURL('image/png');
    }

    const fetchDiaries = async () => {
      // Default placeholders
      const PLACEHOLDER_COUNT = 15;
      const placeholders: PortfolioDiary[] = Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => ({
        id: -1 * (i + 1), // Negative IDs for placeholders
        src: generatePlaceholderImage(i), // [FIX] Generate Data URL directly for src
        title: "미래의 추억 🐾",
        date: "Coming Soon",
        location: "행복한 장소",
        content: "이곳에 당신과 반려동물의 소중한 추억이 채워질 거예요!",
        likes: 0,
        weather: "🌈",
        isPlaceholder: true // Mark as placeholder
      }));

      if (!user?.id || !token) { // [FIX] Wait for token
        setDiaries(placeholders);
        return;
      }

      try {
        const res = await getAiDiariesApi(Number(user.id))
        if (Array.isArray(res)) { // Allow empty array
          const mapped: PortfolioDiary[] = res.map((d: any) => {
            // Check multiple possible fields for images
            let firstImage = "/placeholder-diary.jpg";
            if (d.imageUrls && d.imageUrls.length > 0) firstImage = d.imageUrls[0];
            else if (d.images && d.images.length > 0) {
              if (typeof d.images[0] === 'string') firstImage = d.images[0];
              else if (d.images[0].imageUrl) firstImage = d.images[0].imageUrl;
            }

            // Use proxy in development, direct S3 URL in production
            if (firstImage.includes('petlog-images-bucket.s3.ap-northeast-2.amazonaws.com')) {
              // In development, use proxy to bypass CORS
              if (import.meta.env.DEV) {
                firstImage = firstImage.replace('https://petlog-images-bucket.s3.ap-northeast-2.amazonaws.com', '/s3-images');
              }
              // In production, S3 URLs work directly with proper CORS settings
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
              images: d.images || [], // [NEW] Include images array
              isPlaceholder: false
            }
          })

          // Merge: Real data first, then fill remaining slots with placeholders
          const displayedDiaries = [...mapped];
          if (displayedDiaries.length < PLACEHOLDER_COUNT) {
            const startIdx = displayedDiaries.length;
            const remaining = PLACEHOLDER_COUNT - displayedDiaries.length;
            const newPlaceholders = Array.from({ length: remaining }).map((_, i) => ({
              ...placeholders[0], // Copy base structure
              id: -1 * (startIdx + i + 1),
              src: generatePlaceholderImage(startIdx + i), // Unique color per index
              isPlaceholder: true
            }));
            displayedDiaries.push(...newPlaceholders);
          }

          setDiaries(displayedDiaries)
        } else {
          setDiaries(placeholders);
        }
      } catch (e: any) {
        console.error("Portfolio fetch failed", e)
        // [FIX] Handle 401 specifically
        if (e.response && e.response.status === 401) {
          // Token expired or invalid
          navigate('/login');
        }
        setDiaries(placeholders);
      }
    }
    fetchDiaries()
  }, [user, token]) // [FIX] Depend on token
  const containerRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLDivElement>(null)

  // Refs for Three.js objects to access them in cleanup/events without re-renders
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sphereMeshesRef = useRef<THREE.Mesh[]>([])
  const animationFrameRef = useRef<number | null>(null)

  // Interaction refs
  const mouseRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const rotationRef = useRef({ x: 0, y: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })

  // Animated stars background
  useEffect(() => {
    if (!starsRef.current) return

    const createStar = () => {
      const star = document.createElement('div')
      star.className = 'star'
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 3}s`
      star.style.animationDuration = `${2 + Math.random() * 3}s`
      return star
    }

    // Create 200 stars
    for (let i = 0; i < 200; i++) {
      starsRef.current.appendChild(createStar())
    }

    return () => {
      if (starsRef.current) {
        starsRef.current.innerHTML = ''
      }
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0520, 10, 70)
    sceneRef.current = scene

    // --- 2. Camera Setup ---
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.set(0, 0, 35)
    cameraRef.current = camera

    // --- 3. Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Clear container before appending to avoid duplicates
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // --- 4. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Space-themed colored lights
    const pointLight1 = new THREE.PointLight(0x4488ff, 3, 25)
    pointLight1.position.set(-10, 0, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff44ff, 3, 25)
    pointLight2.position.set(10, 0, -5)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0x44ffff, 2, 20)
    pointLight3.position.set(0, 10, 0)
    scene.add(pointLight3)

    // --- 5. Objects (Golden Spiral) ---
    const radius = 8
    const sphereMeshes: THREE.Mesh[] = []
    const textureLoader = new THREE.TextureLoader()
    textureLoader.crossOrigin = 'anonymous'; // [FIX] Allow CORS for S3 images

    // [MODIFIED] Use dynamic 'diaries' instead of static 'diaryPhotos'
    // If empty, maybe show nothing or wait? For now if empty, it just renders nothing but scene setup works.
    diaries.forEach((photo, index) => {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / diaries.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      // [FIX] Load standard texture (Data URL works here too)
      const texture = textureLoader.load(photo.src || "/placeholder.svg");

      const geometry = new THREE.PlaneGeometry(2, 2.5)
      const material = new THREE.MeshBasicMaterial({
        map: texture || undefined, // Fallback
        side: THREE.DoubleSide,
        transparent: true,
        opacity: photo.isPlaceholder ? 0.95 : 1.0, // More solid for card look
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      mesh.lookAt(0, 0, 0)
      mesh.userData = { photo, index }

      scene.add(mesh)
      sphereMeshes.push(mesh)
    })
    sphereMeshesRef.current = sphereMeshes

    // --- 6. Interaction & Animation ---
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const animate = () => {
      // Smooth rotation
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.05
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.05

      // Rotate meshes
      sphereMeshes.forEach((mesh, i) => {
        const time = Date.now() * 0.0001
        mesh.rotation.z = Math.sin(time + i) * 0.05

        const angle = rotationRef.current.y
        const angleX = rotationRef.current.x


        const phi = Math.acos(1 - (2 * (i + 0.5)) / diaries.length)
        const theta = Math.PI * (1 + Math.sqrt(5)) * i

        let x = radius * Math.sin(phi) * Math.cos(theta + angle)
        let y = radius * Math.sin(phi) * Math.sin(theta + angle)
        let z = radius * Math.cos(phi)

        // Apply X rotation
        const y2 = y * Math.cos(angleX) - z * Math.sin(angleX)
        const z2 = y * Math.sin(angleX) + z * Math.cos(angleX)

        mesh.position.set(x, y2, z2)
        mesh.lookAt(0, 0, 0)
      })

      // Animate lights in cosmic pattern
      const lightTime = Date.now() * 0.0003
      pointLight1.position.x = Math.cos(lightTime) * 12
      pointLight1.position.z = Math.sin(lightTime) * 12
      pointLight2.position.x = Math.cos(lightTime + Math.PI) * 12
      pointLight2.position.z = Math.sin(lightTime + Math.PI) * 12
      pointLight3.position.y = Math.sin(lightTime * 0.5) * 8 + 5

      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    // --- 7. Event Handlers ---
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - mouseRef.current.x
        const deltaY = e.clientY - mouseRef.current.y

        targetRotationRef.current.y += deltaX * 0.005
        targetRotationRef.current.x += deltaY * 0.005
        targetRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationRef.current.x))

        mouseRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleClick = (e: MouseEvent) => {
      if (isDraggingRef.current) return

      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(sphereMeshes)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh
        setSelectedPhoto(clickedMesh.userData.photo)
        setCurrentImageIndex(0) // [NEW] Reset image index
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z += e.deltaY * 0.01
      camera.position.z = Math.max(15, Math.min(50, camera.position.z))
    }

    // --- 8. Resize Logic ---
    const updateSize = () => {
      if (!containerRef.current || !camera || !renderer) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      if (width === 0 || height === 0) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
    })
    resizeObserver.observe(containerRef.current)

    window.addEventListener('resize', updateSize)

    // Attach listeners
    const canvas = renderer.domElement
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    // --- 9. Cleanup ---
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSize)

      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('wheel', handleWheel)

      sphereMeshes.forEach(mesh => {
        mesh.geometry.dispose()
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose()
        }
      })

      renderer.dispose()
      if (containerRef.current && containerRef.current.contains(canvas)) {
        containerRef.current.removeChild(canvas)
      }
    }
  }, [diaries])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Space background with stars */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0520] via-[#1a0f3e] to-[#0a0520]">
        {/* Animated stars layer */}
        <div ref={starsRef} className="absolute inset-0" />

        {/* Cosmic nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            3D 다이어리 포트폴리오
          </h1>
          <p className="text-white/70 text-lg font-light">
            드래그하여 회전, 휠로 확대/축소하세요
          </p>
        </div>
      </div>

      {/* Three.js 캔버스 컨테이너 */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ zIndex: 1 }}
      />

      {/* 카운터 */}
      <div className="absolute top-8 right-8 z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-3 shadow-2xl pointer-events-none">
        <p className="text-white/80 text-sm font-medium">
          <span className="text-2xl font-bold text-cyan-300">{diaries.length}</span>
          <span className="ml-2">AI 다이어리</span>
        </p>
      </div>

      {/* 안내 */}
      <div className="absolute bottom-25 right-30 z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-2xl pointer-events-none">
        <p className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="text-2xl">🖱️</span>
          <span>드래그: 회전 | 휠: 확대/축소 | 클릭: 상세보기</span>
        </p>
      </div>

      {/* 상세보기 모달 */}
      {
        selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedPhoto(null)
              setCurrentImageIndex(0)
            }}
          >
            <div
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-14 right-0 text-white hover:bg-white/10 rounded-full w-12 h-12 backdrop-blur-xl border border-white/20"
                onClick={() => {
                  setSelectedPhoto(null)
                  setCurrentImageIndex(0)
                }}
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl" style={{ zIndex: -10 }} />

                  <img
                    src={selectedPhoto.images && selectedPhoto.images.length > 0
                      ? selectedPhoto.images[currentImageIndex]?.imageUrl || selectedPhoto.src
                      : selectedPhoto.src || "/placeholder.svg"}
                    alt={selectedPhoto.title}
                    className="w-full h-auto max-h-[50vh] object-contain"
                  />

                  {/* Image Carousel Navigation */}
                  {selectedPhoto.images && selectedPhoto.images.length > 1 && (
                    <>
                      <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors z-20"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex((prev) => (prev - 1 + selectedPhoto.images!.length) % selectedPhoto.images!.length)
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors z-20"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex((prev) => (prev + 1) % selectedPhoto.images!.length)
                        }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Dot Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {selectedPhoto.images.map((_: any, index: number) => (
                          <button
                            key={index}
                            className={`h-2.5 w-2.5 rounded-full transition-all ${index === currentImageIndex
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/80'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-8 bg-gradient-to-b from-transparent to-black/30 space-y-4">
                  <h3 className="text-3xl font-bold text-white mb-3">
                    {selectedPhoto.title}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <span>{selectedPhoto.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span>{selectedPhoto.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedPhoto.weather}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 fill-pink-400 text-pink-400" />
                      <span className="font-semibold">{selectedPhoto.likes}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white/90 text-lg leading-relaxed">
                      {selectedPhoto.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}
