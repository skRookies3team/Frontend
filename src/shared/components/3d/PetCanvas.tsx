import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    useGLTF,
    useAnimations
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

interface PetCanvasProps {
    speechText: string
    showSpeech: boolean
    isTyping: boolean
    modelUrl?: string | null  // ⭐ Meshy AI 생성 3D 모델 URL (없으면 기본 dog.glb 사용)
}

// ⭐ 3D 모델 로딩 fallback 컴포넌트
function LoadingFallback() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2 p-4">
                <div className="text-4xl animate-bounce">🐕</div>
                <p className="text-white/80 text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
                    3D 모델 로딩 중...
                </p>
            </div>
        </Html>
    )
}

// ⭐ 외부 URL용 3D 모델 컴포넌트 (에러 핸들링 포함)
function ExternalDogModel({ modelUrl, onError }: { modelUrl: string; onError: () => void }) {
    const group = useRef<THREE.Group>(null)
    
    // useGLTF with crossOrigin support
    const { scene, animations } = useGLTF(modelUrl, true) // true = useDraco
    const { actions, names } = useAnimations(animations, group)

    const isWalking = useRef(false)
    const walkTarget = useRef(new THREE.Vector3(0, 0, 0))
    const idleTimer = useRef(0)

    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [scene])

    useEffect(() => {
        if (names.length > 0 && actions) {
            const firstAction = actions[names[0]]
            if (firstAction) {
                firstAction.reset().play()
            }
        }
    }, [actions, names])

    useFrame((state, delta) => {
        if (!group.current) return

        const time = state.clock.elapsedTime

        if (isWalking.current) {
            const currentPos = group.current.position
            const direction = new THREE.Vector3()
            direction.subVectors(walkTarget.current, currentPos)
            direction.y = 0

            if (direction.length() > 0.1) {
                direction.normalize()
                currentPos.x += direction.x * delta * 2
                currentPos.z += direction.z * delta * 2

                const targetAngle = Math.atan2(direction.x, direction.z)
                group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetAngle, delta * 5)
                group.current.position.y = 1.0 + Math.sin(time * 10) * 0.03
            } else {
                isWalking.current = false
                idleTimer.current = time
                group.current.position.y = 1.0
            }
        } else {
            group.current.position.y = 1.0 + Math.sin(time * 2) * 0.015

            if (time - idleTimer.current > 2 + Math.random() * 3) {
                walkTarget.current.set((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 2)
                isWalking.current = true
            }
        }
    })

    return (
        <group ref={group} position={[0, 1.0, 0]}>
            <primitive object={scene} scale={1} />
        </group>
    )
}

// ⭐ 기본 로컬 3D 강아지 모델
function LocalDogModel() {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF('/dog.glb')
    const { actions, names } = useAnimations(animations, group)

    const isWalking = useRef(false)
    const walkTarget = useRef(new THREE.Vector3(0, 0, 0))
    const idleTimer = useRef(0)

    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [scene])

    useEffect(() => {
        if (names.length > 0 && actions) {
            const firstAction = actions[names[0]]
            if (firstAction) {
                firstAction.reset().play()
            }
        }
    }, [actions, names])

    useFrame((state, delta) => {
        if (!group.current) return

        const time = state.clock.elapsedTime

        if (isWalking.current) {
            const currentPos = group.current.position
            const direction = new THREE.Vector3()
            direction.subVectors(walkTarget.current, currentPos)
            direction.y = 0

            if (direction.length() > 0.1) {
                direction.normalize()
                currentPos.x += direction.x * delta * 2
                currentPos.z += direction.z * delta * 2

                const targetAngle = Math.atan2(direction.x, direction.z)
                group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetAngle, delta * 5)
                group.current.position.y = 1.0 + Math.sin(time * 10) * 0.03
            } else {
                isWalking.current = false
                idleTimer.current = time
                group.current.position.y = 1.0
            }
        } else {
            group.current.position.y = 1.0 + Math.sin(time * 2) * 0.015

            if (time - idleTimer.current > 2 + Math.random() * 3) {
                walkTarget.current.set((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 2)
                isWalking.current = true
            }
        }
    })

    return (
        <group ref={group} position={[0, 1.0, 0]}>
            <primitive object={scene} scale={1} />
        </group>
    )
}

