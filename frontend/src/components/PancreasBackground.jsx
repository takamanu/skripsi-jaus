import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function PancreasBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || window.innerHeight

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 0, 7.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // 2. Cinematic Medical Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const frontKeyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    frontKeyLight.position.set(2, 4, 6)
    scene.add(frontKeyLight)

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2)
    rimLight.position.set(6, 2, -4)
    scene.add(rimLight)

    const focalLight = new THREE.PointLight(0xf59e0b, 2.8, 6)
    focalLight.position.set(2.0, 0.0, 2.0)
    scene.add(focalLight)

    // 3. Model Hierarchy & Pivot
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    const pivot = new THREE.Group()
    modelGroup.add(pivot)

    // Canonical Front-Facing Orientation (Pancreas facing user)
    const BASE_ROT_Y = 2.76
    const BASE_ROT_X = -0.08
    const BASE_ROT_Z = 0.05
    pivot.rotation.set(BASE_ROT_X, BASE_ROT_Y, BASE_ROT_Z)

    // Floating bio-particles
    const particleCount = 45
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 6.5
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5
    }
    const particleGeom = new THREE.BufferGeometry()
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 0.032,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    })
    const particlePoints = new THREE.Points(particleGeom, particleMat)
    modelGroup.add(particlePoints)

    // 4. Load 3D GLB Model
    const loader = new GLTFLoader()
    loader.load(
      '/models/pancreas.glb',
      (gltf) => {
        const root = gltf.scene

        const box = new THREE.Box3().setFromObject(root)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        root.position.x = -center.x
        root.position.y = -center.y
        root.position.z = -center.z

        const maxDim = Math.max(size.x, size.y, size.z)
        const targetSize = 3.2
        pivot.scale.setScalar(targetSize / maxDim)

        root.traverse((node) => {
          if (node.isMesh) {
            if (node.name === 'Object_5' || node.material?.color?.getHexString() === 'e7af42') {
              node.material.emissiveIntensity = 0.28
            }
          }
        })

        pivot.add(root)
      },
      undefined,
      (err) => console.error('Failed to load pancreas model:', err)
    )

    // 5. Scroll Tracking
    let currentScroll = window.scrollY
    const handleScroll = () => {
      currentScroll = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // 6. Animation Loop (Smooth rotation on scroll in hero)
    let animationFrameId
    const startTime = performance.now()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = (performance.now() - startTime) * 0.001

      // Visible 3D world dimension at z = 0
      const vHeight = 2 * Math.tan((38 * Math.PI / 360) / 2) * 7.5
      const vWidth = vHeight * (width / height)

      // Center model clearly on the right half of the hero with generous breathing room from text
      const isMobile = width < 860
      const targetBaseX = isMobile
        ? 0.0
        : width > 1200
          ? 0.36 * vWidth
          : 0.31 * vWidth
      const targetBaseY = isMobile ? -0.18 * vHeight : 0.02 * vHeight
      const targetScale = isMobile ? 0.70 : width > 1200 ? 0.98 : 0.90

      // Drifts slightly down and rotates on scroll
      const scrollRotY = BASE_ROT_Y + currentScroll * 0.0035
      const scrollRotX = BASE_ROT_X + currentScroll * 0.0008
      const scrollOffsetY = -currentScroll * 0.0018

      // Physics lerping for fluid smoothness
      modelGroup.position.x = THREE.MathUtils.lerp(modelGroup.position.x, targetBaseX, 0.08)
      modelGroup.position.y = THREE.MathUtils.lerp(
        modelGroup.position.y,
        targetBaseY + scrollOffsetY + Math.sin(elapsed * 1.2) * 0.03,
        0.08
      )
      modelGroup.scale.setScalar(THREE.MathUtils.lerp(modelGroup.scale.x, targetScale, 0.08))

      pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, scrollRotY, 0.08)
      pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, scrollRotX, 0.08)

      // Subtle ambient particle drift
      particlePoints.rotation.y = elapsed * 0.03

      // Fade out when scrolling past hero
      if (mountRef.current) {
        const opacity = Math.max(0, 1 - currentScroll / (height * 0.85))
        mountRef.current.style.opacity = opacity.toFixed(3)
      }

      renderer.render(scene, camera)
    }
    animate()

    // 7. Resize Handling
    const handleResize = () => {
      if (!container) return
      width = container.clientWidth || window.innerWidth
      height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      particleGeom.dispose()
      particleMat.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
        transition: 'opacity 0.2s ease',
      }}
      aria-hidden="true"
    />
  )
}
