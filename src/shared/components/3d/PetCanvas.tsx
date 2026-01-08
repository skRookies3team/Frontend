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
    modelUrl?: string  // ⭐ Meshy AI 생성 3D 모델 URL (없으면 기본 dog.glb 사용)
}

// 3D 강아지 모델 (동적 URL 지원)
function DogModel({ modelUrl = '/dog.glb' }: { modelUrl?: string }) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(modelUrl)
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
                group.current.position.y = Math.sin(time * 10) * 0.03
            } else {
                isWalking.current = false
                idleTimer.current = time
                group.current.position.y = 0
            }
        } else {
            group.current.position.y = Math.sin(time * 2) * 0.015

            if (time - idleTimer.current > 2 + Math.random() * 3) {
                walkTarget.current.set((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 2)
                isWalking.current = true
            }
        }
    })

    return (
        <group ref={group} position={[0, 0, 0]}>
            <primitive object={scene} scale={1} />
        </group>
    )
}

// 말풍선
function SpeechBubble({ text, show, isTyping }: { text: string; show: boolean; isTyping: boolean }) {
    return (
        <Html position={[0, 2.5, 0]} center distanceFactor={5} style={{ pointerEvents: 'none' }}>
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

function Scene({ speechText, showSpeech, isTyping, modelUrl }: PetCanvasProps) {
    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="park" background blur={0.6} />
            <group position={[0, -1, 0]}>
                <Suspense fallback={null}>
                    <DogModel modelUrl={modelUrl} />
                </Suspense>
                <SpeechBubble text={speechText} show={showSpeech} isTyping={isTyping} />
            </group>
            <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} />
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-200 via-green-100 to-amber-100">
                <div className="text-6xl animate-bounce">🐕</div>
            </div>
        )
    }

    return (
        <div className="absolute inset-0">
            <Canvas
                shadows
                camera={{ position: [0, 3, 6], fov: 50 }}
                style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98, #F0E68C)' }}
            >
                <Scene speechText={speechText} showSpeech={showSpeech} isTyping={isTyping} modelUrl={modelUrl} />
            </Canvas>
        </div>
    )
}

useGLTF.preload('/dog.glb')
