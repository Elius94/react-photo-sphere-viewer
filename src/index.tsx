import React, { useState, useEffect, useImperativeHandle, forwardRef, createRef } from "react"
import { Viewer, ViewerOptions, PanoData, ClickData, Position, AnimateOptions, CssSize } from "photo-sphere-viewer"
import "./styles.css"
import "photo-sphere-viewer/dist/photo-sphere-viewer.css"
import EventEmitter from "eventemitter3"
import { CompassPlugin, CompassPluginOptions } from "photo-sphere-viewer/dist/plugins/compass"
import "photo-sphere-viewer/dist/plugins/compass.css"
import { GyroscopePlugin, GyroscopePluginOptions } from "photo-sphere-viewer/dist/plugins/gyroscope"
import { MarkersPlugin, MarkersPluginOptions } from "photo-sphere-viewer/dist/plugins/markers"
import "photo-sphere-viewer/dist/plugins/markers.css"
import { AutorotateKeypointsPlugin, AutorotateKeypointsPluginOptions } from "photo-sphere-viewer/dist/plugins/autorotate-keypoints"
import { GalleryPlugin, GalleryPluginOptions } from "photo-sphere-viewer/dist/plugins/gallery"
import "photo-sphere-viewer/dist/plugins/gallery.css"
import { ResolutionPlugin, ResolutionPluginOptions } from "photo-sphere-viewer/dist/plugins/resolution"
import { SettingsPlugin, SettingsPluginOptions } from "photo-sphere-viewer/dist/plugins/settings"
import "photo-sphere-viewer/dist/plugins/settings.css"
import { StereoPlugin } from "photo-sphere-viewer/dist/plugins/stereo"
import { VideoPlugin, VideoPluginOptions } from "photo-sphere-viewer/dist/plugins/video"
import "photo-sphere-viewer/dist/plugins/video.css"
import { VirtualTourPlugin, VirtualTourPluginOptions } from "photo-sphere-viewer/dist/plugins/virtual-tour"
import "photo-sphere-viewer/dist/plugins/virtual-tour.css"
import { VisibleRangePlugin, VisibleRangePluginOptions } from "photo-sphere-viewer/dist/plugins/visible-range"
import { AbstractPlugin } from "photo-sphere-viewer/dist/photo-sphere-viewer"
// Adapters
import { EquirectangularTilesAdapter, EquirectangularTilesAdapterOptions, EquirectangularTilesPanorama } from "photo-sphere-viewer/dist/adapters/equirectangular-tiles"
import { EquirectangularVideoAdapter, EquirectangularVideoAdapterOptions, EquirectangularVideoPanorama } from "photo-sphere-viewer/dist/adapters/equirectangular-video"
import { CubemapAdapter, CubemapAdapterOptions } from "photo-sphere-viewer/dist/adapters/cubemap"
import { CubemapTilesAdapter, CubemapTilesAdapterOptions, CubemapTilesPanorama } from "photo-sphere-viewer/dist/adapters/cubemap-tiles"



const eventEmitter = new EventEmitter()
const Emitter = {
    on: (event, fn) => eventEmitter.on(event, fn),
    once: (event, fn) => eventEmitter.once(event, fn),
    off: (event, fn) => eventEmitter.off(event, fn),
    emit: (event, payload) => eventEmitter.emit(event, payload)
}

Object.freeze(Emitter)

export interface Props extends ViewerOptions {
    src: string;
    navbar?: string[];
    height: number;
    width?: number;
    containerClass?: string;
    littlePlanet?: boolean;
    fishEye?: boolean | number;
    // Events
    onPositionChange?(lat: number, lng: number): any;
    onZoomChange?(zoom: number): any;
    onClick?(data: ClickData): void;
    onDblclick?(data: ClickData): void;
    onReady?(): void;
}

