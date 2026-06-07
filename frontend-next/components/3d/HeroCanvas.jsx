'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedGeometry({ position, color, speed = 1, type = 'box' }) {
    const meshRef = useRef(null);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x += delta * 0.2 * speed;
        meshRef.current.rotation.y += delta * 0.3 * speed;
    });

    return (
        <Float speed={2 * speed} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={meshRef} position={position} castShadow receiveShadow>
                {type === 'box' && <boxGeometry args={[1, 1, 1]} />}
                {type === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
                {type === 'torus' && <torusGeometry args={[0.6, 0.2, 16, 100]} />}
                {type === 'dodecahedron' && <dodecahedronGeometry args={[0.8]} />}
                <meshStandardMaterial 
                    color={color} 
                    roughness={0.1}
                    metalness={0.8}
                    envMapIntensity={1}
                />
            </mesh>
        </Float>
    );
}

export default function HeroCanvas() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
            <Canvas
                shadows
                camera={{ position: [0, 0, 5], fov: 50 }}
                dpr={[1, 2]} // Optimize pixel ratio for performance
            >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                
                {/* Geometries */}
                <AnimatedGeometry position={[-2.5, 1, -1]} color="#667eea" type="dodecahedron" speed={0.8} />
                <AnimatedGeometry position={[2, -1, 0]} color="#f093fb" type="torus" speed={1.2} />
                <AnimatedGeometry position={[0, 1.5, -2]} color="#10b981" type="box" speed={0.5} />
                <AnimatedGeometry position={[-1.5, -1.5, -1]} color="#f59e0b" type="sphere" speed={1} />
                
                {/* Environment for reflections */}
                <Environment preset="city" />
                
                <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
            </Canvas>
        </div>
    );
}
