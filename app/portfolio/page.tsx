"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { X, Calendar, MapPin, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"

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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sphereMeshesRef = useRef<THREE.Mesh[]>([])
  const animationFrameRef = useRef<number>()
  
  const mouseRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const rotationRef = useRef({ x: 0, y: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50)
    sceneRef.current = scene

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 15
    cameraRef.current = camera

    // 렌더러 설정
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(window.innerWidth, window.innerHeight - 64)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0xff6b9d, 2, 20)
    pointLight1.position.set(-10, 0, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xc084fc, 2, 20)
    pointLight2.position.set(10, 0, -5)
    scene.add(pointLight2)

    // 골든 스파이럴 분포로 카드 배치
    const radius = 8
    const sphereMeshes: THREE.Mesh[] = []

    diaryPhotos.forEach((photo, index) => {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / diaryPhotos.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      // 텍스처 로더
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load(photo.src || "/placeholder.svg")

      // 카드 평면 생성
      const geometry = new THREE.PlaneGeometry(2, 2.5)
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        emissive: 0xff6b9d,
        emissiveIntensity: 0.1,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      mesh.lookAt(0, 0, 0)
      mesh.userData = { photo, index }

      scene.add(mesh)
      sphereMeshes.push(mesh)
    })

    sphereMeshesRef.current = sphereMeshes

    // 레이캐스터 설정 (클릭 감지용)
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // 애니메이션 루프
    const animate = () => {
      // 부드러운 회전 적용
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.05
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.05

      // 모든 카드 회전
      sphereMeshes.forEach((mesh, i) => {
        const time = Date.now() * 0.0001
        mesh.rotation.z = Math.sin(time + i) * 0.05
        
        // 전체 구 회전
        const angle = rotationRef.current.y
        const angleX = rotationRef.current.x
        
        const phi = Math.acos(1 - (2 * (i + 0.5)) / diaryPhotos.length)
        const theta = Math.PI * (1 + Math.sqrt(5)) * i

        let x = radius * Math.sin(phi) * Math.cos(theta + angle)
        let y = radius * Math.sin(phi) * Math.sin(theta + angle)
        let z = radius * Math.cos(phi)

        // X축 회전 적용
        const y2 = y * Math.cos(angleX) - z * Math.sin(angleX)
        const z2 = y * Math.sin(angleX) + z * Math.cos(angleX)

        mesh.position.set(x, y2, z2)
        mesh.lookAt(0, 0, 0)
      })

      // 조명 회전
      const lightTime = Date.now() * 0.0005
      pointLight1.position.x = Math.cos(lightTime) * 10
      pointLight1.position.z = Math.sin(lightTime) * 10
      pointLight2.position.x = Math.cos(lightTime + Math.PI) * 10
      pointLight2.position.z = Math.sin(lightTime + Math.PI) * 10

      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // 이벤트 핸들러
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

        // X축 회전 제한
        targetRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationRef.current.x))

        mouseRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleClick = (e: MouseEvent) => {
      if (isDraggingRef.current) return

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

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
      camera.position.z = Math.max(10, Math.min(30, camera.position.z))
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / (window.innerHeight - 64)
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight - 64)
    }

    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('click', handleClick)
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', handleResize)

    // 클린업
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('click', handleClick)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)
      
      sphereMeshes.forEach(mesh => {
        mesh.geometry.dispose()
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose()
        }
      })
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-slate-950 via-pink-950/30 to-rose-950/30 overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* 헤더 */}
      <div className="absolute top-8 left-8 z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl px-8 py-6 shadow-2xl pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent mb-2">
          AI 다이어리 갤러리
        </h1>
        <p className="text-white/70 text-lg font-light">
          드래그하여 회전, 휠로 확대/축소하세요
        </p>
      </div>

      {/* Three.js 캔버스 */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 카운터 */}
      <div className="absolute top-8 right-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-3 shadow-2xl pointer-events-none">
        <p className="text-white/80 text-sm font-medium">
          <span className="text-2xl font-bold text-pink-300">{diaryPhotos.length}</span>
          <span className="ml-2">AI 다이어리</span>
        </p>
      </div>

      {/* 안내 */}
      <div className="absolute bottom-8 right-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4 shadow-2xl pointer-events-none">
        <p className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="text-2xl">🖱️</span>
          <span>드래그: 회전 | 휠: 확대/축소 | 클릭: 상세보기</span>
        </p>
      </div>

      {/* 상세보기 모달 */}
      {selectedPhoto && (
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
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-rose-500/30 to-purple-500/30 blur-3xl" style={{ zIndex: -10 }} />
                
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
                    <Calendar className="w-5 h-5 text-pink-400" />
                    <span>{selectedPhoto.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-400" />
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
      )}
    </div>
  )
}
