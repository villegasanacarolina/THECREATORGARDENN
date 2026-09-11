import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { TrailTexture } from '../../lib/TrailTexture'
import { vertexShader, fragmentShader } from '../../lib/gardenShaders'

const GardenScene = ({ initialize, onProgress, onReady, onError, onDebug }) => {
  const containerRef = useRef(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!initialize || mountedRef.current || !containerRef.current) return undefined
    mountedRef.current = true

    const container = containerRef.current
    let disposed = false
    let width = container.offsetWidth
    let height = container.offsetHeight

    const mobileOptimized = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
    const modelUrl = mobileOptimized ? '/garden/model-mobile.glb' : '/garden/model.glb'
    const expectedModelBytes = mobileOptimized ? 22122016 : 39188252

    onDebug?.(`montado, tamaño contenedor: ${width}x${height}, modelo: ${modelUrl}`)

    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileOptimized ? 1.5 : 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 1000)
    camera.position.set(0, 0, 10)

    let modelLoaded = false
    let plasterLoaded = false
    let managerLoaded = false
    let renderedWithModel = false
    let loadSettled = false

    const settleLoad = () => {
      if (disposed || loadSettled || !modelLoaded || !plasterLoaded || !managerLoaded || !renderedWithModel) return
      loadSettled = true
      onProgress?.(100)
      onReady?.()
    }

    const manager = new THREE.LoadingManager()
    manager.onStart = () => {
      if (!disposed) onProgress?.(1)
    }
    manager.onLoad = () => {
      managerLoaded = true
      settleLoad()
    }
    manager.onError = (url) => {
      if (disposed) return
      const error = new Error(`No se pudo cargar el recurso 3D: ${url}`)
      console.error('[GardenScene]', error)
      onError?.(error)
    }

    const textureLoader = new THREE.TextureLoader(manager)
    const loader = new GLTFLoader(manager)

    const trailTexture = new TrailTexture({
      size: 30,
      maxAge: 3000,
      radius: 0.2,
      intensity: 0.1,
      interpolate: 5,
      smoothing: 0,
      minForce: 0.1,
      velocityEffect: false,
    })
    const autoTrailTexture = new TrailTexture({
      size: 30,
      maxAge: 3000,
      radius: 0.25,
      intensity: 0.1,
      interpolate: 3,
      smoothing: 0,
      minForce: 0.1,
    })

    const raycaster = new THREE.Raycaster()
    const fboScene = new THREE.Scene()
    const fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const fboMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial())
    fboScene.add(fboMesh)

    const pointer = new THREE.Vector2()
    let wait = false

    const registerTouch = (clientX, clientY) => {
      if (wait || !width || !height) return
      wait = true
      setTimeout(() => { wait = false }, mobileOptimized ? 70 : 45)

      const rect = container.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / width) * 2 - 1
      pointer.y = -((clientY - rect.top) / height) * 2 + 1

      raycaster.setFromCamera(pointer, fboCamera)
      const intersects = raycaster.intersectObject(fboMesh)
      if (intersects.length > 0) trailTexture.addTouch(intersects[0].uv)
    }

    const onPointerMove = (event) => registerTouch(event.clientX, event.clientY)
    const onTouchMove = (event) => {
      const touch = event.touches[0]
      if (touch) registerTouch(touch.clientX, touch.clientY)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchstart', onTouchMove, { passive: true })

    let autoMoveTween
    const autoMove = () => {
      let start
      let end
      do {
        start = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
        end = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
      } while (
        Math.hypot(end.x - start.x, end.y - start.y) < 0.5 ||
        Math.hypot(end.x - start.x, end.y - start.y) > 0.8
      )

      autoMoveTween = gsap.to(start, {
        delay: Math.random() * 2,
        x: end.x,
        y: end.y,
        duration: Math.random() * 2 + 1,
        ease: 'expo.inOut',
        onUpdate: () => {
          raycaster.setFromCamera(new THREE.Vector2(start.x, start.y), fboCamera)
          const intersects = raycaster.intersectObject(fboMesh)
          if (intersects.length > 0) autoTrailTexture.addTouch(intersects[0].uv)
        },
        onComplete: autoMove,
      })
    }
    autoMove()

    const plasterTexture = textureLoader.load(
      '/garden/plaster.jpg',
      () => {
        plasterLoaded = true
        settleLoad()
      },
      undefined,
      (error) => {
        if (!disposed) onError?.(error)
      },
    )

    const uniforms = {
      opacity: { value: 1 },
      resolution: { value: new THREE.Vector2(width, height) },
      darkMode: { value: 0 },
      plasterStrength: { value: 0.5 },
      contrast: { value: 0.6 },
      plaster: { value: plasterTexture },
      brightness: { value: 0.3 },
      touchTexture: { value: null },
      autoTouchTexture: { value: null },
    }

    let model = null

    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return
        model = gltf.scene
        let meshCount = 0

        gltf.scene.traverse((child) => {
          if (!child.isMesh) return
          meshCount += 1
          const originalMaterial = child.material
          child.material = new THREE.ShaderMaterial({
            uniforms: {
              ...uniforms,
              map: { value: originalMaterial?.map || null },
              emissive: { value: originalMaterial?.emissiveMap || null },
            },
            vertexShader,
            fragmentShader,
          })
          child.material.needsUpdate = true
        })

        scene.add(gltf.scene)
        modelLoaded = true
        onProgress?.(98)
        onDebug?.(`modelo cargado OK — ${meshCount} mallas agregadas a la escena`)
      },
      (event) => {
        if (disposed) return
        const total = event.total || expectedModelBytes
        const ratio = Math.min(1, event.loaded / Math.max(total, 1))
        // 3–95% representa bytes reales del GLB. El resto se reserva para
        // parseo/texturas/primer frame para que 100% signifique “ya se ve”.
        onProgress?.(Math.max(3, Math.min(95, Math.round(3 + ratio * 92))))
      },
      (error) => {
        if (disposed) return
        console.error('[GardenScene] error cargando el modelo 3D:', error)
        onError?.(error)
      },
    )

    const handleResize = () => {
      width = container.offsetWidth
      height = container.offsetHeight
      uniforms.resolution.value.set(width, height)
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileOptimized ? 1.5 : 2))
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    let frameId
    const renderLoop = () => {
      frameId = requestAnimationFrame(renderLoop)
      trailTexture.update(16)
      autoTrailTexture.update(16)
      uniforms.touchTexture.value = trailTexture.texture
      uniforms.autoTouchTexture.value = autoTrailTexture.texture
      renderer.render(scene, camera)

      if (modelLoaded) {
        renderedWithModel = true
        settleLoad()
      }
    }
    renderLoop()

    return () => {
      disposed = true
      mountedRef.current = false
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchMove)
      autoMoveTween?.kill()

      if (model) {
        model.traverse((child) => {
          if (child.isMesh) child.material?.dispose?.()
        })
        scene.remove(model)
      }

      plasterTexture.dispose?.()
      fboMesh.geometry.dispose()
      fboMesh.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
    }
  }, [initialize, onProgress, onReady, onError, onDebug])

  return <div ref={containerRef} className='pointer-events-none absolute inset-0 h-full w-full' />
}

export default GardenScene
