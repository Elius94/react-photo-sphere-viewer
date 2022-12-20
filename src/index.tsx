import React, { 
    useState, 
    useEffect, 
    useImperativeHandle, 
    forwardRef, 
    createRef 
} from "react"
import { 
    Viewer, 
    ViewerConfig, 
    PanoData, 
    AnimateOptions, 
    CssSize, 
    ExtendedPosition, 
    UpdatableViewerConfig, 
    events, 
    PluginConstructor, 
    NavbarCustomButton 
} from "@photo-sphere-viewer/core"
import "./styles.css"
import "@photo-sphere-viewer/core/index.css"
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin"
import { MarkersPlugin, MarkersPluginConfig } from "@photo-sphere-viewer/markers-plugin"
import { CompassPlugin, CompassPluginConfig } from "@photo-sphere-viewer/compass-plugin"
import { GalleryPlugin, GalleryPluginConfig } from "@photo-sphere-viewer/gallery-plugin"
import { GyroscopePlugin, GyroscopePluginConfig } from "@photo-sphere-viewer/gyroscope-plugin"
import { ResolutionPlugin, ResolutionPluginConfig } from "@photo-sphere-viewer/resolution-plugin"
import { SettingsPlugin, SettingsPluginConfig } from "@photo-sphere-viewer/settings-plugin"
import { StereoPlugin } from "@photo-sphere-viewer/stereo-plugin"
import { VideoPlugin, VideoPluginConfig } from "@photo-sphere-viewer/video-plugin"
import { VirtualTourPlugin, VirtualTourPluginConfig } from "@photo-sphere-viewer/virtual-tour-plugin"
import { VisibleRangePlugin, VisibleRangePluginConfig } from "@photo-sphere-viewer/visible-range-plugin"

import "@photo-sphere-viewer/markers-plugin/index.css"
import EventEmitter from "eventemitter3"


const eventEmitter = new EventEmitter()
const Emitter = {
    on: (event, fn) => eventEmitter.on(event, fn),
    once: (event, fn) => eventEmitter.once(event, fn),
    off: (event, fn) => eventEmitter.off(event, fn),
    emit: (event, payload) => eventEmitter.emit(event, payload)
}

Object.freeze(Emitter)

const omittedProps = [
    "src",
    "height",
    "width",
    "containerClass",
    "littlePlanet",
    "onPositionChange",
    "onZoomChange",
    "onClick",
    "onDblclick",
    "onReady",
]

export interface Props extends ViewerConfig {
    src: string;
    navbar?: string[];
    height: string;
    width?: string;
    containerClass?: string;
    littlePlanet?: boolean;
    fishEye?: boolean | number;
    lang?: {
        zoom: string;
        zoomOut: string;
        zoomIn: string;
        moveUp: string;
        moveDown: string;
        moveLeft: string;
        moveRight: string;
        download: string;
        fullscreen: string;
        menu: string;
        twoFingers: string;
        ctrlZoom: string;
        loadError: string;
        [K: string]: string;
    };
    // Events
    onPositionChange?(lat: number, lng: number): void;
    onZoomChange?(data: events.ZoomUpdatedEvent & { type: "zoom-updated"; }): void;
    onClick?(data: events.ClickEvent & { type: "click"; }): void;
    onDblclick?(data: events.ClickEvent & { type: "dblclick"; }): void;
    onReady?(): void;
}

const defaultNavbar = [
    "autorotate",
    "zoom",
    "fullscreen"
]

function adaptOptions(options: Props): ViewerConfig {
    const adaptedOptions = { ...options }
    for (const key in adaptedOptions) {
        if (omittedProps.includes(key)) {
            delete adaptedOptions[key]
        }
    }
    return adaptedOptions as ViewerConfig
}

