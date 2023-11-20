import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback, useMemo } from "react"
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
    NavbarCustomButton,
    AbstractAdapter,
    AbstractPlugin
} from "@photo-sphere-viewer/core"
import "./styles.css"
import "@photo-sphere-viewer/core/index.css"
import { AutorotatePlugin, AutorotatePluginConfig } from "@photo-sphere-viewer/autorotate-plugin"
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
import { MapPlugin, MapPluginConfig } from "@photo-sphere-viewer/map-plugin"
import { CubemapAdapter, CubemapAdapterConfig } from "@photo-sphere-viewer/cubemap-adapter"
import { CubemapTilesAdapter, CubemapTilesAdapterConfig } from "@photo-sphere-viewer/cubemap-tiles-adapter"
import { CubemapVideoAdapter, CubemapVideoAdapterConfig } from "@photo-sphere-viewer/cubemap-video-adapter"
import { EquirectangularTilesAdapter, EquirectangularTilesAdapterConfig } from "@photo-sphere-viewer/equirectangular-tiles-adapter"
import { EquirectangularVideoAdapter, EquirectangularVideoAdapterConfig } from "@photo-sphere-viewer/equirectangular-video-adapter"
import { LensflarePlugin } from "photo-sphere-viewer-lensflare-plugin"

import "@photo-sphere-viewer/markers-plugin/index.css"
import "@photo-sphere-viewer/compass-plugin/index.css"
import "@photo-sphere-viewer/gallery-plugin/index.css"
import "@photo-sphere-viewer/settings-plugin/index.css"
import "@photo-sphere-viewer/video-plugin/index.css"
import "@photo-sphere-viewer/virtual-tour-plugin/index.css"
import "@photo-sphere-viewer/map-plugin/index.css"

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
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export interface Props extends MakeOptional<ViewerConfig, "container"> {
    src: string;
    navbar?: boolean | string | Array<string | NavbarCustomButton>;
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
        close: string;
        twoFingers: string;
        ctrlZoom: string;
        loadError: string;
        [K: string]: string;
    };
    // Events
    onPositionChange?(lat: number, lng: number, instance: Viewer): void;
    onZoomChange?(data: events.ZoomUpdatedEvent & { type: "zoom-updated"; }, instance: Viewer): void;
    onClick?(data: events.ClickEvent & { type: "click"; }, instance: Viewer): void;
    onDblclick?(data: events.ClickEvent & { type: "dblclick"; }, instance: Viewer): void;
    onReady?(instance: Viewer): void;
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

function filterNavbar(navbar?: boolean | string | Array<string | NavbarCustomButton>): false | Array<string | NavbarCustomButton> {
    if (navbar == null) return defaultNavbar
    if (!Array.isArray(navbar)) {
        if (typeof navbar === "string") {
            return navbar === "" ? false : [navbar]
        }
        return navbar ? defaultNavbar : false
    }
    return navbar
}

function useDomElement(): [HTMLDivElement | undefined, (r: HTMLDivElement) => void] {
    const [element, setElement] = useState<HTMLDivElement>()
    const ref = useCallback(
        (r: HTMLDivElement) => {
            if (r && r !== element) {
                setElement(r)
            }
        },
        [element]
    )
    return [element, ref]
}

export interface ViewerAPI {
    animate(options: AnimateOptions): void;
    destroy(): void;
    rotate(options: { x: number; y: number }): void;
    setOption(option: keyof ViewerConfig, value: unknown): void;
    setOptions(options: ViewerConfig): void;
    getCurrentNavbar(): (string | object)[] | void;
    zoom(value: number): void;
    zoomIn(): void;
    zoomOut(): void;
    resize(size: CssSize): void;
    enterFullscreen(): void;
    exitFullscreen(): void;
    toggleFullscreen(): void;
    isFullscreenEnabled(): boolean | void;
    startAutoRotate(): void;
    stopAutoRotate(): void;
    getPlugin(pluginName: string): unknown | void;
    getPosition(): unknown | void; // Specify the return type
    getZoomLevel(): unknown | void; // Specify the return type
    getSize(): unknown | void; // Specify the return type
    needsUpdate(): boolean | void;
    autoSize(): void;
    setPanorama(path: string, options?: object): void;
    setOverlay(path: string, opacity?: number): void;
    toggleAutorotate(): void;
    showError(message: string): void;
    hideError(): void;
    startKeyboardControl(): void;
    stopKeyboardControl(): void;
}

