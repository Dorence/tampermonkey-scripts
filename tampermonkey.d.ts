declare function GM_addStyle(css: string): void;
declare function GM_getValue(key: string, defaults: any): any;
declare function GM_registerMenuCommand(title: string, cb: Function): void;
declare function GM_setValue(key: string, value: any): void;

declare interface UnsafeWindow extends (Window & typeof globalThis) {
    location: Location | string,
};