// ⭐ 모델 로더 - 외부 URL 실패 시 로컬 모델로 폴백
function DogModelLoader({ modelUrl }: { modelUrl?: string | null }) {
    const [useLocalModel, setUseLocalModel] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // 외부 URL이 없거나 로드 실패 시 로컬 모델 사용
    const shouldUseExternal = modelUrl && !useLocalModel && modelUrl.startsWith('http')

    useEffect(() => {
        // 외부 URL이 있으면 preload 시도
        if (modelUrl && modelUrl.startsWith('http')) {
            setIsLoading(true)
            setUseLocalModel(false)
            
            // 10초 타임아웃 후 로컬 모델로 폴백
            const timeout = setTimeout(() => {
                console.warn('External model load timeout, falling back to local model')
                setUseLocalModel(true)
                setIsLoading(false)
            }, 10000)

            // GLB 파일을 fetch로 먼저 확인
            fetch(modelUrl, { mode: 'cors' })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to fetch model')
                    clearTimeout(timeout)
                    setIsLoading(false)
                })
                .catch(err => {
                    console.error('External model load failed:', err)
                    clearTimeout(timeout)
                    setUseLocalModel(true)
                    setIsLoading(false)
                })

            return () => clearTimeout(timeout)
        } else {
            setUseLocalModel(true)
            setIsLoading(false)
        }
    }, [modelUrl])

    if (isLoading) {
        return <LoadingFallback />
    }

    if (shouldUseExternal && modelUrl) {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <ExternalDogModel 
                    modelUrl={modelUrl} 
                    onError={() => setUseLocalModel(true)} 
                />
            </Suspense>
        )
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <LocalDogModel />
        </Suspense>
    )
}

// 말풍선
function SpeechBubble({ text, show, isTyping }: { text: string; show: boolean; isTyping: boolean }) {
    return (
        <Html position={[0, 1.7, 0]} center distanceFactor={5} style={{ pointerEvents: 'none' }}>
            <AnimatePresence>
                {(show || isTyping) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-pink-100 min-w-[200px] max-w-[300px]">
                            {isTyping ? (
                                <div className="flex gap-1.5 justify-center py-1">
                                    <div className="h-3 w-3 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: '0ms' }} />
                                    <div className="h-3 w-3 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: '150ms' }} />
                                    <div className="h-3 w-3 animate-bounce rounded-full bg-pink-500" style={{ animationDelay: '300ms' }} />
                                </div>
                            ) : (
                                <p className="text-gray-800 text-center font-medium">{text}</p>
                            )}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95" />
                    </motion.div>
                )}
            </AnimatePresence>
        </Html>
    )
}

// ⭐ 날아다니는 나비 컴포넌트
function Butterfly({ initialPosition, color, speed }: { 
    initialPosition: [number, number, number]; 
    color: string;
    speed: number;
}) {
    const ref = useRef<THREE.Group>(null)
    const offset = useRef(Math.random() * Math.PI * 2)
    
    useFrame((state) => {
        if (!ref.current) return
        const time = state.clock.elapsedTime * speed
        
        // 나비가 원형 + 상하로 움직이는 패턴
        ref.current.position.x = initialPosition[0] + Math.sin(time + offset.current) * 2
        ref.current.position.y = initialPosition[1] + Math.sin(time * 2) * 0.5 + Math.cos(time * 0.5) * 0.3
        ref.current.position.z = initialPosition[2] + Math.cos(time + offset.current) * 1.5
        
        // 이동 방향을 향해 회전
        ref.current.rotation.y = Math.atan2(
            Math.cos(time + offset.current) * 2,
            -Math.sin(time + offset.current) * 1.5
        )
        
        // 날개 펄럭이는 효과 (Y축 스케일로 표현)
        const wingFlap = Math.sin(time * 15) * 0.3 + 0.7
        ref.current.scale.set(1, wingFlap, 1)
    })
    
    return (
        <group ref={ref} position={initialPosition}>
            {/* 나비 몸통 */}
            <mesh>
                <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
                <meshStandardMaterial color="#2d1b0e" />
            </mesh>
            {/* 왼쪽 날개 */}
            <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
                <planeGeometry args={[0.12, 0.08]} />
                <meshStandardMaterial 
                    color={color} 
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.9}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
            {/* 오른쪽 날개 */}
            <mesh position={[0.06, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <planeGeometry args={[0.12, 0.08]} />
                <meshStandardMaterial 
                    color={color} 
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.9}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    )
}

// ⭐ 나비 여러 마리 생성
function Butterflies() {
    const butterflies = [
        { position: [1.5, 1.2, -1] as [number, number, number], color: '#ff69b4', speed: 0.6 },
        { position: [-1.8, 1.5, 0.5] as [number, number, number], color: '#ffd700', speed: 0.5 },
        { position: [0, 1.8, -2] as [number, number, number], color: '#87ceeb', speed: 0.7 },
        { position: [-0.5, 1.0, 1] as [number, number, number], color: '#ffb6c1', speed: 0.55 },
        { position: [2, 1.3, 1] as [number, number, number], color: '#dda0dd', speed: 0.65 },
    ]
    
    return (
        <>
            {butterflies.map((b, i) => (
                <Butterfly key={i} initialPosition={b.position} color={b.color} speed={b.speed} />
            ))}
        </>
    )
}

