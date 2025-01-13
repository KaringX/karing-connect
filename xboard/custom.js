/**
 * @fileoverview
 * This file is an example of connecting Xboard to Karing. The logic flow is as follows:
 *      - Determine whether it is in a webview.
 *      - Check for the presence of a process cookie flag.
 *      - Verify the user's login status.
 *      - Load karing.js to obtain the _karing object.
 *      - Fetch the user's subscription information and submit it to the Karing configuration interface.
 *
 * @author Development Team KaringX, elon
 * @created 2025-01-11
 * @version 1.0.0
 *
 * @see {@link https://karing.app/category/cooperation} for more information about the Karing APP.
 * @see {@link https://github.com/cedar2025/Xboard} for more information about the XBoard platform.
 *
 * @license MIT License
 *
 */
// 判断是否载入js 连接karing app
window.onload = function () {
    const scriptUrl = 'https://harry.karing.app/assets/karing.min.js';
    const debug = false;

    function log(msg, data = '') {
        if (debug)
            console.log(msg, data);
    }

    // 是否再karing app中打开
    if (window.karing === undefined && !debug) {
        console.log("not in karing webview.");
        return;
    }

    // 是否在connect流程
    function getcookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    if (getcookie('karing') != 'connect') {
        log("cookie karing = ", getcookie('karing'));
        return;
    }

    let FLAG_JS_LOADED = false;
    //载入js
    function load_js() {
        if (FLAG_JS_LOADED) {
            log('js already loaded.');
            return;
        }

        // 创建 script 标签
        var script = document.createElement('script');
        script.src = scriptUrl + '?v=' + Math.floor(Date.now() / 3600000);
        log('load script ', script.src);

        // 当脚本加载完成后，执行其中的函数
        script.onload = function () {
            connect_to_karing(debug);
        };

        // 将 script 标签添加到 document 中，开始加载 JS 文件
        document.body.appendChild(script);
        FLAG_JS_LOADED = true;
    };


    // 判断用户登录态
    const urlpath = window.location.hash.split('?')[0];
    if (['#/register', '#/login'].includes(urlpath)) {
        log('in login page, ', window.location.hash);
        //监听页面变化
        const targetNode = document.querySelector('#app .n-config-provider');
        // 创建 MutationObserver 实例，并传入回调函数
        const observer = new MutationObserver(function (mutationsList, observer) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    log('div root change.');//, mutation);
                    load_js();
                    // 停止观察
                    observer.disconnect();
                    return;
                }
            });
        });
        // 启动观察
        if (targetNode) {
            observer.observe(targetNode, { childList: true });
        } else {
            log('cant find targetNode: #ap .n-config-provider');
        }

    } else if (urlpath.startsWith('#/')) {
        log('in user page, ', window.location.hash);
        // 直接载入js 试图使用_karing
        load_js();
        return;

    } else {
        log('not in user page, ', window.location.hash);
    }


    // 往karing导入配置
    function connect_to_karing(debug = false) {
        var k = _karing;
        k.debug = debug; // 设置 debug 模式

        const api_list = [
            '/api/v1/user/getSubscribe',
            // '/api/v1/user/subscribe',  //兼容部分api
        ];

        if (!debug && !k.available()) {
            k.error('not in karing webview.');
            return;
        }


        const token = localStorage.getItem('VUE_NAIVE_ACCESS_TOKEN');

        //get user subscribe_url
        for (let i = 0; i < api_list.length; i++) {
            k.log('fetch data from ', api_list[i]);
            k.get(api_list[i], { author: 'Authorization', token: JSON.parse(token).value }).then(function (data) {

                if (data.data && data.data.subscribe_url) {
                    uname = data.data.email;            //用户名使用邮箱
                    link = data.data.subscribe_url;     //订阅链接
                    lname = window.settings.title; //配置名使用站点名称
                    k.log('uname: ', uname);
                    k.log('link: ', link);
                    k.log('lname: ', lname);

                    async function import_config() {
                        try {
                            k.toast('Importing subscription, please wait...', false, 0);
                            const result = await k.config(null, uname, link, lname);
                            if (result == '') {
                                k.toast("Import successful, return to Karing homepage, start browsing.");
                                await k.closeWindow(10);
                            } else {
                                k.toast(`Import failed, please contact the administrator. Error: ${result}`);
                            }
                        } catch (error) {
                            k.error('Configuration failed:', error);
                            k.toast(`Configuration failed, please contact the administrator. ${error}`);
                        }
                    }
                    import_config();

                } else {
                    k.log('get subscribe_url fail', data);
                }
            })
        }

	if(!debug) {
	    //删除cookie 标记
	    k.cookie.del('karing');
	    k.log('del cookie: karing');
        }
    };
};
// end
