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
    TooltipConfig,
    Tooltip,
    Position,
    Size,
    PanoramaOptions,
    utils
    /* @ts-ignore next line */
} from "@photo-sphere-viewer/core" // Peer dependency
import "./styles.css"
import "@photo-sphere-viewer/core/index.css"
// import { LensflarePlugin } from "photo-sphere-viewer-lensflare-plugin"

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
    "hideNavbarButton",
    "containerClass",
    "littlePlanet",
    "onPositionChange",
    "onZoomChange",
    "onClick",
    "onDblclick",
    "onReady",
]
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface CubeMapSrc {
    left: string;
    front: string;
    right: string;
    back: string;
    top: string;
    bottom: string;
}

export interface TilesAdapterSrc {
    width: number;
    cols: number;
    rows: number;
    baseUrl: string;
    tileUrl: (col: number, row: number) => string;
}

/**
 * Props interface for the Viewer component.
 * 
 * @interface
 * @property {string} src - The source of the image to be viewed.
 * @property {boolean | string | Array<string | NavbarCustomButton>} [navbar] - Configuration for the navbar. Can be a boolean, string, or an array of strings or NavbarCustomButton.
 * @property {string} height - The height of the viewer.
 * @property {string} [width] - The width of the viewer.
 * @property {string} [containerClass] - The CSS class for the viewer container.
 * @property {boolean} [littlePlanet] - Enable or disable the little planet effect.
 * @property {boolean | number} [fishEye] - Enable or disable the fisheye effect, or set the fisheye level.
 * @property {boolean} [hideNavbarButton] - Show/hide the button that hides the navbar.
 * @property {Object} [lang] - Language configuration for the viewer. Each property is a string that represents the text for a specific action.
 * @property {Function} [onPositionChange] - Event handler for when the position changes. Receives the latitude, longitude, and the Viewer instance.
 * @property {Function} [onZoomChange] - Event handler for when the zoom level changes. Receives the ZoomUpdatedEvent and the Viewer instance.
 * @property {Function} [onClick] - Event handler for when the viewer is clicked. Receives the ClickEvent and the Viewer instance.
 * @property {Function} [onDblclick] - Event handler for when the viewer is double clicked. Receives the ClickEvent and the Viewer instance.
 * @property {Function} [onReady] - Event handler for when the viewer is ready. Receives the Viewer instance.
 */
