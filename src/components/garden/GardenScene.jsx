import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { TrailTexture } from '../../lib/TrailTexture'
import { vertexShader, fragmentShader } from '../../lib/gardenShaders'

// Escena de Three.js portada de tu proyecto (inspirado en Immersive Garden):
// una malla 3D con textura "plaster" que se revela con color al pasar el
// mouse (o el recorrido automático), simulando esporas/organismo respirando.
//
// initialize: no monta el WebGL hasta que sea true. Una vez montado, sigue
// vivo y renderizando (por eso "no desaparece" al reabrir el menú o volver
// a Home: no hay que recargar nada).
// onProgress(0-100) / onReady(): para mostrar una barra de carga mientras
// se descarga el modelo, en vez de dejar la pantalla vacía sin avisar nada.
const GardenScene = ({ initialize, onProgress, onReady }) => {
  const containerRef = useRef(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!initialize || mountedRef.current || !containerRef.current) return undefined
    mountedRef.current = true

    const container = containerRef.current
    let width = container.offsetWidth
    let height = container.offsetHeight

    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 1000)
    camera.position.set(0, 0, 10)

    // Manager para reportar el progreso real de descarga (modelo + plaster)
    // a quien esté mostrando la barra de carga.
    const manager = new THREE.LoadingManager()
    manager.onProgress = (_url, loaded, total) => {
      onProgress?.(Math.min(100, Math.round((loaded / total) * 100)))
    }

    const textureLoader = new THREE.TextureLoader(manager)
    const loader = new GLTFLoader(manager)
    const draco = new DRACOLoader(manager)
    // Decodificador local (copiado de node_modules) en vez del CDN externo
    // de Google — evita una conexión externa extra que alargaba la carga.
    draco.setDecoderConfig({ type: 'js' })
    draco.setDecoderPath('/draco/')
    loader.setDRACOLoader(draco)

    const trailTexture = new TrailTexture({
      size: 30, maxAge: 3000, radius: 0.2, intensity: 0.1,
      interpolate: 5, smoothing: 0, minForce: 0.1, velocityEffect: false,
    })
    const autoTrailTexture = new TrailTexture({
      size: 30, maxAge: 3000, radius: 0.25, intensity: 0.1,
      interpolate: 3, smoothing: 0, minForce: 0.1,
    })

    const raycaster = new THREE.Raycaster()
    const fboScene = new THREE.Scene()
    const fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const fboMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial())
    fboScene.add(fboMesh)

    const pointer = new THREE.Vector2()

    let wait = false
    const registerTouch = (clientX, clientY) => {
      if (wait) return
      wait = true
      setTimeout(() => { wait = false }, 100)

      const rect = container.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / width) * 2 - 1
      pointer.y = -((clientY - rect.top) / height) * 2 + 1

      raycaster.setFromCamera(pointer, fboCamera)
      const intersects = raycaster.intersectObject(fboMesh)
      if (intersects.length > 0) trailTexture.addTouch(intersects[0].uv)
    }
    const onPointerMove = (event) => registerTouch(event.clientX, event.clientY)
    // Mobile no dispara pointermove al arrastrar el dedo en todos los
    // navegadores — por eso antes solo funcionaba en desktop. touchmove sí
    // lo cubre. { passive: true } para no bloquear el scroll de la página.
    const onTouchMove = (event) => {
      const touch = event.touches[0]
      if (touch) registerTouch(touch.clientX, touch.clientY)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchstart', onTouchMove, { passive: true })

    // Recorrido automático: aunque nadie toque la pantalla, siempre hay
    // "esporas respirando" — igual que tenías en tu versión original.
    let autoMoveTween
    const autoMove = () => {
      let start, end
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

    const uniforms = {
      opacity: { value: 1 },
      resolution: { value: new THREE.Vector2(width, height) },
      darkMode: { value: 0 },
      plasterStrength: { value: 0.5 },
      contrast: { value: 0.6 },
      plaster: { value: textureLoader.load('/garden/plaster.jpg') },
      brightness: { value: 0.3 },
      touchTexture: { value: null },
      autoTouchTexture: { value: null },
    }

    let model = null
    loader.load('/garden/model.glb', (gltf) => {
      model = gltf.scene
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.ShaderMaterial({
            uniforms: {
              ...uniforms,
              map: { value: child.material.map },
              emissive: { value: child.material.emissiveMap },
            },
            vertexShader,
            fragmentShader,
          })
          child.material.needsUpdate = true
        }
      })
      scene.add(gltf.scene)
      onReady?.()
    })

    const handleResize = () => {
      width = container.offsetWidth
      height = container.offsetHeight
      uniforms.resolution.value.set(width, height)
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    const clock = new THREE.Clock()
    let frameId
    const renderLoop = () => {
      frameId = requestAnimationFrame(renderLoop)
      clock.getDelta()
      trailTexture.update(16)
      autoTrailTexture.update(16)
      uniforms.touchTexture.value = trailTexture.texture
      uniforms.autoTouchTexture.value = autoTrailTexture.texture
      renderer.render(scene, camera)
    }
    renderLoop()

    return () => {
      // Nunca se llama en uso normal (el componente vive toda la sesión),
      // pero se deja la limpieza completa por si el árbol se desmonta.
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchMove)
      autoMoveTween?.kill()
      if (model) scene.remove(model)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [initialize, onProgress, onReady])

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 h-full w-full" />
}

export default GardenScene
