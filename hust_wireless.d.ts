/** extends tampermonkey window */
interface UnsafeWindow extends Window {
    captcha: any
    doauthen(): void
    sureLogout(): void
}
const unsafeWindow: UnsafeWindow;

/** extends tampermonkey storage */
function GM_getValue(key: 'auth', defaults: string[]): string[];
function GM_getValue(key: 'index', defaults: number): number;
function GM_getValue(key: 'show-password', defaults: boolean): boolean;

function GM_setValue(key: 'auth', defaults: string[]): void;
function GM_setValue(key: 'index', defaults: number): void;
function GM_setValue(key: 'show-password', defaults: boolean): void;

/** utilities */
interface DomElementMap {
    'mlsInput': HTMLInputElement
    'pwd': HTMLInputElement
    'username': HTMLInputElement
    'validCode': HTMLInputElement
    'validImage': HTMLImageElement
}
function GetElementById<T extends keyof DomElementMap>(s: T): DomElementMap[T];
function GetElementById(s: string): HTMLElement;

function HidePassword(info: string, show: boolean): string;
function HidePassword(info: string[], show: boolean): string[];

/** (x,y) array */
type PixelData = (0 | 1)[][];

/** sig array */
type SigArray = bigint[];

interface ImgRecJsConfig {
    DarkThreshold: 400
    /** debug mode */
    Debug: boolean
    DiffThreshold: 16
    /** width after padding */
    PaddedWidth: 14
    /** captcha's digits */
    TotalDigits: 4
    /** height after zooming */
    ZoomedHeight: 20
}