export interface Props extends MakeOptional<ViewerConfig, "container"> {
    src: string | CubeMapSrc | TilesAdapterSrc;
    navbar?: boolean | string | Array<string | NavbarCustomButton>;
    height: string;
    width?: string;
    containerClass?: string;
    littlePlanet?: boolean;
    fishEye?: boolean | number;
    hideNavbarButton?: boolean;
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
        littlePlanetButton: string;
        littlePlanetIcon: string;
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

/**
 * Interface for the Viewer API.
 * 
 * @interface
 * @property {Function} animate - Starts an animation. Receives an object of AnimateOptions.
 * @property {Function} destroy - Destroys the viewer.
 * @property {Function} createTooltip - Creates a tooltip. Receives a TooltipConfig object.
 * @property {Function} needsContinuousUpdate - Enables or disables continuous updates. Receives a boolean.
 * @property {Function} observeObjects - Starts observing objects. Receives a string key.
 * @property {Function} unobserveObjects - Stops observing objects. Receives a string key.
 * @property {Function} setCursor - Sets the cursor. Receives a string.
 * @property {Function} stopAnimation - Stops the current animation. Returns a Promise.
 * @property {Function} rotate - Rotates the viewer. Receives an ExtendedPosition object.
 * @property {Function} setOption - Sets a single option. Receives an option key and a value.
 * @property {Function} setOptions - Sets multiple options. Receives an object of options.
 * @property {Function} getCurrentNavbar - Returns the current navbar.
 * @property {Function} zoom - Sets the zoom level. Receives a number.
 * @property {Function} zoomIn - Increases the zoom level. Receives a number.
 * @property {Function} zoomOut - Decreases the zoom level. Receives a number.
 * @property {Function} resize - Resizes the viewer. Receives a CssSize object.
 * @property {Function} enterFullscreen - Enters fullscreen mode.
 * @property {Function} exitFullscreen - Exits fullscreen mode.
 * @property {Function} toggleFullscreen - Toggles fullscreen mode.
 * @property {Function} isFullscreenEnabled - Returns whether fullscreen is enabled.
 * @property {Function} getPlugin - Returns a plugin. Receives a plugin ID or a PluginConstructor.
 * @property {Function} getPosition - Returns the current position.
 * @property {Function} getZoomLevel - Returns the current zoom level.
 * @property {Function} getSize - Returns the current size.
 * @property {Function} needsUpdate - Updates the viewer.
 * @property {Function} autoSize - Sets the size to auto.
 * @property {Function} setPanorama - Sets the panorama. Receives a path and an optional PanoramaOptions object. Returns a Promise.
 * @property {Function} showError - Shows an error message. Receives a string.
 * @property {Function} hideError - Hides the error message.
 * @property {Function} startKeyboardControl - Starts keyboard control.
 * @property {Function} stopKeyboardControl - Stops keyboard control.
 */
export interface ViewerAPI {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animate(options: AnimateOptions): utils.Animation<any>;
    destroy(): void;
    createTooltip(config: TooltipConfig): Tooltip;
    needsContinuousUpdate(enabled: boolean): void;
    observeObjects(userDataKey: string): void;
    unobserveObjects(userDataKey: string): void;
    setCursor(cursor: string): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stopAnimation(): PromiseLike<any>;
    rotate(position: ExtendedPosition): void;
    setOption(option: keyof UpdatableViewerConfig, value: unknown): void;
    setOptions(options: Partial<UpdatableViewerConfig>): void;
    getCurrentNavbar(): (string | object)[] | void;
    zoom(value: number): void;
    zoomIn(step: number): void;
    zoomOut(step: number): void;
    resize(size: CssSize): void;
    enterFullscreen(): void;
    exitFullscreen(): void;
    toggleFullscreen(): void;
    isFullscreenEnabled(): boolean | void;
    getPlugin<T>(pluginId: string | PluginConstructor): T;
    getPosition(): Position; // Specify the return type
    getZoomLevel(): number; // Specify the return type
    getSize(): Size; // Specify the return type
    needsUpdate(): void;
    autoSize(): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPanorama(path: any, options?: PanoramaOptions): Promise<boolean>;
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
            props.hideNavbarButton || true,
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
            props.panoData,
            props.requestHeaders,
            props.withCredentials,
            props.keyboard,
            props.plugins,
            props.adapter,
            props.sphereCorrection,
            props.minFov,
            props.maxFov,
            props.defaultZoomLvl,
            props.defaultYaw,
            props.defaultPitch,
            props.caption,
            props.description,
            props.downloadUrl,
            props.downloadName,
            props.loadingImg,
            props.loadingTxt,
            props.rendererParameters,
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
                minFov: options.minFov ?? 30,
                maxFov: options.littlePlanet ? LITTLEPLANET_MAX_ZOOM : options.maxFov ?? 90,
                defaultZoomLvl: options.littlePlanet ? LITTLEPLANET_DEF_ZOOM : options.defaultZoomLvl ?? 50,
                defaultYaw: options.defaultYaw ?? 0,
                defaultPitch: options.littlePlanet ? LITTLEPLANET_DEF_LAT : options.defaultPitch ?? 0,
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
                panoData: options.panoData || {} as PanoData,
                requestHeaders: options.requestHeaders || {},
                withCredentials: options.withCredentials || false,
                navbar: filterNavbar(options.navbar),
                lang: options.lang || {} as keyof Props["lang"],
                keyboard: options.keyboard || "fullscreen",
                plugins: [
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

            const _currentNavbar = filterNavbar(options.navbar)
            if (options.littlePlanet) {
                const littlePlanetIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 11.8805 19.9974 11.7615 19.9922 11.6433C20.2479 11.4141 20.4882 11.1864 20.7118 10.9611C21.0037 10.6672 21.002 10.1923 20.708 9.90049C20.4336 9.628 20.0014 9.61143 19.7077 9.84972C19.4023 8.75248 18.8688 7.75024 18.1616 6.89725C18.4607 6.84611 18.7436 6.8084 19.0087 6.784C19.4212 6.74604 19.7247 6.38089 19.6868 5.96842C19.6488 5.55595 19.2837 5.25235 18.8712 5.29032C18.4474 5.32932 17.9972 5.39638 17.5262 5.48921C17.3267 5.52851 17.1614 5.64353 17.0543 5.79852C15.6765 4.67424 13.917 4 12 4C7.58172 4 4 7.58172 4 12C4 12.2776 4.01414 12.552 4.04175 12.8223C3.78987 12.7532 3.50899 12.8177 3.31137 13.0159C2.97651 13.3517 2.67596 13.6846 2.415 14.0113C2.15647 14.3349 2.20924 14.8069 2.53287 15.0654C2.8565 15.3239 3.32843 15.2711 3.58696 14.9475C3.78866 14.695 4.02466 14.4302 4.2938 14.1557C4.60754 15.2796 5.16056 16.3037 5.8945 17.1697C5.66824 17.3368 5.54578 17.6248 5.60398 17.919C5.68437 18.3253 6.07894 18.5896 6.48528 18.5092C6.7024 18.4662 6.92455 18.4177 7.15125 18.3637C8.49656 19.3903 10.1771 20 12 20ZM7.15125 18.3637C6.69042 18.012 6.26891 17.6114 5.8945 17.1697C5.98073 17.106 6.08204 17.0599 6.19417 17.0377C7.19089 16.8405 8.33112 16.5084 9.55581 16.0486C9.94359 15.903 10.376 16.0994 10.5216 16.4872C10.6671 16.8749 10.4708 17.3073 10.083 17.4529C9.05325 17.8395 8.0653 18.1459 7.15125 18.3637ZM19.7077 9.84972C19.6869 9.86663 19.6667 9.88483 19.6474 9.90431C18.9609 10.5957 18.0797 11.3337 17.0388 12.0753C16.7014 12.3157 16.6228 12.784 16.8631 13.1213C17.1035 13.4587 17.5718 13.5373 17.9091 13.297C18.6809 12.7471 19.3806 12.1912 19.9922 11.6433C19.965 11.0246 19.8676 10.4241 19.7077 9.84972ZM20.9366 5.37924C20.5336 5.28378 20.1294 5.53313 20.034 5.93619C19.9385 6.33925 20.1879 6.74339 20.5909 6.83886C20.985 6.93219 21.1368 7.07125 21.1932 7.16142C21.2565 7.26269 21.3262 7.52732 21.0363 8.10938C20.8516 8.48014 21.0025 8.93042 21.3732 9.1151C21.744 9.29979 22.1943 9.14894 22.379 8.77818C22.7566 8.02003 22.9422 7.12886 22.4648 6.36582C22.1206 5.81574 21.5416 5.52252 20.9366 5.37924ZM2.81481 16.2501C2.94057 15.8555 2.72259 15.4336 2.32793 15.3078C1.93327 15.1821 1.51138 15.4 1.38562 15.7947C1.19392 16.3963 1.17354 17.0573 1.53488 17.6349C1.98775 18.3587 2.84153 18.6413 3.68907 18.7224C4.1014 18.7619 4.46765 18.4596 4.50712 18.0473C4.54658 17.635 4.24432 17.2687 3.83199 17.2293C3.13763 17.1628 2.88355 16.9624 2.80651 16.8393C2.75679 16.7598 2.70479 16.5954 2.81481 16.2501ZM15.7504 14.704C16.106 14.4915 16.2218 14.0309 16.0093 13.6754C15.7967 13.3199 15.3362 13.204 14.9807 13.4166C14.4991 13.7045 13.9974 13.9881 13.4781 14.2648C12.9445 14.5491 12.4132 14.8149 11.8883 15.0615C11.5134 15.2376 11.3522 15.6843 11.5283 16.0592C11.7044 16.4341 12.1511 16.5953 12.526 16.4192C13.0739 16.1618 13.6277 15.8847 14.1834 15.5887C14.7242 15.3005 15.2474 15.0048 15.7504 14.704Z" fill="rgba(255,255,255,.7)"/>
                </svg>`
                const resetLittlePlanetButton = {
                    id: "resetLittlePlanetButton",
                    content: props.lang?.littlePlanetIcon || littlePlanetIcon,
                    title: props.lang?.littlePlanetButton || "Reset Little Planet",
                    className: "resetLittlePlanetButton",
                    onClick: () => {
                        littlePlanetEnabled = true
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
                if (_currentNavbar !== false && !_currentNavbar.find((item) => typeof item === "object" && item?.id === "resetLittlePlanetButton")) {
                    _currentNavbar.splice(1, 0, resetLittlePlanetButton)
                }
            }

            if (options.hideNavbarButton) {
                // add toggle navbar visibility button
                const hideNavbarButton = {
                    id: "hideNavbarButton",
                    content: `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                            <g clip-path="url(#clip0_429_11083)">
                            <path d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006" stroke="rgba(255,255,255,.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_429_11083">
                            <rect width="24" height="24" fill="white"/>
                            </clipPath>
                            </defs>
                            </svg>`,
                    title: "Hide Navbar",
                    className: "hideNavbarButton",
                    onClick: () => {
                        _c.navbar.hide()
                        // add a show navbar button that is always hidden until mouseover
                        const btn = document.createElement("a")
                        btn.className = "showNavbarButton"
                        // add svg icon
                        btn.innerHTML = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 26 26" style="enable-background:new 0 0 26 26;" xml:space="preserve" class="icon icon-back-to-top">
                                        <g>
                                        <path d="M13.8,1.3L21.6,9c0.1,0.1,0.1,0.3,0.2,0.4c0.1,0.1,0.1,0.3,0.1,0.4s0,0.3-0.1,0.4c-0.1,0.1-0.1,0.3-0.3,0.4
                                            c-0.1,0.1-0.2,0.2-0.4,0.3c-0.2,0.1-0.3,0.1-0.4,0.1c-0.1,0-0.3,0-0.4-0.1c-0.2-0.1-0.3-0.2-0.4-0.3L14.2,5l0,19.1
                                            c0,0.2-0.1,0.3-0.1,0.5c0,0.1-0.1,0.3-0.3,0.4c-0.1,0.1-0.2,0.2-0.4,0.3c-0.1,0.1-0.3,0.1-0.5,0.1c-0.1,0-0.3,0-0.4-0.1
                                            c-0.1-0.1-0.3-0.1-0.4-0.3c-0.1-0.1-0.2-0.2-0.3-0.4c-0.1-0.1-0.1-0.3-0.1-0.5l0-19.1l-5.7,5.7C6,10.8,5.8,10.9,5.7,11
                                            c-0.1,0.1-0.3,0.1-0.4,0.1c-0.2,0-0.3,0-0.4-0.1c-0.1-0.1-0.3-0.2-0.4-0.3c-0.1-0.1-0.1-0.2-0.2-0.4C4.1,10.2,4,10.1,4.1,9.9
                                            c0-0.1,0-0.3,0.1-0.4c0-0.1,0.1-0.3,0.3-0.4l7.7-7.8c0.1,0,0.2-0.1,0.2-0.1c0,0,0.1-0.1,0.2-0.1c0.1,0,0.2,0,0.2-0.1
                                            c0.1,0,0.1,0,0.2,0c0,0,0.1,0,0.2,0c0.1,0,0.2,0,0.2,0.1c0.1,0,0.1,0.1,0.2,0.1C13.7,1.2,13.8,1.2,13.8,1.3z"></path>
                                        </g>
                                        </svg>`
                        btn.title = "Show Navbar"
                        btn.onclick = (e) => {
                            e.preventDefault()
                            _c.navbar.show()
                            btn.remove()
                        }

                        // add the button to the viewer container
                        document.body.appendChild(btn)
                    },
                }

                if (_currentNavbar !== false && !_currentNavbar.find((item) => typeof item === "object" && item?.id === "hideNavbarButton")) {
                    _currentNavbar.push(hideNavbarButton)
                }
            }

