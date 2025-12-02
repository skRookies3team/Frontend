import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { X, Calendar, MapPin, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import "./PortfolioPage.css"

const diaryPhotos = [
  {
    id: 1,
    src: "/golden-retriever-playing-park.jpg",
    title: "공원에서의 행복한 하루",
    date: "2024년 1월 15일",
    location: "서울숲 공원",
    content: "오늘은 정말 완벽한 날이었어요! 공원에 도착하자마자 찰리는 기쁨을 참을 수 없었답니다. 새로운 친구들을 여럿 만났고, 잔디밭을 뛰어다니며 몇 시간을 보냈어요.",
    likes: 142,
    weather: "맑음 ☀️"
  },
  {
    id: 2,
    src: "/dog-running-grass.jpg",
    title: "신나는 잔디 달리기",
    date: "2024년 1월 18일",
    location: "한강 공원",
    content: "잔디밭을 마음껏 달리는 찰리의 모습이 정말 행복해 보였어요. 귀가 펄럭이고 꼬리를 흔들며 즐거워하는 모습에 저도 덩달아 기분이 좋아졌답니다.",
    likes: 98,
    weather: "구름 조금 ⛅"
  },
  {
    id: 3,
    src: "/corgi.jpg",
    title: "귀여운 코기의 산책",
    date: "2024년 1월 22일",
    location: "동네 산책로",
    content: "짧은 다리로 열심히 걷는 모습이 너무 사랑스러워요. 오늘은 동네를 천천히 산책하며 여유로운 시간을 보냈답니다.",
    likes: 215,
    weather: "맑음 ☀️"
  },
  {
    id: 4,
    src: "/golden-retriever.png",
    title: "햇살 아래에서",
    date: "2024년 1월 25일",
    location: "집 앞마당",
    content: "따뜻한 햇살을 받으며 낮잠 자는 우리 아이. 평화로운 오후의 한 순간을 카메라에 담았어요. 이런 소소한 일상이 참 행복합니다.",
    likes: 187,
    weather: "맑음 ☀️"
  },
  {
    id: 5,
    src: "/dachshund-dog.png",
    title: "닥스훈트의 장난기",
    date: "2024년 1월 28일",
    location: "우리집 거실",
    content: "장난감을 물고 이리저리 뛰어다니는 모습이 정말 귀여워요. 긴 몸통과 짧은 다리로 열심히 노는 모습에 웃음이 절로 나왔답니다.",
    likes: 156,
    weather: "흐림 ☁️"
  },
  {
    id: 6,
    src: "/tabby-cat-sunbeam.png",
    title: "고양이의 낮잠 시간",
    date: "2024년 2월 1일",
    location: "집 창가",
    content: "햇살이 드는 창가에서 평화롭게 잠든 나비. 고양이들은 정말 낮잠의 달인이에요.",
    likes: 203,
    weather: "맑음 ☀️"
  },
  {
    id: 7,
    src: "/cat-in-box.jpg",
    title: "상자 속 고양이",
    date: "2024년 2월 5일",
    location: "우리집",
    content: "새 상자를 발견한 나비가 기뻐하며 들어가 앉았어요. 고양이는 역시 상자를 사랑하죠!",
    likes: 178,
    weather: "흐림 ☁️"
  },
  {
    id: 8,
    src: "/golden-retriever-playing-park.jpg",
    title: "물놀이하는 날",
    date: "2024년 2월 10일",
    location: "애견 수영장",
    content: "처음으로 수영장에 갔는데 찰리가 물을 정말 좋아하네요. 신나게 헤엄치는 모습이 사랑스러웠어요.",
    likes: 245,
    weather: "맑음 ☀️"
  },
  {
    id: 9,
    src: "/dog-running-grass.jpg",
    title: "아침 산책길",
    date: "2024년 2월 14일",
    location: "올림픽 공원",
    content: "이른 아침 산책은 언제나 상쾌해요. 공기도 좋고 사람도 적어서 찰리가 더 즐거워합니다.",
    likes: 132,
    weather: "구름 조금 ⛅"
  },
  {
    id: 10,
    src: "/corgi.jpg",
    title: "친구와의 만남",
    date: "2024년 2월 18일",
    location: "강아지 카페",
    content: "오늘은 친구네 강아지와 함께 카페에 갔어요. 두 친구가 서로 장난치며 노는 모습이 너무 귀여웠답니다.",
    likes: 167,
    weather: "맑음 ☀️"
  },
  {
    id: 11,
    src: "/golden-retriever.png",
    title: "생일 파티",
    date: "2024년 2월 22일",
    location: "우리집",
    content: "찰리의 생일을 축하하며 케이크도 준비했어요. 행복한 표정으로 생일 모자를 쓴 모습이 정말 사랑스러워요.",
    likes: 289,
    weather: "맑음 ☀️"
  },
  {
    id: 12,
    src: "/dachshund-dog.png",
    title: "새로운 장난감",
    date: "2024년 2월 25일",
    location: "우리집 거실",
    content: "새 장난감을 선물 받고 하루종일 물고 다녔어요. 정말 마음에 들었나봐요!",
    likes: 145,
    weather: "비 🌧️"
  },
  {
    id: 13,
    src: "/tabby-cat-sunbeam.png",
    title: "창밖 구경",
    date: "2024년 3월 1일",
    location: "집 창가",
    content: "창밖을 바라보며 새들을 관찰하는 나비. 꼬리를 살랑살랑 흔들며 집중하는 모습이 귀여워요.",
    likes: 198,
    weather: "맑음 ☀️"
  },
  {
    id: 14,
    src: "/cat-in-box.jpg",
    title: "숨바꼭질 놀이",
    date: "2024년 3월 5일",
    location: "우리집",
    content: "상자 속에 숨어서 저를 놀라게 하려는 나비. 장난꾸러기 같으니라고!",
    likes: 176,
    weather: "구름 조금 ⛅"
  },
  {
    id: 15,
    src: "/golden-retriever-playing-park.jpg",
    title: "봄날의 소풍",
    date: "2024년 3월 10일",
    location: "북한산 등산로 입구",
    content: "날씨가 따뜻해져서 처음으로 등산로를 걸어봤어요. 찰리도 저도 행복한 하루였답니다.",
    likes: 223,
    weather: "맑음 ☀️"
  },
]

export default function PortfolioPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof diaryPhotos[0] | null>(null)
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

    diaryPhotos.forEach((photo, index) => {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / diaryPhotos.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      const texture = textureLoader.load(photo.src || "/placeholder.svg")
      const geometry = new THREE.PlaneGeometry(2, 2.5)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
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

        const phi = Math.acos(1 - (2 * (i + 0.5)) / diaryPhotos.length)
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
  }, [])

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
          <span className="text-2xl font-bold text-cyan-300">{diaryPhotos.length}</span>
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
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-14 right-0 text-white hover:bg-white/10 rounded-full w-12 h-12 backdrop-blur-xl border border-white/20"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl" style={{ zIndex: -10 }} />

                  <img
                    src={selectedPhoto.src || "/placeholder.svg"}
                    alt={selectedPhoto.title}
                    className="w-full h-auto max-h-[50vh] object-contain"
                  />
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