function map(_in: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (_in - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

const ReactPhotoSphereViewer = forwardRef((options: Props, ref: any): React.ReactElement => {
    const sphereElementRef = createRef<HTMLDivElement>()
    const [spherePlayerInstance, setSpherePlayerInstance] = useState<Viewer | undefined>()
    let LITTLEPLANET_MAX_ZOOM = 130
    const [LITTLEPLANET_DEF_LAT] = useState(-90)
    const [LITTLEPLANET_FISHEYE] = useState(2)
    const [LITTLEPLANET_DEF_ZOOM] = useState(0)
    const [currentNavbar, setCurrentNavbar] = useState<(string | object)[]>(defaultNavbar)

    useEffect(() => {
        function handleResize() {
            const aspectRatio = window.innerWidth / window.innerHeight
            //console.log(aspectRatio)
            LITTLEPLANET_MAX_ZOOM = Math.floor(map(aspectRatio, 0.5, 1.8, 140, 115))
        }
        // Add event listener
        window.addEventListener("resize", handleResize)

        handleResize()
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        let littlePlanetEnabled = true
        if (sphereElementRef.current && !spherePlayerInstance) {
            const _c = new Viewer({
                ...adaptOptions(options),
                container: sphereElementRef.current,
                panorama: options.src,
                size: {
                    height: options.height,
                    width: options.width || "100px"
                },
                fisheye: options.littlePlanet ? LITTLEPLANET_FISHEYE : options.fisheye || false,
                minFov: options.minFov || 30,
                maxFov: options.littlePlanet ? LITTLEPLANET_MAX_ZOOM : options.maxFov || 90,
                defaultZoomLvl: options.littlePlanet ? LITTLEPLANET_DEF_ZOOM : options.defaultZoomLvl || 50,
                defaultYaw: options.defaultYaw || 0,
                defaultPitch: options.littlePlanet ? LITTLEPLANET_DEF_LAT : options.defaultPitch || 0,
                sphereCorrection: options.sphereCorrection || { pan: 0, tilt: 0, roll: 0 },
                moveSpeed: options.moveSpeed || 1,
                zoomSpeed: options.zoomSpeed || 1,
                moveInertia: options.moveInertia || true,
                mousewheel: options.littlePlanet ? false : options.mousewheel || true,
                mousemove: options.mousemove || true,
                mousewheelCtrlKey: options.mousewheelCtrlKey || false,
                touchmoveTwoFingers: options.touchmoveTwoFingers || false,
                useXmpData: options.useXmpData || true,
                panoData: options.panoData || {} as PanoData,
                requestHeaders: options.requestHeaders || {},
                canvasBackground: options.canvasBackground || "#000",
                withCredentials: options.withCredentials || false,
                navbar: options.navbar || defaultNavbar,
                lang: options.lang || {} as keyof Props["lang"],
                keyboard: options.keyboard || {},
                plugins: [
                    [
                        AutorotatePlugin as unknown as PluginConstructor, 
                        { 
                            autorotatePitch: "5deg", 
                            autostartDelay: undefined, 
                            autostartOnIdle: false 
                        }
                    ], 
                    ...(options.plugins ? options.plugins as PluginConstructor[] : [])
                ],
            })
            _c.addEventListener("ready", () => {
                if (options.onReady) {
                    options.onReady()
                }
            }, { once: true })
            _c.addEventListener("click", (data: events.ClickEvent & { type: "click"; }) => {
                if (options.onClick) {
                    options.onClick(data)
                }
                if (options.littlePlanet && littlePlanetEnabled) {
                    littlePlanetEnabled = false
                    // fly inside the sphere
                    _c.animate({
                        yaw: 0,
                        pitch: LITTLEPLANET_DEF_LAT,
                        zoom: 75,
                        speed: "3rpm",
                    }).then(() => {
                        // watch on the sky
                        _c.animate({
                            yaw: 0,
                            pitch: 0,
                            zoom: 90,
                            speed: "10rpm",
                        }).then(() => {
                            // Disable Little Planet.
                            const p = _c.getPlugin(AutorotatePlugin as unknown as PluginConstructor) as AutorotatePlugin
                            if (p) p.start()
                            _c.setOption("maxFov", options.maxFov || 70)
                            _c.setOption("mousewheel", options.mousewheel || true)
                        })
                    })
                }
            })
            _c.addEventListener("dblclick", (data: events.ClickEvent & { type: "dblclick"; }) => {
                if (options.onDblclick) {
                    options.onDblclick(data)
                }
            })
            _c.addEventListener("zoom-updated", (zoom: events.ZoomUpdatedEvent & { type: "zoom-updated" }) => {
                if (options.onZoomChange) {
                    options.onZoomChange(zoom)
                }
            })
            _c.addEventListener("position-updated", (position: events.PositionUpdatedEvent & { type: "position-updated"; }) => {
                if (options.onPositionChange) {
                    options.onPositionChange(position.position.pitch, position.position.yaw)
                }
            })

            if (options.littlePlanet) {
                const resetLittlePlanetButton = {
                    id: "resetLittlePlanetButton",
                    content: "🪐",
                    title: "Reset Little Planet",
                    className: "resetLittlePlanetButton",
                    onClick: () => {
                        littlePlanetEnabled = true
                        const p = _c.getPlugin(AutorotatePlugin as unknown as PluginConstructor) as AutorotatePlugin
                        if (p) p.stop()
                        _c.setOption("maxFov", LITTLEPLANET_MAX_ZOOM)
                        //_c.setOption("fisheye", LITTLEPLANET_FISHEYE) // @ts-ignore ts(2345)
                        _c.setOption("mousewheel", false)
                        _c.animate({
                            yaw: 0,
                            pitch: LITTLEPLANET_DEF_LAT,
                            zoom: LITTLEPLANET_DEF_ZOOM,
                            speed: "10rpm",
                        })
                    },
                }
                const _currentNavbar: Array<string | NavbarCustomButton> = options.navbar || defaultNavbar
                if (!_currentNavbar.find((item) => typeof item === "object" && item?.id === "resetLittlePlanetButton")) {
                    _currentNavbar.push(resetLittlePlanetButton)
                    _c.setOption("navbar", _currentNavbar)
                    setCurrentNavbar(_currentNavbar)
                }
            }

            Emitter.on("animate", (options: AnimateOptions) => {
                _c.animate(options)
            }).on("stop-animation", () => {
                _c.stopAnimation()
            }).on("destroy", () => {
                _c.destroy()
            }).on("rotate", (options: ExtendedPosition) => {
                _c.rotate(options)
            }).on("setOption", (pair: { option: keyof UpdatableViewerConfig, value: UpdatableViewerConfig[keyof UpdatableViewerConfig] }) => {
                const { option, value } = pair
                _c.setOption(option, value)
            }).on("zoom", (zoom: number) => {
                _c.zoom(zoom)
            }).on("zoomIn", () => {
                _c.zoomIn()
            }).on("zoomOut", () => {
                _c.zoomOut()
            }).on("startAutoRotate", () => {
                const p = _c.getPlugin(AutorotatePlugin as unknown as PluginConstructor) as AutorotatePlugin
                if (p) p.start()
            }).on("stopAutoRotate", () => {
                const p = _c.getPlugin(AutorotatePlugin as unknown as PluginConstructor) as AutorotatePlugin
                if (p) p.stop()
            }).on("toggleAutorotate", () => {
                const p = _c.getPlugin(AutorotatePlugin as unknown as PluginConstructor) as AutorotatePlugin
                if (p) p.toggle()
            })

            setSpherePlayerInstance(_c)
        }
    }, [sphereElementRef, options])

    // Methods
    useImperativeHandle(ref, () => ({
        animate(options: AnimateOptions) {
            Emitter.emit("animate", options)
        },
        destroy() {
            Emitter.emit("destroy", {})
        },
        rotate(options: { x: number, y: number }) {
            Emitter.emit("rotate", options)
        },
        setOption(option: keyof ViewerConfig, value: any): void {
            Emitter.emit("setOption", { option, value })
        },
        setOptions(options: ViewerConfig): void {
            return spherePlayerInstance?.setOptions(options)
        },
        getCurrentNavbar(): (string | object)[] {
            return currentNavbar
        },
        zoom(value: number) {
            Emitter.emit("zoom", value)
        },
        zoomIn() {
            Emitter.emit("zoomIn", {})
        },
        zoomOut() {
            Emitter.emit("zoomOut", {})
        },
        resize(size: CssSize) {
            return spherePlayerInstance?.resize(size)
        },
        enterFullscreen() {
            return spherePlayerInstance?.enterFullscreen()
        },
        exitFullscreen() {
            return spherePlayerInstance?.exitFullscreen()
        },
        toggleFullscreen() {
            return spherePlayerInstance?.toggleFullscreen()
        },
        isFullscreenEnabled() {
            return spherePlayerInstance?.isFullscreenEnabled()
        },
        startAutoRotate() {
            Emitter.emit("startAutoRotate", {})
        },
        stopAutoRotate() {
            Emitter.emit("stopAutoRotate", {})
        },
        getPlugin(pluginName: string) {
            return spherePlayerInstance?.getPlugin(pluginName)
        },
        getPosition() {
            return spherePlayerInstance?.getPosition()
        },
        getZoomLevel() {
            return spherePlayerInstance?.getZoomLevel()
        },
        getSize() {
            return spherePlayerInstance?.getSize()
        },
        needsUpdate() {
            return spherePlayerInstance?.needsUpdate()
        },
        autoSize() {
            return spherePlayerInstance?.autoSize()
        },
        setPanorama(path: string, options?: object) {
            return spherePlayerInstance?.setPanorama(path, options)
        },
        setOverlay(path: string, opacity?: number) {
            return spherePlayerInstance?.setOverlay(path, opacity)
        },
        toggleAutorotate() {
            Emitter.emit("toggleAutorotate", {})
        },
        showError(message: string) {
            return spherePlayerInstance?.showError(message)
        },
        hideError() {
            return spherePlayerInstance?.hideError()
        },
        startKeyboardControl() {
            return spherePlayerInstance?.startKeyboardControl()
        },
        stopKeyboardControl() {
            return spherePlayerInstance?.stopKeyboardControl()
        }
    }), [spherePlayerInstance, sphereElementRef, options, ref])

    return (
        <div className={options.containerClass || "view-container"} ref={sphereElementRef} />
    )
})

export {
    ReactPhotoSphereViewer,
    MarkersPlugin, MarkersPluginConfig,
    CompassPlugin, CompassPluginConfig,
    GalleryPlugin, GalleryPluginConfig,
    GyroscopePlugin, GyroscopePluginConfig,
    ResolutionPlugin, ResolutionPluginConfig,
    SettingsPlugin, SettingsPluginConfig,
    StereoPlugin,
    VideoPlugin, VideoPluginConfig,
    VirtualTourPlugin, VirtualTourPluginConfig,
    VisibleRangePlugin, VisibleRangePluginConfig
}