const ReactPhotoSphereViewer = forwardRef<ViewerAPI, Props>((props, ref): React.ReactElement => {
    const [sphereElement, setRef] = useDomElement()
    const options = useMemo(
        () => props,
        [
            // recreate options when individual props change
            props.src,
            props.navbar,
            props.height,
            props.width,
            props.containerClass,
            props.littlePlanet,
            props.fishEye,
            props.lang,
            props.onPositionChange,
            props.onZoomChange,
            props.onClick,
            props.onDblclick,
            props.onReady,
            props.moveSpeed,
            props.zoomSpeed,
            props.moveInertia,
            props.mousewheel,
            props.mousemove,
            props.mousewheelCtrlKey,
            props.touchmoveTwoFingers,
            props.useXmpData,
            props.panoData,
            props.requestHeaders,
            props.canvasBackground,
            props.withCredentials,
            props.keyboard,
            props.plugins,
            props.sphereCorrection,
            props.minFov,
            props.maxFov,
            props.defaultZoomLvl,
            props.defaultYaw,
            props.defaultPitch,
        ]
    )
    const spherePlayerInstance = useRef<Viewer | null>(null)
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
        if (sphereElement && !spherePlayerInstance.current) {
            const _c = new Viewer({
                ...adaptOptions(options),
                container: sphereElement,
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
                // when it undefined, = true, then use input value.
                // The input value maybe false, value || true => false => true
                moveInertia: options.moveInertia ?? true,
                mousewheel: options.littlePlanet ? false : options.mousewheel ?? true,
                mousemove: options.mousemove ?? true,
                mousewheelCtrlKey: options.mousewheelCtrlKey || false,
                touchmoveTwoFingers: options.touchmoveTwoFingers || false,
                useXmpData: options.useXmpData ?? true,
                panoData: options.panoData || {} as PanoData,
                requestHeaders: options.requestHeaders || {},
                canvasBackground: options.canvasBackground || "#000",
                withCredentials: options.withCredentials || false,
                navbar: filterNavbar(options.navbar),
                lang: options.lang || {} as keyof Props["lang"],
                keyboard: options.keyboard || {},
                plugins: [
                    [
                        AutorotatePlugin,
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
                    options.onReady(_c)
                }
            }, { once: true })
            _c.addEventListener("click", (data: events.ClickEvent & { type: "click"; }) => {
                if (options.onClick) {
                    options.onClick(data, _c)
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
                            const p = _c.getPlugin("autorotate") as AutorotatePlugin
                            if (p) p.start()
                            _c.setOption("maxFov", options.maxFov || 70)
                            _c.setOption("mousewheel", options.mousewheel ?? true)
                        })
                    })
                }
            })
            _c.addEventListener("dblclick", (data: events.ClickEvent & { type: "dblclick"; }) => {
                if (options.onDblclick) {
                    options.onDblclick(data, _c)
                }
            })
            _c.addEventListener("zoom-updated", (zoom: events.ZoomUpdatedEvent & { type: "zoom-updated" }) => {
                if (options.onZoomChange) {
                    options.onZoomChange(zoom, _c)
                }
            })
            _c.addEventListener("position-updated", (position: events.PositionUpdatedEvent & { type: "position-updated"; }) => {
                if (options.onPositionChange) {
                    options.onPositionChange(position.position.pitch, position.position.yaw, _c)
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
                        const p = _c.getPlugin("autorotate") as AutorotatePlugin
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
                const _currentNavbar = filterNavbar(options.navbar)
                if (_currentNavbar !== false && !_currentNavbar.find((item) => typeof item === "object" && item?.id === "resetLittlePlanetButton")) {
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
                const p = _c.getPlugin("autorotate") as AutorotatePlugin
                if (p) p.start()
            }).on("stopAutoRotate", () => {
                const p = _c.getPlugin("autorotate") as AutorotatePlugin
                if (p) p.stop()
            }).on("toggleAutorotate", () => {
                const p = _c.getPlugin("autorotate") as AutorotatePlugin
                if (p) p.toggle()
            })

            spherePlayerInstance.current = _c
        }
    }, [sphereElement, options])

    useEffect(() => {
        if (spherePlayerInstance.current) {
            spherePlayerInstance.current.setPanorama(options.src, options)
        }
    }, [options.src])

    const _imperativeHandle = () => ({ 
        animate(options: AnimateOptions) {
            Emitter.emit("animate", options)
        },
        destroy() {
            Emitter.emit("destroy", {})
        },
        rotate(options: { x: number, y: number }) {
            Emitter.emit("rotate", options)
        },
        setOption(option: keyof ViewerConfig, value: unknown): void {
            Emitter.emit("setOption", { option, value })
        },
        setOptions(options: ViewerConfig): void {
            return spherePlayerInstance.current?.setOptions(options)
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
            return spherePlayerInstance.current?.resize(size)
        },
        enterFullscreen() {
            return spherePlayerInstance.current?.enterFullscreen()
        },
        exitFullscreen() {
            return spherePlayerInstance.current?.exitFullscreen()
        },
        toggleFullscreen() {
            return spherePlayerInstance.current?.toggleFullscreen()
        },
        isFullscreenEnabled() {
            return spherePlayerInstance.current?.isFullscreenEnabled()
        },
        startAutoRotate() {
            Emitter.emit("startAutoRotate", {})
        },
        stopAutoRotate() {
            Emitter.emit("stopAutoRotate", {})
        },
        getPlugin(pluginName: string) {
            return spherePlayerInstance.current?.getPlugin(pluginName)
        },
        getPosition() {
            return spherePlayerInstance.current?.getPosition()
        },
        getZoomLevel() {
            return spherePlayerInstance.current?.getZoomLevel()
        },
        getSize() {
            return spherePlayerInstance.current?.getSize()
        },
        needsUpdate() {
            return spherePlayerInstance.current?.needsUpdate()
        },
        autoSize() {
            return spherePlayerInstance.current?.autoSize()
        },
        setPanorama(path: string, options?: object) {
            return spherePlayerInstance.current?.setPanorama(path, options)
        },
        setOverlay(path: string, opacity?: number) {
            return spherePlayerInstance.current?.setOverlay(path, opacity)
        },
        toggleAutorotate() {
            Emitter.emit("toggleAutorotate", {})
        },
        showError(message: string) {
            return spherePlayerInstance.current?.showError(message)
        },
        hideError() {
            return spherePlayerInstance.current?.hideError()
        },
        startKeyboardControl() {
            return spherePlayerInstance.current?.startKeyboardControl()
        },
        stopKeyboardControl() {
            return spherePlayerInstance.current?.stopKeyboardControl()
        },
    })
    // Methods
    useImperativeHandle(ref, _imperativeHandle, [
        spherePlayerInstance.current,
        sphereElement,
        options,
        ref,
    ])

    return <div className={options.containerClass || "view-container"} ref={setRef} />
})

export {
    ReactPhotoSphereViewer,
    AutorotatePlugin, AutorotatePluginConfig,
    MarkersPlugin, MarkersPluginConfig,
    CompassPlugin, CompassPluginConfig,
    GalleryPlugin, GalleryPluginConfig,
    GyroscopePlugin, GyroscopePluginConfig,
    ResolutionPlugin, ResolutionPluginConfig,
    SettingsPlugin, SettingsPluginConfig,
    StereoPlugin,
    VideoPlugin, VideoPluginConfig,
    VirtualTourPlugin, VirtualTourPluginConfig,
    VisibleRangePlugin, VisibleRangePluginConfig,
    MapPlugin, MapPluginConfig,
    CubemapAdapter, CubemapAdapterConfig,
    CubemapTilesAdapter, CubemapTilesAdapterConfig,
    CubemapVideoAdapter, CubemapVideoAdapterConfig,
    EquirectangularTilesAdapter, EquirectangularTilesAdapterConfig,
    EquirectangularVideoAdapter, EquirectangularVideoAdapterConfig,
    AbstractPlugin, AbstractAdapter,
    LensflarePlugin
}
