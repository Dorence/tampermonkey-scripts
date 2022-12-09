// ==UserScript==
// @name         SteamDB Free Package
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://steamdb.info/freepackages/*
// @icon         https://steamdb.info/static/logos/32px.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // generate buttons
    for(const e of document.querySelectorAll('div.package>a.tabular-nums')) {
        e.nextElementSibling.insertAdjacentHTML(
            'beforeBegin',
            '<span class="js-remove enh-add" data-subid="' + e.innerHTML + '">[Add]</span>&ensp;'
        )
    }

    let listeningSubid = {};

    function L(subid) {
        console.log('StoreAddFreeLicense', subid)
        window.postMessage({
            type: "steamdb:extension-query",
            contentScriptQuery: "StoreAddFreeLicense",
            subid: subid
        }, window.location.origin)
        listeningSubid[subid] = true;
    }

    // add request
    for(const e of document.querySelectorAll('.enh-add')) {
        e.addEventListener('click', (e)=>{
            const subid = parseInt(e.currentTarget.dataset?.subid)
            if(!isNaN(subid)) {
                L(subid)
            }
        })
    }

    // catch response
    if ("BroadcastChannel" in window) {
        try {
            new BroadcastChannel("steamdb-extension").addEventListener("message", d => {
                if (d && d.origin === window.location.origin && d.data?.type === "steamdb:extension-response") {
                    const data = d.data;
                    if(data && data.type === "steamdb:extension-response"){
                        if(data.request.contentScriptQuery === "StoreAddFreeLicense") {
                            console.log('response', data)
                            // is correlated response
                            const subid = parseInt(data.request.subid)
                            const e = document.querySelector('.enh-add[data-subid="' + subid + '"]')
                            if (!d.data.response || !d.data.response.success || !listeningSubid.hasOwnProperty(subid)) {
                                // failed
                                e.innerHTML = '[Add Failed]'
                            } else {
                                // success
                                e.innerHTML = '[Added]'
                                delete listeningSubid[subid]
                            }
                        }

                    }
                }
            })
        } catch (e) {
            console.error(e)
        }
    }
})();
