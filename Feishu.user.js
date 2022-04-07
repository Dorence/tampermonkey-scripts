// ==UserScript==
// @name         Feishu
// @namespace    https://github.com/dorence
// @version      0.1
// @description  Powerup for feishu docs!
// @author       Dorence DENG
// @match        *://*.feishu.cn/*
// @icon         https://www.feishu.cn/favicon.ico
// @grant        none
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    const $ = jQuery.noConflict(true); // jQuery
    console.log($);
    // Your code here...

    function getReact(el, type) {
        switch(type) {
            case 'ev': return el[Object.keys(el).find(k => k.startsWith('__reactEventHandlers'))];
            case 'in': return el[Object.keys(el).find(k => k.startsWith('__reactInternalInstance'))];
            default: return null;
        }
    }

    function getReactRouter() {
        const workspace = $('.wiki-space-right-area')[0];
        return getReact(workspace, 'in').child.stateNode.context.router;
    }

    function jumpWikiHack(href) {
        const router = getReactRouter();
        router.history.push(href);
        /**
        // newWikiToken = href
        const treeLinks = $('.tree-title-content-link');
        const lastLink = treeLinks[treeLinks.length - 1];
        const linkWrapper = $(lastLink).parents('div.tree-node-wrapper');

        if(linkWrapper.length) {
            const node = linkWrapper[0];
            const _r = Object.keys(node).find(e => e.startsWith('__reactEventHandlers'));
            const oldWikiToken = node[_r].children.props.item.wikiToken;
            node[_r].children.props.item.wikiToken = newWikiToken;
            console.log('hack', newWikiToken, node[_r].children.props.item)
            lastLink.click();
            node[_r].children.props.item.wikiToken = oldWikiToken;
        }
        else {
            debugger
        }
        **/
    }

    function listener(event) {
        // event.preventDefault();
        const target = event.originalEvent.explicitOriginalTarget || event.originalEvent.target;
        console.log(target);

        const spans = $(target).parents('span.mention.mention-type_16');
        if(spans.length) {
            const links = $(spans[0]).find('a');
            console.log('a', links);
            if(links.length) {
                const newHref = links[0].dataset.href || links[0].href;
                const newLoc = newHref.match(/^.*(wik\w+).*$/)[1];
                console.log('newLoc', newLoc);
                if(newLoc) {
                    jumpWikiHack(newHref);
                    /*
                    let f = $('.tree-title-content-link'); f = f[f.length - 1];
                    const k = Object.keys(f).find(e => e.startsWith('__reactEventHandlers'));
                    const z = f[k].children.props['data-id'];
                    const z2 = f.href;
                    debugger
                    f[k].children.props['data-id'] = newLoc;
                    f.href = f[k].href = newHref;
                    console.log(f[k].children.props['data-id'], f)
                    f.click();
                    // f[k].children.props['data-id'] = z;
                    // f.href = z2;
                    console.log(f, f[k].children.props)
                    */
                }
                /*
                $(a).attr('target', '_self').click((e) => {
                    const t = e.currentTarget;
                    console.log('click', t.target, t);
                    window.location = t.dataset.href || t.href;
                    e.preventDefault();
                });
                */
                return false;
            }
        }
    }

    function main() {
        const isChromium = navigator.userAgent.includes("Chrome");

        if (isChromium) {
            $(document).on("selectstart mousedown", listener);
        }
        else {
            $(document).on("mouseup", listener);
        }
    }

    main();
})();