// ==UserScript==
// @name         HUST Motherless
// @namespace    https://github.com/dorence
// @version      0.3
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

(function () {
    'use strict';
    // CSS code
    GM_addStyle(`
.mless-container {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, .3);
    box-shadow: inset rgba(0, 0, 0, .3) 0 0 3px 0;
    height: 30px;
    margin-top: 10px;
    position: relative;
    width: 281px;
    z-index: 1;
}
.mless-quickfill {
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
.mless-quickfill-option {
    padding: 5px 3px 5px 17px;
}
.mless-quickfill-option:hover {
    background-color: #eee;
}
.mless-icon {
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
    // JS lib
    const BigInt = 0n.constructor; // fxxk! override by security.js
    function E(id) { return id ? document.getElementById(id) : undefined; }
    function RM(el) { el.parentElement && el.parentElement.removeChild(el); }
    // account
    function hidePassword(val, show) {
        if (show) {
            return val;
        }
        else if (Array.isArray(val)) {
            return val.map(str => str.replace(/ .*/, ' ****'));
        }
        else if (typeof val === 'string') {
            return val.replace(/ .*/, ' ****');
        }
        else {
            return '[Error]';
        }
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
                .map((v, i) => `<div class="mless-quickfill-option" data-i="${i}">${v}</div>`)
                .join('');
        },
    };

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
        E(suffix + '-container').addEventListener('keyup', (ev) => { ev.stopImmediatePropagation(); }); // block event of clicking ENTER
        E(suffix + '-close').addEventListener('click', () => { RM(E(suffix + '-container')) });
        E(suffix + '-show-password').addEventListener('change', (ev) => {
            console.log('show-password', ev.target.checked);
            Account.showPassword = ev.target.checked;
            GM_setValue('show-password', Account.showPassword);
            if (E('aquickfill')) {
                E('ainput').value = Account.value;
                E('aquickfill').innerHTML = Account.list;
            }
        });
        E(suffix + '-auth').addEventListener('change', (ev) => {
            console.log('auth', ev.target.value);
            Account.info = ev.target.value.split('\n').filter(s => !!s)
            console.log(Account.info);
            GM_setValue('auth', Account.info);
            if (E('aquickfill')) {
                E('ainput').value = Account.value;
                E('aquickfill').innerHTML = Account.list;
            }
        });
    });

    GM_registerMenuCommand('登出 Logout', () => {
        window.location = 'logout.jsp';
    });
    // JS code
    /** imgRecJs, modified */
    // init.js
    var WIDTH;
    var HEIGHT;

    var canvas1 = document.createElement("canvas");
    canvas1.style.backgroundColor = "cornsilk";
    var ctx1 = canvas1.getContext("2d");

    var canvas2 = document.createElement("canvas");
    canvas2.style.backgroundColor = "cornsilk";
    var ctx2 = canvas2.getContext("2d");

    var canvas3 = document.createElement("canvas");
    canvas3.style.backgroundColor = "cornsilk";
    var ctx3 = canvas3.getContext("2d");

    canvas1.width = canvas2.width = canvas3.width = 0;
    canvas1.height = canvas2.height = canvas3.height = 0;
    canvas1.style.display = canvas2.style.display = canvas3.style.display = "none";

    document.getElementsByTagName("body")[0].appendChild(canvas1);
    document.getElementsByTagName("body")[0].appendChild(canvas2);
    document.getElementsByTagName("body")[0].appendChild(canvas3);

    function initAll(img) {
        if (!img) {
            console.error('invalid image', img);
            return;
        }
        WIDTH = canvas1.width = canvas2.width = canvas3.width = img.clientWidth;
        HEIGHT = canvas1.height = canvas2.height = canvas3.height = img.clientHeight;
        console.log('w', WIDTH, 'h', HEIGHT);
    }

    // keys.js, 20220203
    const numkeys = [
        [0, [8160n, 65520n, 123388n, 254078n, 516222n, 1032254n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032318n, 516222n, 516222n, 254460n, 65520n, 32640n]],
        [0, [8160n, 65520n, 123388n, 254078n, 516222n, 1040446n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1040511n, 516222n, 516222n, 254460n, 65520n, 32640n]],
        [0, [8160n, 65520n, 129148n, 254014n, 516158n, 516127n, 1032223n, 1032223n, 1032223n, 1032223n, 1032223n, 1032223n, 1032223n, 1032223n, 516127n, 516158n, 516158n, 260220n, 65520n, 32640n]],
        [0, [8160n, 65520n, 129532n, 254078n, 516222n, 1040447n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1032255n, 1040511n, 516222n, 516222n, 260604n, 65520n, 32640n]],
        [1, [960n, 524224n, 1048512n, 1048512n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 262143n, 1048575n]],
        [1, [4032n, 524224n, 1048512n, 1048512n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 16320n, 1048575n, 1048575n]],
        [2, [65504n, 262128n, 524284n, 984062n, 786686n, 524414n, 126n, 124n, 120n, 496n, 496n, 960n, 3968n, 3584n, 15360n, 63495n, 126991n, 524287n, 1048574n, 1048574n]],
        [2, [65504n, 262128n, 524284n, 1032702n, 917630n, 786494n, 62n, 60n, 120n, 496n, 496n, 992n, 4032n, 3968n, 15872n, 64513n, 129031n, 524287n, 1048574n, 1048574n]],
        [2, [65504n, 262128n, 524284n, 1032702n, 917630n, 786558n, 126n, 124n, 120n, 496n, 496n, 992n, 4032n, 3968n, 15872n, 64513n, 129031n, 524287n, 1048574n, 1048574n]],
        [2, [65504n, 262128n, 524284n, 1033214n, 917758n, 786558n, 126n, 124n, 120n, 496n, 496n, 960n, 3968n, 3840n, 15872n, 64519n, 129039n, 524287n, 1048574n, 1048574n]],
        [2, [65504n, 262128n, 524284n, 1033214n, 917758n, 786558n, 126n, 124n, 120n, 496n, 496n, 992n, 4032n, 3968n, 15872n, 64519n, 129039n, 524287n, 1048574n, 1048574n]],
        [3, [65520n, 131064n, 524286n, 918014n, 524542n, 254n, 508n, 4080n, 8176n, 65528n, 2046n, 255n, 255n, 255n, 63n, 63n, 917759n, 1032696n, 1048560n, 524160n]],
        [3, [65520n, 131064n, 524286n, 1016062n, 917758n, 254n, 252n, 2032n, 4080n, 65528n, 2046n, 511n, 255n, 63n, 31n, 31n, 1015871n, 1044728n, 1048560n, 524160n]],
        [3, [65520n, 131064n, 524286n, 1016318n, 917758n, 254n, 252n, 2032n, 4080n, 65528n, 2046n, 255n, 255n, 63n, 63n, 63n, 1016063n, 1044984n, 1048560n, 524160n]],
        [4, [112n, 496n, 1008n, 2032n, 4080n, 7664n, 14832n, 61936n, 57840n, 115184n, 115184n, 492016n, 1016304n, 1048575n, 1048575n, 262143n, 496n, 496n, 496n, 496n]],
        [4, [112n, 496n, 2032n, 4080n, 4080n, 8176n, 16368n, 62448n, 58352n, 115696n, 115696n, 492528n, 1017840n, 1048575n, 1048575n, 1048575n, 1008n, 1008n, 1008n, 496n]],
        [4, [496n, 1008n, 4080n, 4080n, 8176n, 16368n, 32752n, 62448n, 58352n, 115696n, 115696n, 492528n, 1017840n, 1048575n, 1048575n, 1048575n, 1008n, 1008n, 1008n, 1008n]],
        [4, [496n, 1008n, 4080n, 4080n, 8176n, 16368n, 65520n, 62448n, 58352n, 115696n, 115696n, 492528n, 1017840n, 1048575n, 1048575n, 1048575n, 1008n, 1008n, 1008n, 1008n]],
        [5, [16383n, 32767n, 65534n, 131068n, 130048n, 262016n, 524280n, 1048572n, 16382n, 1022n, 511n, 127n, 31n, 15n, 15n, 31n, 229502n, 1048568n, 1048544n, 524032n]],
        [5, [16383n, 32767n, 65534n, 131068n, 258048n, 523776n, 1048544n, 1048568n, 16380n, 1022n, 511n, 127n, 127n, 31n, 31n, 63n, 131326n, 1048568n, 1048544n, 524032n]],
        [5, [16383n, 32767n, 65534n, 131068n, 261120n, 524160n, 524280n, 1048568n, 16380n, 1022n, 511n, 127n, 31n, 31n, 31n, 63n, 229630n, 1048568n, 1048544n, 524032n]],
        [5, [16383n, 32767n, 65534n, 131068n, 261120n, 524160n, 1048544n, 1048568n, 16380n, 1022n, 511n, 127n, 31n, 31n, 31n, 63n, 229630n, 1048568n, 1048544n, 524032n]],
        [6, [63n, 511n, 4080n, 16256n, 32256n, 130048n, 126976n, 518128n, 524272n, 1047032n, 1032318n, 1032255n, 1032255n, 1032223n, 1032223n, 516127n, 516159n, 260222n, 65532n, 32736n]],
        [6, [63n, 511n, 4080n, 16256n, 32256n, 130048n, 126976n, 518128n, 524272n, 1047032n, 1032318n, 1032255n, 1032255n, 1032223n, 1032223n, 1040415n, 516159n, 260222n, 65532n, 32736n]],
        [6, [127n, 1023n, 8176n, 32640n, 130560n, 130048n, 520192n, 518080n, 524272n, 1047032n, 1032318n, 1032319n, 1032255n, 1032255n, 1032255n, 1040447n, 516223n, 260606n, 65532n, 32736n]],
        [7, [131071n, 524287n, 524287n, 524286n, 983100n, 786488n, 120n, 496n, 496n, 496n, 480n, 992n, 992n, 1984n, 3968n, 3968n, 7936n, 7936n, 7936n, 15360n]],
        [7, [131071n, 524287n, 524287n, 1048574n, 917628n, 524408n, 504n, 496n, 496n, 496n, 992n, 992n, 1984n, 3968n, 3968n, 7936n, 7936n, 7936n, 16128n, 31744n]],
        [7, [131071n, 524287n, 524287n, 1048574n, 983100n, 786488n, 120n, 496n, 496n, 496n, 992n, 992n, 992n, 1984n, 3968n, 8064n, 7936n, 7936n, 7936n, 15360n]],
        [7, [131071n, 524287n, 524287n, 1048574n, 983164n, 786552n, 120n, 496n, 496n, 496n, 992n, 992n, 2016n, 4032n, 3968n, 8064n, 7936n, 7936n, 7936n, 15360n]],
        [7, [131071n, 524287n, 524287n, 1048574n, 983164n, 786552n, 120n, 496n, 496n, 496n, 992n, 992n, 2016n, 4032n, 3968n, 8064n, 7936n, 7936n, 16128n, 31744n]],
        [8, [32736n, 524286n, 516351n, 1040511n, 1040511n, 1040639n, 1044991n, 523768n, 131008n, 32704n, 32736n, 131064n, 520190n, 1041407n, 1040639n, 1040511n, 1040511n, 516350n, 524286n, 32736n]],
        [8, [32736n, 524286n, 516351n, 1040511n, 1040511n, 1040639n, 1044991n, 524280n, 131008n, 32704n, 32736n, 131064n, 517118n, 1041407n, 1040639n, 1040511n, 1040511n, 516350n, 524286n, 32736n]],
        [8, [32736n, 524286n, 520319n, 1040415n, 1040415n, 1044543n, 1047679n, 524280n, 131008n, 32704n, 32736n, 131064n, 517118n, 1040639n, 1040447n, 1040415n, 1040415n, 520318n, 524286n, 32736n]],
        [8, [32736n, 524286n, 520447n, 1040511n, 1040511n, 1044607n, 1046783n, 523768n, 131008n, 32704n, 32736n, 131064n, 517118n, 1040639n, 1040511n, 1040511n, 1040511n, 520446n, 524286n, 32736n]],
        [9, [32736n, 262128n, 516604n, 1032318n, 1032319n, 1032255n, 1032255n, 1032255n, 1040447n, 516159n, 129151n, 65534n, 65534n, 248n, 1016n, 2032n, 8160n, 65408n, 1047552n, 1032192n]],
        [9, [32736n, 262128n, 516604n, 1032318n, 1032319n, 1032255n, 1032255n, 1032255n, 1040447n, 516159n, 129151n, 65534n, 65534n, 248n, 1016n, 2040n, 8160n, 65408n, 1047552n, 1040384n]],
        [9, [32736n, 262128n, 522364n, 1040446n, 1032255n, 1032223n, 1032223n, 1032223n, 1040415n, 516127n, 129087n, 65534n, 16382n, 62n, 248n, 1016n, 2016n, 16256n, 1047552n, 1040384n]],
        [9, [32736n, 262128n, 522748n, 1040510n, 1032319n, 1032255n, 1032255n, 1032255n, 1040447n, 516159n, 129151n, 65534n, 16382n, 254n, 1016n, 2040n, 8160n, 65408n, 1047552n, 1040384n]],
    ];

    // output.js
    function drawThis(toCtx, fromImg) {
        toCtx.drawImage(fromImg, 0, 0, fromImg.width, fromImg.height);
    }

    function drawArray(ctx, arr) {
        var fromImageData = fromXY(arr);
        ctx.putImageData(fromImageData, 0, 0, 0, 0, WIDTH, HEIGHT);
    }

    // canvas.js
    function toHex(fromImgData) {//二值化图像
        const pixels = fromImgData.data;
        let greyAvg = 0;
        for (let j = 0; j < WIDTH * HEIGHT; j++) {
            var r = pixels[4 * j];
            var g = pixels[4 * j + 1];
            var b = pixels[4 * j + 2];
            greyAvg += r * 0.3 + g * 0.59 + b * 0.11;
        }
        greyAvg /= WIDTH * HEIGHT / 3; // 3x average gray
        for (let j = 0; j < WIDTH * HEIGHT; j++) {
            r = pixels[4 * j];
            g = pixels[4 * j + 1];
            b = pixels[4 * j + 2];
            const grey = (r + g + b > greyAvg) ? 255 : 0; // average grey
            pixels[4 * j] = pixels[4 * j + 1] = pixels[4 * j + 2] = grey;
        }
        return fromImgData;
    }//二值化图像

    function corrode(fromArray) {
        for (var j = 1; j < fromArray.length - 1; j++) {
            for (var k = 1; k < fromArray[j].length - 1; k++) {
                if (fromArray[j][k] == 1 && fromArray[j - 1][k] + fromArray[j + 1][k] + fromArray[j][k - 1] + fromArray[j][k + 1] == 0) {
                    fromArray[j][k] = 0;
                }
            }
        }
        return fromArray;
    }//腐蚀（简单）

    function expand(fromArray) {
        for (var j = 1; j < fromArray.length - 1; j++) {
            for (var k = 1; k < fromArray[j].length - 1; k++) {
                if (fromArray[j][k] == 0 && fromArray[j - 1][k] + fromArray[j + 1][k] + fromArray[j][k - 1] + fromArray[j][k + 1] == 4) {
                    fromArray[j][k] = 1;
                }
            }
        }
        return fromArray;
    }//膨胀（简单）

    function split(fromArray, count) {
        var numNow = 0;
        var status = false;

        var w = fromArray[0].length;
        for (var k = 0; k < w; k++) {//遍历图像
            var sumUp = 0;
            for (var j = 0; j < fromArray.length; j++) {//检测整列是否有图像
                sumUp += fromArray[j][k];
            }
            if (sumUp == 0) {//切割
                for (j = 0; j < fromArray.length - 1; j++) {
                    fromArray[j] = removeFromArray(fromArray[j], k);
                }
                w--;
                k--;
                status = false;
                continue;
            }
            else {//切换状态
                if (!status) {
                    numNow++;
                }
                status = true;
            }
            if (numNow != count) {//不是想要的数字
                for (j = 0; j < fromArray.length - 1; j++) {
                    fromArray[j] = removeFromArray(fromArray[j], k);
                }
                w--;
                k--;
            }
        }
        return fromArray;
    }//切割，获取特定数字

    function trimUpDown(fromArray) {
        var h = fromArray.length;
        for (var j = 0; j < h; j++) {
            var sumUp = 0;
            for (var k = 0; k < fromArray[j].length - 1; k++) {
                sumUp += fromArray[j][k];
            }
            if (sumUp === 0) {//清除
                fromArray = removeFromArray(fromArray, j);
                h--;
                j--;
            }
        }
        return fromArray;
    }//清除上下的空白

    function zoomToFit(fromArray) {
        var imgD = fromXY(fromArray);
        var w = lastWidth;
        var h = lastHeight;
        var tempc1 = document.createElement("canvas");
        var tempc2 = document.createElement("canvas");
        if (!fromArray[0]) {
            window.location.reload();
        }
        tempc1.width = fromArray[0].length;
        tempc1.height = fromArray.length;
        tempc2.width = w;
        tempc2.height = h;
        var tempt1 = tempc1.getContext("2d");
        var tempt2 = tempc2.getContext("2d");
        tempt1.putImageData(imgD, 0, 0, 0, 0, tempc1.width, tempc1.height);
        tempt2.drawImage(tempc1, 0, 0, w, h);
        var returnImageD = tempt2.getImageData(0, 0, WIDTH, HEIGHT);
        fromArray = toXY(returnImageD);
        fromArray.length = h;
        for (var i = 0; i < h; i++) {
            fromArray[i].length = w;
        }
        return fromArray;
    }//尺寸归一化

    // 生成特征码
    function getCode(mat) {
        return mat.map(col => BigInt('0b' + col.join('')));
    }

    // tools.js
    var lastWidth = 20;
    var lastHeight = 20;
    var numsCount = 4;
    var numsArray;

    function removeFromArray(fromArray, obj) {
        for (var i = 0; i < fromArray.length; i++) {
            var temp = fromArray[i];
            if (!isNaN(obj)) {
                temp = i;
            }
            if (temp == obj) {
                for (var j = i; j < fromArray.length; j++) {
                    fromArray[j] = fromArray[j + 1];
                }
                fromArray.length = fromArray.length - 1;
            }
        }
        return fromArray;
    }//移除数组中元素

    function toXY(fromImgData) {
        var result = new Array(HEIGHT);
        var fromPixelData = fromImgData.data;
        for (var j = 0; j < HEIGHT; j++) {
            result[j] = new Array(WIDTH);
            for (var k = 0; k < WIDTH; k++) {
                var r = fromPixelData[4 * (j * WIDTH + k)];
                var g = fromPixelData[4 * (j * WIDTH + k) + 1];
                var b = fromPixelData[4 * (j * WIDTH + k) + 2];

                result[j][k] = (r + g + b) > 500 ? 0 : 1;//赋值0、1给内部数组
            }
        }
        return result;
    }//图像转数组

    function fromXY(fromArray) {
        var fromImgData = ctx1.createImageData(WIDTH, HEIGHT);
        var fromPixelData = fromImgData.data;
        for (var j = 0; j < fromArray.length; j++) {
            for (var k = 0; k < fromArray[j].length; k++) {
                var innergrey = (fromArray[j][k] == 1 ? 0 : 255);
                fromPixelData[4 * (j * WIDTH + k)] = innergrey;
                fromPixelData[4 * (j * WIDTH + k) + 1] = innergrey;
                fromPixelData[4 * (j * WIDTH + k) + 2] = innergrey;
                fromPixelData[4 * (j * WIDTH + k) + 3] = 255;
            }
        }
        return fromImgData;
    }//数组转图像

    function dealWithSingle(fromPixelArray, num) {
        var arrayCopy = new Array(fromPixelArray.length);
        for (var i = 0; i < fromPixelArray.length; i++) {
            arrayCopy[i] = new Array(fromPixelArray[i].length);
            for (var j = 0; j < fromPixelArray[i].length; j++) {
                arrayCopy[i][j] = fromPixelArray[i][j] + 0;
            }
        }
        arrayCopy = split(arrayCopy, num);//切割
        arrayCopy = trimUpDown(arrayCopy);//去上下空白
        drawArray(ctx3, arrayCopy);//画出单一图像
        arrayCopy = zoomToFit(arrayCopy, 15, 15);
        arrayCopy = corrode(arrayCopy);//腐蚀
        arrayCopy = expand(arrayCopy);//膨胀
        arrayCopy = trimUpDown(arrayCopy);//去上下空白
        drawArray(ctx3, arrayCopy);//画出缩放图像
        return getCode(arrayCopy);//生成特征码
    }

    function readNum(str) {
        let minDiff = Infinity;
        let ans = 0;
        for (const key of numkeys) {
            const feature = key[1];
            let diff = 0;
            for (let k = 0; k < feature.length; k++) {
                let x = feature[k] ^ str[k];
                while (x) {
                    if (!(x & 1n)) diff++;
                    x >>= 1n;
                }
            }
            if (diff < minDiff) {
                ans = key[0];
                minDiff = diff;
            }
            if (diff === 0) break;
        }
        console.log('Answer', ans, minDiff, str);
        if (minDiff >= 16) {
            console.warn(`[${ans}, [${str.map(k => k + 'n').join(', ')}]],`);
        }
        return ans;
    }

    /** main */
    /** index.jsp */
    function mainIndex() {
        console.log('run mainIndex');
        E('username').readonly = false;
        E('validCode').readonly = false;

        E('connectNetworkPageId').insertAdjacentHTML('afterbegin', `
<div class="mless-container" id="adiv">
    <input class="input" id="ainput" placeholder="paste here...">
    <div class="mless-quickfill" id="aquickfill" style="display: none;">${Account.list}</div>
    <div style="float: left;" id="aclear">
        <span class="mless-icon" style="right: 8px; background-position: -339px -101px;" />
    </div>
    <div style="float: left;" id="aauth">
        <span class="mless-icon" style="right: -24px; background-position: -322px -101px;" />
    </div>
</div>
`);

        const el = E('ainput');
        const eq = E('aquickfill');
        let clickFlag = true; // 点击其他地方隐藏下拉框

        el.value = Account.value;
        el.addEventListener("focus", function () { eq.style.display = "block"; });
        eq.addEventListener("click", function (event) {
            console.log('index', event.target.dataset);
            const i = Number(event.target.dataset.i);
            if (isNaN(i)) {
                return;
            }
            Account.index = i;
            GM_setValue('index', Account.index);
            el.value = Account.value;
            eq.style.display = "none";
            clickFlag = true;
        });
        E('adiv').addEventListener("click", function () { clickFlag = false });

        document.body.addEventListener("click", function (event) {
            if (clickFlag) {
                eq.style.display = "none";
            }
            clickFlag = true;
        });

        function imcrack() {
            const img = E('validImage');
            console.log('imcrack', img.src);
            if (/^.*\/validcode\?rnd=.*$/.test(img.src)) {
                initAll(img);//初始化
                drawThis(ctx1, img);//画出原图
                var imgData = ctx1.getImageData(0, 0, WIDTH, HEIGHT);//读取图像数据
                imgData = toHex(imgData);//二值化图像数据
                ctx2.putImageData(imgData, 0, 0, 0, 0, WIDTH, HEIGHT);//画出二值化图
                var pixelArray = toXY(imgData);//将图片数据转化为数组
                pixelArray = corrode(pixelArray);//腐蚀
                pixelArray = expand(pixelArray);//膨胀
                numsArray = new Array(numsCount);//分割、处理并保存
                for (let c = 0; c < numsCount; c++) {
                    numsArray[c] = dealWithSingle(pixelArray, c + 1);
                }
                const res = numsArray.map(e => readNum(e)).join(''); // 根据特征码识别
                console.warn(res);
                E('validCode').value = res;
            }
        }

        E('aclear').onclick = function () { el.value = null; };
        E('aauth').onclick = function () {
            let v = el.value;
            if (typeof v !== 'string') {
                return;
            }
            if (v === Account.value) {
                v = Account.info[Account.index];
            }
            v = v.split(/[\t ,]/).filter(s => !!s);
            if (v.length <= 1) {
                return;
            }
            E('username').value = v[0];
            E('pwd').value = v[1];
            if (E('isDisplayValidCode').style.display !== 'none') {
                imcrack();
            }
            unsafeWindow.doauthen();
        };

        unsafeWindow.captcha = { imcrack, numkeys };
    }
    /** success.jsp */
    function mainSuccess() {
        console.log('run mainSuccess');
        E('toLogOut').onclick = unsafeWindow.sureLogout;
    }
    /** logout.jsp */
    function mainLogout() {
        setTimeout(() => {
            window.location = 'gologout.jsp';
        }, 200);
    }

    switch (location.pathname) {
        case '/eportal/index.jsp': mainIndex(); break;
        case '/eportal/success.jsp': mainSuccess(); break;
        case '/eportal/logout.jsp': mainLogout(); break;
        default: console.warn('Unknown page', location.pathname);
    }
})();