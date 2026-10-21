"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Physics, RigidBody } from "@react-three/rapier"
import { useEffect, useRef } from "react"
import { create } from "zustand"
import * as THREE from "three"

type PlayerState = { x: number; z: number; stamina: number; attackCooldown: number }
type MmoStore = PlayerState & { move: (x: number, z: number) => void; tick: (delta: number) => void }

export const useMmoStore = create<MmoStore>((set) => ({
  x: 0,
  z: 0,
  stamina: 100,
  attackCooldown: 0,
  move: (x, z) => set((state) => ({ x: THREE.MathUtils.clamp(state.x + x, -6, 6), z: THREE.MathUtils.clamp(state.z + z, -5, 5), stamina: Math.max(0, state.stamina - 1) })),
  tick: (delta) => set((state) => ({ stamina: Math.min(100, state.stamina + delta * 4), attackCooldown: Math.max(0, state.attackCooldown - delta) })),
}))

function Hero() {
  const ref = useRef<THREE.Group>(null)
  const { x, z, tick } = useMmoStore()
  useFrame((_, delta) => { tick(delta); if (ref.current) { ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x, 0.18); ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, z, 0.18) } })
  return <group ref={ref} position={[0, 0.75, 0]}><mesh castShadow><capsuleGeometry args={[0.35, 0.65, 8, 16]} /><meshStandardMaterial color="#c78a5a" roughness={0.75} /></mesh><mesh position={[0, 0.58, 0]} castShadow><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color="#e4aa78" /></mesh><mesh position={[0, 0.73, 0]}><coneGeometry args={[0.22, 0.35, 5]} /><meshStandardMaterial color="#5d3947" /></mesh><pointLight color="#ffb86b" intensity={0.7} distance={2} /></group>
}

function WorldGeometry() {
  return <>
    <RigidBody type="fixed"><mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[20, 16]} /><meshStandardMaterial color="#6d7257" /></mesh></RigidBody>
    <RigidBody type="fixed" colliders="cuboid"><mesh position={[-4, 0.55, -2]} castShadow><boxGeometry args={[2.6, 1.1, 1.4]} /><meshStandardMaterial color="#6c4c3d" /></mesh></RigidBody>
    <RigidBody type="fixed" colliders="cuboid"><mesh position={[3.8, 0.6, 2]} castShadow><boxGeometry args={[2, 1.2, 1.6]} /><meshStandardMaterial color="#3d6270" /></mesh></RigidBody>
    {[-2.5, 0, 2.5].map((x) => <mesh key={x} position={[x, 0.22, -3.7]} castShadow><cylinderGeometry args={[0.16, 0.28, 0.7, 8]} /><meshStandardMaterial color="#314b38" /></mesh>)}
  </>
}

function Scene() { return <><PerspectiveCamera makeDefault position={[0, 10, 10]} fov={45} /><ambientLight intensity={1.5} /><directionalLight position={[4, 9, 3]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} /><Physics gravity={[0, -9.81, 0]}><WorldGeometry /><Hero /></Physics><OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={1.25} minPolarAngle={0.65} target={[0, 0, 0]} /></> }

export default function MmoClient() {
  const { move, stamina } = useMmoStore()
  useEffect(() => { const onKey = (event: KeyboardEvent) => { const speed = 0.35; if (event.key === "w" || event.key === "ArrowUp") move(0, -speed); if (event.key === "s" || event.key === "ArrowDown") move(0, speed); if (event.key === "a" || event.key === "ArrowLeft") move(-speed, 0); if (event.key === "d" || event.key === "ArrowRight") move(speed, 0) }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey) }, [move])
  const pulse = () => move(0, -0.1)
  return <div className="relative h-[440px] overflow-hidden rounded-2xl border border-amber-200/20 bg-[#17232b] shadow-2xl sm:h-[560px]"><Canvas shadows dpr={[1, 2]}><Scene /></Canvas><div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between"><div className="rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-white backdrop-blur-md"><p className="text-[9px] uppercase tracking-[0.2em] text-amber-200">Morkvard Online</p><p className="text-sm font-black">Рыжая гавань · Канал 07</p><div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-red-950"><div className="h-full w-[82%] bg-red-400" /></div></div><div className="rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-right text-white backdrop-blur-md"><p className="text-[9px] uppercase text-slate-300">Игроков онлайн</p><p className="text-lg font-black text-emerald-300">1 284</p></div></div><div className="absolute right-3 top-24 size-20 rounded-full border-2 border-amber-100/50 bg-[#385849]/80 p-2 shadow-xl"><div className="flex h-full items-center justify-center rounded-full border border-white/20 text-xl">⌁</div><span className="absolute -bottom-2 right-1 rounded bg-black/70 px-1.5 text-[8px] text-white">МИНИ-КАРТА</span></div><div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1"><button className="col-start-2 rounded-lg bg-black/60 px-3 py-2 text-white" onClick={() => move(0, -0.35)}>▲</button><button className="rounded-lg bg-black/60 px-3 py-2 text-white" onClick={() => move(-0.35, 0)}>◀</button><button className="rounded-lg bg-black/60 px-3 py-2 text-white" onClick={() => move(0, 0.35)}>▼</button><button className="rounded-lg bg-black/60 px-3 py-2 text-white" onClick={() => move(0.35, 0)}>▶</button></div><div className="absolute bottom-4 right-3 flex items-end gap-2"><button onClick={pulse} className="grid size-14 place-items-center rounded-full border-2 border-amber-200/70 bg-amber-500/80 text-xl text-white shadow-lg">⚔</button><button onClick={() => move(0, 0)} className="grid size-10 place-items-center rounded-full border border-cyan-200/60 bg-cyan-600/80 text-sm text-white">Q</button><button onClick={() => move(0, 0)} className="grid size-10 place-items-center rounded-full border border-fuchsia-200/60 bg-fuchsia-600/80 text-sm text-white">E</button></div><div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-white/15 bg-black/55 px-3 py-1.5 text-[10px] text-slate-200 backdrop-blur"><span className="text-amber-200">WASD</span> / стрелки · движение · Энергия {Math.round(stamina)}%</div></div>
}