            if (_currentNavbar !== false) {
                _c.setOption("navbar", _currentNavbar)
                setCurrentNavbar(_currentNavbar as (string | object)[])
            } else {
                _c.navbar.hide()
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
            }).on("zoomIn", (step: number) => {
                _c.zoomIn(step)
            }).on("zoomOut", (step: number) => {
                _c.zoomOut(step)
            }).on("needsContinuousUpdate", (enabled: boolean) => {
                _c.needsContinuousUpdate(enabled)
            }).on("observeObjects", (userDataKey: string) => {
                _c.observeObjects(userDataKey)
            }).on("unobserveObjects", (userDataKey: string) => {
                _c.unobserveObjects(userDataKey)
            }).on("setCursor", (cursor: string) => {
                _c.setCursor(cursor)
            })

            spherePlayerInstance.current = _c
        }
    }, [sphereElement, options])

    useEffect(() => {
        if (spherePlayerInstance.current && options.src) {
            spherePlayerInstance.current.setPanorama(options.src, {})
        }
    }, [options.src])

    const _imperativeHandle = () => ({
        animate(options: AnimateOptions) {
            Emitter.emit("animate", options)
        },
        destroy() {
            Emitter.emit("destroy", {})
        },
        createTooltip(config: TooltipConfig): Tooltip {
            return spherePlayerInstance.current?.createTooltip(config) as Tooltip
        },
        needsContinuousUpdate(enabled: boolean) {
            Emitter.emit("needsContinuousUpdate", enabled)
        },
        observeObjects(userDataKey: string) {
            Emitter.emit("observeObjects", userDataKey)
        },
        unobserveObjects(userDataKey: string) {
            Emitter.emit("unobserveObjects", userDataKey)
        },
        setCursor(cursor: string) {
            Emitter.emit("setCursor", cursor)
        },
        stopAnimation() {
            Emitter.emit("stop-animation", {})
        },
        rotate(position: ExtendedPosition) {
            Emitter.emit("rotate", position)
        },
        setOption(option: keyof UpdatableViewerConfig, value: unknown): void {
            Emitter.emit("setOption", { option, value })
        },
        setOptions(options: Partial<UpdatableViewerConfig>): void {
            return spherePlayerInstance.current?.setOptions(options)
        },
        getCurrentNavbar(): (string | object)[] {
            return currentNavbar
        },
        zoom(value: number) {
            Emitter.emit("zoom", value)
        },
        zoomIn(step: number) {
            Emitter.emit("zoomIn", { step })
        },
        zoomOut(step: number) {
            Emitter.emit("zoomOut", { step })
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
        getPlugin<T>(pluginId: string | PluginConstructor): T {
            return spherePlayerInstance.current?.getPlugin(pluginId) as T
        },
        getPosition(): Position {
            return spherePlayerInstance.current?.getPosition() as Position
        },
        getZoomLevel(): number {
            return spherePlayerInstance.current?.getZoomLevel() as number
        },
        getSize(): Size {
            return spherePlayerInstance.current?.getSize() as Size
        },
        needsUpdate() {
            return spherePlayerInstance.current?.needsUpdate()
        },
        autoSize() {
            return spherePlayerInstance.current?.autoSize()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPanorama(path: any, options?: PanoramaOptions): Promise<boolean> {
            return spherePlayerInstance.current?.setPanorama(path, options) as Promise<boolean>
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
    }) as ViewerAPI
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
    ReactPhotoSphereViewer
}
