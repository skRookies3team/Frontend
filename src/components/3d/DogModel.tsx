import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DogModel() {
    const group = useRef<THREE.Group>(null)

    // 부드러운 움직임 애니메이션
    useFrame((state) => {
        if (group.current) {
            // 살짝 위아래로 움직이는 효과 (숨쉬는 듯한 느낌)
            group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02
            // 살짝 좌우로 흔들리는 효과
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
        }
    })

    // 기본 강아지 모델 (간단한 geometry로 표현)
    return (
        <group ref={group}>
            {/* 몸통 */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>

            {/* 머리 */}
            <mesh position={[0, 1.1, 0.4]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>

            {/* 코 */}
            <mesh position={[0, 1.0, 0.7]} castShadow>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#3d3d3d" />
            </mesh>

            {/* 왼쪽 눈 */}
            <mesh position={[-0.12, 1.15, 0.65]} castShadow>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#2d2d2d" />
            </mesh>

            {/* 오른쪽 눈 */}
            <mesh position={[0.12, 1.15, 0.65]} castShadow>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#2d2d2d" />
            </mesh>

            {/* 왼쪽 귀 */}
            <mesh position={[-0.25, 1.35, 0.3]} rotation={[0, 0, -0.3]} castShadow>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshStandardMaterial color="#a08060" roughness={0.8} />
            </mesh>

            {/* 오른쪽 귀 */}
            <mesh position={[0.25, 1.35, 0.3]} rotation={[0, 0, 0.3]} castShadow>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshStandardMaterial color="#a08060" roughness={0.8} />
            </mesh>

            {/* 앞 다리 왼쪽 */}
            <mesh position={[-0.2, 0.15, 0.2]} castShadow>
                <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>

            {/* 앞 다리 오른쪽 */}
            <mesh position={[0.2, 0.15, 0.2]} castShadow>
                <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>

            {/* 뒷 다리 왼쪽 */}
            <mesh position={[-0.2, 0.15, -0.2]} castShadow>
                <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>

            {/* 뒷 다리 오른쪽 */}
            <mesh position={[0.2, 0.15, -0.2]} castShadow>
                <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>

            {/* 꼬리 */}
            <mesh position={[0, 0.7, -0.5]} rotation={[0.5, 0, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
                <meshStandardMaterial color="#c4a574" roughness={0.8} />
            </mesh>
        </group>
    )
}
