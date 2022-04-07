/// <reference path="./hust_motherless.d.ts" />
/// <reference path="./tampermonkey.d.ts" />
// ==UserScript==
// @name         HUST Motherless
// @namespace    https://github.com/dorence
// @version      0.3.3
// @description  For HUST Wireless authorization.
// @author       Dorence DENG
// @match        http://172.18.18.60:8080/eportal/*
// @icon         https://mail.hust.edu.cn/favicon.ico
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
// @ts-check
(function () {
    'use strict';
    // CSS
    GM_addStyle(`
.mls-container {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, .3);
    box-shadow: inset rgba(0, 0, 0, .3) 0 0 3px 0;
    height: 30px;
    margin-top: 10px;
    position: relative;
    width: 281px;
    z-index: 1;
}
.mls-quickfill {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, .3);
    box-shadow: inset rgba(0, 0, 0, .3) 0 0 3px 0;
    height: auto;
    max-height: 150px;
    margin: -1px 0 0 -1px;
    overflow-y: auto;
    position: absolute;
    width: 281px;
}
.mls-quickfill-option {
    padding: 5px 3px 5px 17px;
}
.mls-quickfill-option:hover {
    background-color: #eee;
}
.mls-icon {
    background-repeat: no-repeat;
    background-image: url(http://172.18.18.60:8081/eportal/interface/index_files/pc/portal.png);
    cursor: pointer;
    height: 16px;
    margin-top: 7px;
    position: absolute;
    width: 16px;
}
.s-settings-wrapper {
    align-items: center;
    background-color: rgba(255, 255, 255, .93);
    border: 1px solid #ccc;
    border-radius: 18px;
    box-shadow: 2px 2px 4px #999;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    margin: 20px auto;
    padding: 16px;
    width: 332px;
}
.s-settings-wrapper>div {
    width: 240px;
    margin: 4px;
}
.s-settings-wrapper button {
    background-color: #43cf78;
    border: 1px solid #aaa;
    border-radius: 18px;
    box-shadow: 1px 1px 1px #999;
    color: #fff;
    font-size: 16px;
    height: 36px;
    letter-spacing: 8px;
    text-indent: 8px;
}
.s-settings-wrapper button:hover {
    background-color: #4caf50;
}
.s-settings-wrapper textarea {
    border-radius: 6px;
    box-shadow: 1px 1px 1px #999;
    max-width: 230px;
    min-width: 230px;
    min-height: 60px;
    padding: 10px;
    width: 230px;
}
`);
    // JS
    // @ts-ignore
    /** @type {BigIntConstructor} fxxk! override by security.js */ const BigInt = 0n.constructor;

    // @ts-ignore
    const E = /** @type {typeof GetElementById} @param {string} id */
        function (id) { return id ? document.getElementById(id) : undefined; }

    /** @param {HTMLElement} el */
    function RM(el) { el.parentElement && el.parentElement.removeChild(el); }

    // @ts-ignore
    const hidePassword = /** @type {typeof HidePassword} @param {string | string[]} info @param {boolean} show */
        function (info, show) {
            if (show) return info;
            else if (Array.isArray(info)) return info.map(str => str.replace(/ .*/, ' ****'));
            else if (typeof info === 'string') return info.replace(/ .*/, ' ****');
            else return '[Error]';
        }

    const Account = {
        info: GM_getValue('auth', []).filter(s => !!s),
        index: GM_getValue('index', 0),
        showPassword: GM_getValue('show-password', true),
        get value() {
            if (!Array.isArray(this.info) || this.info.length === 0) {
                this.info = [];
                return '[请前往脚本设置添加账户]';
            }
            if (typeof this.index !== 'number' || this.index >= this.info.length) {
                this.index = this.info.length - 1;
            }
            return hidePassword(this.info[this.index], this.showPassword);
        },
        get list() {
            return hidePassword(this.info, this.showPassword)
                .map((v, i) => `<div class="mls-quickfill-option" data-i="${i}">${v}</div>`)
                .join('');
        },
    }

    // Tampermonkey Menu
    GM_registerMenuCommand('设置 Settings', () => {
        const suffix = 's-settings';
        if (E(suffix + '-container')) {
            return; // div exists
        }
        document.body.insertAdjacentHTML('afterbegin', `
<div id="${suffix}-container" style="position: fixed; width: 100%; z-index: 1;">
    <div class="${suffix}-wrapper">
        <div>
            <label for="${suffix}-show-password">是否显示密码</label>
            <input type="checkbox" id="${suffix}-show-password" style="margin-left: 120px;" ${Account.showPassword ? 'checked' : ''} />
        </div>
        <div>
            <label for="${suffix}-auth">用户名 密码（每行一个）</label>
        </div>
        <div>
            <textarea id="${suffix}-auth" rows="${Math.max(Account.info.length, 5)}">${Account.info.join('\n')}</textarea>
        </div>
        <div style="display: flex; justify-content: center;">
            <button id="${suffix}-close" style="width: 200px;"><span>&nbsp;关闭&nbsp;</span></button>
        </div>
    </div>
</div>
`);
        // block event of clicking ENTER
        E(suffix + '-container').addEventListener('keyup', (ev) => { ev.stopImmediatePropagation(); });
        E(suffix + '-close').addEventListener('click', () => { RM(E(suffix + '-container')); });
        E(suffix + '-show-password').addEventListener('change', (ev) => {
            // @ts-ignore
            /** @type {boolean} */ const checked = ev.target.checked
            console.log('[show-password]', checked);
            Account.showPassword = checked;
            GM_setValue('show-password', Account.showPassword);
            if (E('mlsQuickfill')) {
                E('mlsInput').value = Account.value;
                E('mlsQuickfill').innerHTML = Account.list;
            }
        });
        E(suffix + '-auth').addEventListener('change', (ev) => {
            // @ts-ignore
            /** @type {string} */ const value = ev.target.value
            console.log('[auth]', value);
            Account.info = value.split('\n').filter(s => !!s)
            console.log(Account.info);
            GM_setValue('auth', Account.info);
            if (E('mlsQuickfill')) {
                E('mlsInput').value = Account.value;
                E('mlsQuickfill').innerHTML = Account.list;
            }
        });
    });

    GM_registerMenuCommand('登出 Logout', () => {
        unsafeWindow.location = 'logout.jsp';
    });

    // imgRecJs, modified
    /** @type {ImgRecJsConfig} */
    const RCFG = {
        DarkThreshold: 400,
        Debug: true,
        DiffThreshold: 16,
        PaddedWidth: 14,
        TotalDigits: 4,
        ZoomedHeight: 20,
    };

    const canvas1 = document.createElement("canvas");
    const ctx1 = canvas1.getContext("2d");

    const canvas2 = document.createElement("canvas");
    const ctx2 = canvas2.getContext("2d");

    const canvas3 = document.createElement("canvas");
    const ctx3 = canvas3.getContext("2d");

    if (RCFG.Debug) {
        canvas1.style.backgroundColor = canvas2.style.backgroundColor = canvas3.style.backgroundColor = "cornsilk";
    } else {
        canvas1.style.display = canvas2.style.display = canvas3.style.display = "none";
    }

    document.body.appendChild(canvas1);
    document.body.appendChild(canvas2);
    document.body.appendChild(canvas3);

    /**
     * Init imgRecJs
     * @param {HTMLImageElement} img 
     * @returns {[number, number]}
     */
    function initAll(img) {
        if (!img) {
            console.error('invalid image', img);
            return;
        }
        const w = img.naturalWidth || img.clientWidth;
        const h = img.naturalHeight || img.clientHeight;
        console.log('w', w, 'h', h);
        if (RCFG.Debug) debugger;
        canvas1.width = canvas2.width = w;
        canvas1.height = canvas2.height = h;
        canvas3.width = RCFG.PaddedWidth * RCFG.TotalDigits;
        canvas3.height = RCFG.ZoomedHeight;
        return [w, h];
    }

    // updated on 2022-04-07
    /** @type {[number, SigArray][]} features */
    const numkeys = [
        [1, [24n, 248n, 504n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 56n, 511n]],
        [2, [1008n, 2040n, 3132n, 4126n, 4110n, 14n, 14n, 14n, 12n, 28n, 24n, 56n, 112n, 96n, 64n, 256n, 769n, 1539n, 4094n, 8190n]],
        [3, [504n, 1020n, 30n, 14n, 14n, 14n, 12n, 24n, 120n, 508n, 62n, 15n, 15n, 7n, 7n, 7n, 6n, 3084n, 3864n, 2016n]],
        [4, [24n, 56n, 120n, 120n, 184n, 184n, 56n, 568n, 568n, 1080n, 1080n, 2104n, 6200n, 8191n, 8191n, 56n, 56n, 56n, 56n, 56n]],
        [5, [127n, 254n, 254n, 256n, 256n, 960n, 1008n, 2044n, 126n, 30n, 15n, 7n, 3n, 3n, 3n, 2n, 6n, 524n, 2040n, 992n]],
        [6, [15n, 56n, 224n, 448n, 896n, 1792n, 1536n, 3584n, 3320n, 7964n, 7182n, 7183n, 7175n, 7175n, 7175n, 3079n, 3590n, 1550n, 796n, 496n]],
        [7, [2047n, 4095n, 4094n, 2054n, 12n, 12n, 12n, 24n, 24n, 24n, 48n, 48n, 48n, 96n, 96n, 96n, 192n, 192n, 192n, 384n]],
        [8, [248n, 910n, 775n, 1799n, 1799n, 1799n, 1934n, 972n, 496n, 240n, 248n, 444n, 798n, 1807n, 1799n, 1799n, 1799n, 774n, 910n, 248n]],
        [9, [496n, 1816n, 3596n, 3086n, 7174n, 7175n, 7175n, 7175n, 7687n, 3591n, 1807n, 1022n, 14n, 12n, 28n, 56n, 112n, 224n, 896n, 7680n]],
        [0, [240n, 792n, 1548n, 1550n, 3590n, 3078n, 7175n, 7175n, 7175n, 7175n, 7175n, 7175n, 7175n, 7175n, 3078n, 3598n, 3598n, 1548n, 792n, 480n]],
    ];

    /**
     * Draw given PixelData
     * @param {CanvasRenderingContext2D} ctx 
     * @param {PixelData} pixels 
     */
    function drawPixels(ctx, pixels, dx = 0) {
        var imageData = pixelToImage(pixels);
        ctx.putImageData(imageData, dx, 0, 0, 0, imageData.width, imageData.height);
    }

    /**
     * 二值化图像
     * @param {ImageData} imageData 
     * @returns {ImageData}
     */
    function toHex(imageData) {
        const [w, h, idata] = [imageData.width, imageData.height, imageData.data];
        let greyAvg = 0;
        for (let j = 0; j < w * h; j++) {
            const base = j << 2;
            const [r, g, b] = [idata[base], idata[base + 1], idata[base + 2]];
            greyAvg += r * 0.299 + g * 0.587 + b * 0.114;
        }
        greyAvg /= w * h / 3; // 3x average gray
        for (let j = 0; j < w * h; j++) {
            const base = j << 2;
            const [r, g, b] = [idata[base], idata[base + 1], idata[base + 2]];
            const grey = (r + g + b > greyAvg) ? 255 : 0; // average grey
            idata[4 * j] = idata[4 * j + 1] = idata[4 * j + 2] = grey;
        }
        return imageData;
    }

    /**
     * Simple corrosion
     * @param {PixelData} fromArray 
     * @returns 
     */
    function corrode(fromArray) {
        for (var j = 1; j < fromArray.length - 1; j++) {
            for (var k = 1; k < fromArray[j].length - 1; k++) {
                if (fromArray[j][k] == 1 && fromArray[j - 1][k] + fromArray[j + 1][k] + fromArray[j][k - 1] + fromArray[j][k + 1] == 0) {
                    fromArray[j][k] = 0;
                }
            }
        }
        return fromArray;
    }

    /**
     * Simple expansion
     * @param {PixelData} fromArray 
     * @returns 
     */
    function expand(fromArray) {
        for (var j = 1; j < fromArray.length - 1; j++) {
            for (var k = 1; k < fromArray[j].length - 1; k++) {
                if (fromArray[j][k] == 0 && fromArray[j - 1][k] + fromArray[j + 1][k] + fromArray[j][k - 1] + fromArray[j][k + 1] == 4) {
                    fromArray[j][k] = 1;
                }
            }
        }
        return fromArray;
    }

    /**
     * split with `count`-th digit
     * @param {PixelData} pixels
     * @param {number} count
     * @returns {PixelData}
     */
    function split(pixels, count) {
        let w = pixels[0].length;
        let currNum = 0;
        let status = false;
        let start = 0, end = w;
        for (let x = 0; x < w; x++) {
            if (pixels.every(v => v[x] === 0)) {
                if (status && currNum === count) end = x;

                status = false;
            }
            else {
                if (!status && (++currNum === count)) start = x;
                status = true;
            }
        }
        return pixels.map(row => row.slice(start, end));
    }

    /**
     * 清除上下的空白
     * @param {PixelData} pixels 
     * @returns {PixelData}
     */
    function trimUpDown(pixels) {
        while (pixels.length && pixels[0].every(v => v === 0)) {
            pixels.splice(0, 1);
        }
        while (pixels.length && pixels[pixels.length - 1].every(v => v === 0)) {
            pixels.splice(pixels.length - 1, 1);
        }
        return pixels;
    }

    /**
     * 尺寸归一化 PaddedWidth * ZoomedHeight
     * @param {PixelData} pixels 
     * @returns 
     */
    function fitImage(pixels) {
        const imageData = pixelToImage(pixels);

        const tmpCanvas1 = document.createElement("canvas");
        const tmpCtx1 = tmpCanvas1.getContext("2d");
        tmpCanvas1.width = pixels[0].length;
        tmpCanvas1.height = pixels.length;
        tmpCtx1.putImageData(imageData, 0, 0);

        const tmpCanvas2 = document.createElement("canvas");
        const tmpCtx2 = tmpCanvas2.getContext("2d");

        if (tmpCanvas1.width <= RCFG.PaddedWidth) {
            tmpCtx2.fillStyle = 'white';
            tmpCtx2.fillRect(0, 0, RCFG.PaddedWidth, RCFG.ZoomedHeight);
            tmpCtx2.drawImage(tmpCanvas1, RCFG.PaddedWidth - tmpCanvas1.width, 0, tmpCanvas1.width, RCFG.ZoomedHeight);
        }
        else {
            tmpCtx2.drawImage(tmpCanvas1, 0, 0, RCFG.PaddedWidth, RCFG.ZoomedHeight);
        }

        const fitImageData = tmpCtx2.getImageData(0, 0, RCFG.PaddedWidth, RCFG.ZoomedHeight);
        return imageToPixel(fitImageData);
    }

    /**
     * 生成特征码
     * @param {PixelData} pixels 
     * @returns {SigArray}
     */
    function getCode(pixels) {
        return pixels.map(row => BigInt('0b' + row.join('')));
    }

    /**
     * Convert ImageData to ImageBitData
     * @param {ImageData} imageData original ImageDate
     * @param {number?} resizeWidth resize to this width
     * @param {number?} resizeHeight resize to this height
     * @returns {PixelData} pixels
     */
    function imageToPixel(imageData, resizeWidth = undefined, resizeHeight = undefined) {
        const w = resizeWidth || imageData.width;
        const h = resizeHeight || imageData.height;
        const idata = imageData.data;
        /** @type {PixelData} */ let pixels = new Array(h);
        for (let y = 0; y < h; y++) {
            pixels[y] = new Array(w);
            const baseY = y * w;
            for (let x = 0; x < w; x++) {
                const base = (baseY + x) << 2;
                const [r, g, b] = [idata[base], idata[base + 1], idata[base + 2]];
                pixels[y][x] = (r + g + b) > RCFG.DarkThreshold ? 0 : 1;
            }
        }
        return pixels;
    }

    /**
     * Convert PixelData to ImageData
     * @param {PixelData} pixels original pixels
     * @param {number?} resizeWidth resize to this width
     * @param {number?} resizeHeight resize to this height
     * @returns {ImageData} ImageDate
     */
    function pixelToImage(pixels, resizeWidth = undefined, resizeHeight = undefined) {
        const w = resizeWidth || pixels[0].length;
        const h = resizeHeight || pixels.length;
        const imageData = ctx1.createImageData(w, h);
        let idata = imageData.data;
        for (let y = 0; y < h; y++) {
            const baseY = y * w;
            for (let x = 0; x < w; x++) {
                const base = (baseY + x) << 2;
                const grey = pixels[y][x] ? 0 : 255;
                idata[base] = idata[base + 1] = idata[base + 2] = grey;
                idata[base + 3] = 255;
            }
        }
        return imageData;
    }

    /**
     * Preprocess single digit
     * @param {PixelData} pixels
     * @param {number} num
     */
    function preProcessNumber(pixels, num) {
        let arr = split(pixels, num + 1); // 切割
        arr = corrode(arr); // 腐蚀
        arr = expand(arr); // 膨胀
        arr = trimUpDown(arr); // 去上下空白
        arr = fitImage(arr);
        console.log(arr);
        drawPixels(ctx3, arr, num * RCFG.PaddedWidth); // 画出缩放图像
        return getCode(arr); // 生成特征码
    }

    /**
     * calculate difference
     * @param {SigArray} sig 
     * @param {SigArray} feature 
     */
    function calcDiff(sig, feature) {
        if (sig.length !== feature.length) {
            console.error('[calcDiff] length not equal');
        }
        let diff = 0;
        for (let k = 0; k < feature.length; k++) {
            let x = feature[k] ^ sig[k];
            while (x) {
                if (!(x & 1n)) diff++;
                x >>= 1n;
            }
        }
        return diff;
    }

    /**
     * read picture number by comparing
     * @param {SigArray} sig
     */
    function readNum(sig) {
        let minDiff = Infinity;
        let answer = 0;
        for (const key of numkeys) {
            const diff = calcDiff(sig, key[1]);
            if (diff < minDiff) {
                answer = key[0];
                minDiff = diff;
            }
            if (diff === 0) {
                break;
            }
        }
        console.log('Diff', answer, minDiff, sig);
        if (minDiff >= RCFG.DiffThreshold) {
            console.warn(`[${answer}, [${sig.map(k => k + 'n').join(', ')}]],`);
        }
        return answer;
    }

    /** check too closed features */
    function checkFeature() {
        const len = numkeys.length;
        for (let i = 0; i < len - 1; i++) {
            for (let j = i + 1; j < len; j++) {
                const diff = calcDiff(numkeys[i][1], numkeys[j][1]);
                if (diff < RCFG.DiffThreshold) {
                    console.group()
                    console.warn(`Too close: ${i}@${numkeys[i][0]} | ${j}@${numkeys[j][0]} = ${diff}`)
                    console.warn(`[${numkeys[i][0]}, [${numkeys[i][1].map(k => k + 'n').join(', ')}]],`);
                    console.warn(`[${numkeys[j][0]}, [${numkeys[j][1].map(k => k + 'n').join(', ')}]],`);
                    console.groupEnd()
                }
            }
        }
    }

    /** main */
    /** index.jsp */
    function mainIndex() {
        console.log('run mainIndex');

        E('connectNetworkPageId').insertAdjacentHTML('afterbegin', `
<div class="mls-container" id="mlsDiv">
    <input class="input" id="mlsInput" placeholder="paste here...">
    <div class="mls-quickfill" id="mlsQuickfill" style="display: none;">${Account.list}</div>
    <div style="float: left;" id="mlsClear">
        <span class="mls-icon" style="right: 8px; background-position: -339px -101px;" />
    </div>
    <div style="float: left;" id="aauth">
        <span class="mls-icon" style="right: -24px; background-position: -322px -101px;" />
    </div>
</div>
`);

        let clickFlag = true; // 点击其他地方隐藏下拉框

        E('mlsInput').value = Account.value;
        E('mlsInput').addEventListener("focus", function () { E('mlsQuickfill').style.display = "block"; });
        E('mlsQuickfill').addEventListener("click", function (event) {
            // @ts-ignore
            /** @type {{i: string}} */ const dataset = event.target.dataset
            console.log('[click]', dataset);
            const i = Number(dataset.i);
            if (isNaN(i)) {
                return;
            }
            Account.index = i;
            GM_setValue('index', Account.index);
            E('mlsInput').value = Account.value;
            E('mlsQuickfill').style.display = "none";
            clickFlag = true;
        });
        E('mlsDiv').addEventListener("click", function () { clickFlag = false });

        document.body.addEventListener("click", function () {
            if (clickFlag) {
                E('mlsQuickfill').style.display = "none";
            }
            clickFlag = true;
        });

        function imcrack() {
            const img = E('validImage');
            console.log('imcrack', img.src);
            if (/^.*\/validcode\?rnd=.*$/.test(img.src)) {
                const [w, h] = initAll(img); // 初始化
                ctx1.drawImage(img, 0, 0, w, h); // 画出原图
                let imageData = ctx1.getImageData(0, 0, w, h); // 读取图像数据
                imageData = toHex(imageData); // 二值化
                ctx2.putImageData(imageData, 0, 0, 0, 0, w, h); // 画出二值化图
                let pixels = imageToPixel(imageData); // 将图片数据转化为数组
                pixels = corrode(pixels); // 腐蚀
                pixels = expand(pixels); // 膨胀
                /** @type {SigArray[]} */ let nums = new Array(RCFG.TotalDigits); // 分割、处理并保存
                for (let c = 0; c < RCFG.TotalDigits; c++) {
                    nums[c] = preProcessNumber(pixels, c);
                }
                const res = nums.map(e => readNum(e)).join(''); // 根据特征码识别
                console.warn(res);
                return res;
            }
        }

        E('mlsClear').onclick = function () { E('mlsInput').value = null; };
        E('aauth').onclick = function () {
            let v = E('mlsInput').value;
            if (typeof v !== 'string') {
                return;
            }
            if (v === Account.value) {
                v = Account.info[Account.index];
            }
            const accountInfo = v.split(/[\t ,]/).filter(s => !!s);
            if (accountInfo.length <= 1) {
                return;
            }
            E('username_tip').focus();
            E('username').value = accountInfo[0];
            E('pwd_tip').focus();
            E('pwd').value = accountInfo[1];
            if (E('isDisplayValidCode').style.display !== 'none') {
                E('validCode_tip').focus();
                E('validCode').value = imcrack();
            }
            if (RCFG.Debug) debugger;
            else unsafeWindow.doauthen();
        };

        unsafeWindow.captcha = { checkFeature, imcrack, numkeys, config: RCFG };
        setTimeout(() => {
            checkFeature();
        }, 100);
    }

    /** success.jsp */
    function mainSuccess() {
        E('toLogOut').onclick = unsafeWindow.sureLogout;
    }

    /** logout.jsp */
    function mainLogout() {
        setTimeout(() => {
            unsafeWindow.location = 'gologout.jsp';
        }, 100);
    }

    switch (location.pathname) {
        case '/eportal/index.jsp': mainIndex(); break;
        case '/eportal/success.jsp': mainSuccess(); break;
        case '/eportal/logout.jsp': mainLogout(); break;
        default: console.warn('Unknown page', location.pathname);
    }
})();