// ⭐ 단일 풀잎 컴포넌트
function GrassBlade({ position, height, color }: { 
    position: [number, number, number]; 
    height: number;
    color: string;
}) {
    const ref = useRef<THREE.Mesh>(null)
    const offset = useRef(Math.random() * Math.PI * 2)
    
    useFrame((state) => {
        if (!ref.current) return
        // 바람에 흔들리는 효과
        const time = state.clock.elapsedTime
        ref.current.rotation.z = Math.sin(time * 1.5 + offset.current) * 0.15
        ref.current.rotation.x = Math.sin(time * 1.2 + offset.current * 0.5) * 0.08
    })
    
    return (
        <mesh ref={ref} position={position} rotation={[0, Math.random() * Math.PI * 2, 0]}>
            <coneGeometry args={[0.02, height, 4]} />
            <meshStandardMaterial 
                color={color} 
                roughness={0.8}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

// ⭐ 풀밭 (여러 풀잎들)
function GrassField() {
    const grassBlades = useRef<Array<{
        position: [number, number, number];
        height: number;
        color: string;
    }>>([])
    
    // 풀잎 생성 (처음 한 번만)
    if (grassBlades.current.length === 0) {
        const grassColors = ['#2d5a27', '#3d7a37', '#4a8a4a', '#5a9a5a', '#4a7c3a']
        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * 12
            const z = (Math.random() - 0.5) * 8
            // 중앙 근처는 풀을 적게 배치 (동물이 있는 곳)
            if (Math.abs(x) < 1.5 && Math.abs(z) < 1.5) continue
            
            grassBlades.current.push({
                position: [x, 0, z],
                height: 0.15 + Math.random() * 0.2,
                color: grassColors[Math.floor(Math.random() * grassColors.length)]
            })
        }
    }
    
    return (
        <>
            {grassBlades.current.map((blade, i) => (
                <GrassBlade 
                    key={i} 
                    position={blade.position} 
                    height={blade.height}
                    color={blade.color}
                />
            ))}
        </>
    )
}

// ⭐ 리얼리스틱한 잔디 바닥 평면
function GrassPlane() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial 
                color="#3a6b2a"  // 더 진한 자연스러운 잔디 녹색
                roughness={0.95}
                metalness={0}
            />
        </mesh>
    )
}

function Scene({ speechText, showSpeech, isTyping, modelUrl }: PetCanvasProps) {
    return (
        <>
            {/* ⭐ 자연광 설정 - 야외 공원 느낌 */}
            <ambientLight intensity={0.7} color="#fff5e6" />
            <directionalLight 
                position={[10, 20, 10]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                color="#fffaf0"
            />
            {/* 보조 조명 - 그림자가 너무 어둡지 않게 */}
            <hemisphereLight intensity={0.6} groundColor="#5a9a5a" color="#ffecd2" />
            
            {/* ⭐ 따뜻한 느낌의 환경 (sunset) */}
            <Environment preset="sunset" background blur={0.6} />
            
            {/* ⭐ 날아다니는 나비들 */}
            <Butterflies />
            
            {/* 잔디 바닥 + 풀밭 + 펫 (⭐ 위치를 올려서 다리가 잘리지 않게) */}
            <group position={[0, -0.3, 0]}>
                <GrassPlane />
                <GrassField />
                <DogModelLoader modelUrl={modelUrl} />
                <SpeechBubble text={speechText} show={showSpeech} isTyping={isTyping} />
            </group>
            
            {/* ⭐ 리얼리스틱한 접촉 그림자 */}
            <ContactShadows 
                position={[0, -0.29, 0]} 
                opacity={0.5} 
                scale={15} 
                blur={2.5} 
                far={5}
                color="#2d5a27"
            />
            
            <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                minPolarAngle={Math.PI / 6} 
                maxPolarAngle={Math.PI / 2.2}
                minAzimuthAngle={-Math.PI / 4}
                maxAzimuthAngle={Math.PI / 4}
            />
        </>
    )
}

export default function PetCanvas({ speechText, showSpeech, isTyping, modelUrl }: PetCanvasProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-200 via-orange-100 to-green-300">
                <div className="text-6xl animate-bounce">🐕</div>
            </div>
        )
    }

    return (
        <div className="absolute inset-0">
            <Canvas
                shadows
                camera={{ position: [0, 2, 6], fov: 40 }}
                gl={{ antialias: true, alpha: false }}
            >
                {/* ⭐ 따뜻한 피치/오렌지 톤 배경 (레퍼런스 이미지 스타일) */}
                <color attach="background" args={['#f5d0b0']} />
                <fog attach="fog" args={['#f5d0b0', 20, 60]} />
                <Scene speechText={speechText} showSpeech={showSpeech} isTyping={isTyping} modelUrl={modelUrl} />
            </Canvas>
        </div>
    )
}

useGLTF.preload('/dog.glb')