const defaultNavbar = [
    "autorotate",
    "zoom",
    "fullscreen"
]

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
                container: sphereElementRef.current,
                panorama: options.src,
                size: {
                    height: options.height,
                    width: options.width || 100
                },
                caption: options.caption || "",
                description: options.description || "",
                downloadUrl: options.downloadUrl || "",
                loadingImg: options.loadingImg || "",
                loadingTxt: options.loadingTxt || "",
                fisheye: options.littlePlanet ? LITTLEPLANET_FISHEYE : options.fisheye || false, // @ts-ignore ts(2345)
                minFov: options.minFov || 30,
                maxFov: options.littlePlanet ? LITTLEPLANET_MAX_ZOOM : options.maxFov || 90,
                defaultZoomLvl: options.littlePlanet ? LITTLEPLANET_DEF_ZOOM : options.defaultZoomLvl || 50,
                defaultLong: options.defaultLong || 0,
                defaultLat: options.littlePlanet ? LITTLEPLANET_DEF_LAT : options.defaultLat || 0,
                sphereCorrection: options.sphereCorrection || { pan: 0, tilt: 0, roll: 0 },
                moveSpeed: options.moveSpeed || 1,
                zoomSpeed: options.zoomSpeed || 1,
                autorotateDelay: options.autorotateDelay || undefined,
                autorotateIdle: options.autorotateIdle || false,
                autorotateSpeed: options.autorotateSpeed || 1,
                autorotateLat: options.autorotateLat || options.defaultLat || 0,
                moveInertia: options.moveInertia || true,
                mousewheel: options.littlePlanet ? false : options.mousewheel || true,
                mousemove: options.mousemove || true,
                captureCursor: options.captureCursor || false,
                mousewheelCtrlKey: options.mousewheelCtrlKey || false,
                touchmoveTwoFingers: options.touchmoveTwoFingers || false,
                useXmpData: options.useXmpData || true,
                panoData: options.panoData || {} as PanoData,
                requestHeaders: options.requestHeaders || {},
                canvasBackground: options.canvasBackground || "#000",
                withCredentials: options.withCredentials || false,
                navbar: options.navbar || defaultNavbar,
                lang: options.lang || {},
                keyboard: options.keyboard || {},
                plugins: options.plugins || [],
            }).once("ready", () => {
                if (options.onReady) {
                    options.onReady()
                }
            }).on("click", (_: any, data: ClickData) => {
                if (options.onClick) {
                    options.onClick(data)
                }
                if (options.littlePlanet && littlePlanetEnabled) {
                    littlePlanetEnabled = false
                    // fly inside the sphere
                    _c.animate({
                        longitude: 0,
                        latitude: LITTLEPLANET_DEF_LAT,
                        zoom: 75,
                        speed: "3rpm",
                    }).then(() => {
                        // watch on the sky
                        _c.animate({
                            longitude: 0,
                            latitude: 0,
                            zoom: 90,
                            speed: "10rpm",
                        }).then(() => {
                            // Disable Little Planet.
                            _c.startAutorotate()
                            _c.setOption("maxFov", options.maxFov || 70)
                            _c.setOption("mousewheel", options.mousewheel || true)
                        })
                    })
                }
            }).on("dblclick", (_: any, data: ClickData) => {
                if (options.onDblclick) {
                    options.onDblclick(data)
                }
            }).on("zoom-updated", (_: any, zoom: number) => {
                if (options.onZoomChange) {
                    options.onZoomChange(zoom)
                }
            }).on("position-updated", (_: any, position: Position) => {
                if (options.onPositionChange) {
                    options.onPositionChange(position.latitude, position.longitude)
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
                        _c.stopAutorotate()
                        _c.setOption("maxFov", LITTLEPLANET_MAX_ZOOM)
                        //_c.setOption("fisheye", LITTLEPLANET_FISHEYE) // @ts-ignore ts(2345)
                        _c.setOption("mousewheel", false)
                        _c.animate({
                            longitude: 0,
                            latitude: LITTLEPLANET_DEF_LAT,
                            zoom: LITTLEPLANET_DEF_ZOOM,
                            speed: "10rpm",
                        })
                    },
                }
                const currentNavbar: any[] = options.navbar || defaultNavbar
                currentNavbar.push(resetLittlePlanetButton)
                _c.setOption("navbar", currentNavbar)
            }

            Emitter.on("animate", (options: AnimateOptions) => {
                _c.animate(options)
            }).on("stop-animation", () => {
                _c.stopAnimation()
            }).on("destroy", () => {
                _c.destroy()
            }).on("rotate", (options: { x: number, y: number }) => {
                _c.rotate(options)
            }).on("setOption", (pair: { option: keyof ViewerOptions, value: any }) => {
                const { option, value } = pair
                _c.setOption(option, value)
            }).on("zoom", (zoom: number) => {
                _c.zoom(zoom)
            }).on("zoomIn", () => {
                _c.zoomIn()
            }).on("zoomOut", () => {
                _c.zoomOut()
            }).on("startAutoRotate", () => {
                _c.startAutorotate()
            }).on("stopAutoRotate", () => {
                _c.stopAutorotate()
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
        setOption(option: keyof ViewerOptions, value: any): void {
            Emitter.emit("setOption", { option, value })
        },
        setOptions(options: ViewerOptions): void {
            return spherePlayerInstance?.setOptions(options)
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
            return spherePlayerInstance?.toggleAutorotate()
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
    // Plugins
    CompassPlugin,
    CompassPluginOptions,
    GyroscopePlugin,
    GyroscopePluginOptions,
    MarkersPlugin,
    MarkersPluginOptions,
    AutorotateKeypointsPlugin,
    AutorotateKeypointsPluginOptions,
    GalleryPlugin,
    GalleryPluginOptions,
    ResolutionPlugin,
    ResolutionPluginOptions,
    SettingsPlugin,
    SettingsPluginOptions,
    StereoPlugin,
    VideoPlugin,
    VideoPluginOptions,
    VirtualTourPlugin,
    VirtualTourPluginOptions,
    VisibleRangePlugin,
    VisibleRangePluginOptions,
    AbstractPlugin,
    // Adapters
    CubemapAdapter,
    CubemapAdapterOptions,
    EquirectangularVideoAdapter,
    EquirectangularVideoAdapterOptions,
    EquirectangularVideoPanorama,
    EquirectangularTilesAdapter,
    EquirectangularTilesAdapterOptions,
    EquirectangularTilesPanorama,
    CubemapTilesAdapter,
    CubemapTilesAdapterOptions,
    CubemapTilesPanorama
}
