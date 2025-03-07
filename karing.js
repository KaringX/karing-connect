/**
 * @fileoverview
 * This file contains:
 *   - The _karing object, which wraps internal calls of Karing.
 *
 * @author Development Team KaringX, elon
 * @created 2024-12-21
 * @version 1.0.1
 *
 * @see {@link https://karing.app/category/cooperation} for more information about the Karing APP.
 * @see {@link https://github.com/karingX/karing}
 *
 * @license MIT License
 *
 */
const _karing = {
    debug: false,

    log: function (message, data = null) {
        if (this.debug) {
            console.log(`[Karing] ${message}`, data);
        }
    },
    error: function (message, data = null) {
        console.error(`[Karing] ${message}`, data);
    },
    sleep: function (seconds) { //use await
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    },

    // 检查是否符合 Karing 环境
    available: function () {
        return (window.karing && typeof window.karing.callHandler === 'function');
    },

    // 获取 Karing 版本号
    version: async function () {
        try {
            // 等待 callHandler 执行完成
            const result = await this.callHandler('version');
            return result;
        } catch (error) {
            this.error('get version: ', error);
            return null;
        }
    },

    // 通用调用处理方法
    callHandler: function (handler, ...args) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.available()) {
                    throw new Error('window.karing is not available');
                }

                // 调用 window.karing.callHandler
                window.karing.callHandler(handler, ...args)
                    .then((result) => {
                        resolve(result); // 正常返回结果
                    })
                    .catch(() => {
                        const event = new Event('error');
                        self.dispatchEvent(event);
                        if (self.onerror) {
                            self.onerror(event);
                        }
                        reject(new Error(`Handler "${handler}" failed`));
                    });
            } catch (error) {
                reject(error);
            }
        });
    },

    // 延时关闭当前窗口
    closeWindow: async function (delayInSeconds = 0) {
        try {
            // 如果有延迟，先等待指定时间
            if (delayInSeconds > 0) {
                await new Promise((resolve) => setTimeout(resolve, delayInSeconds * 1000));
            }

            // 调用关闭操作
            const result = await this.callHandler('close');
            this.log('Window closed:', result);
            return result;
        } catch (error) {
            this.error('Failed to close the window:', error);
            throw error;
        }
    },

    // 预设置 PID，支持处理后续操作
    prepare: async function (pid, onComplete) {
        try {
            // 等待 callHandler 执行完成
            const result = await this.callHandler('ispPrepare', String(pid));
            this.log('Prepare complete:', result);

            // 如果有回调函数，则执行它
            if (typeof onComplete === 'function') {
                onComplete(result);
            }

            return result;
        } catch (error) {
            this.error('Error during preparation:', error);
            throw error;
        }
    },

    // 添加订阅链接
    config: async function (pid, user, url, name) {
        try {
            if ([null, '', 0, 'None'].includes(pid)) {
                pid = ''; //read from prepare
            } else {
                pid = String(pid);
            }
            const result = await this.callHandler('ispInstallConfig', pid, user, url, name);

            this.log('Configuration complete:', result);
            return result; // 返回结果
        } catch (error) {
            this.error(`Failed to configure subscription: ${error}`);
            throw error; // 抛出错误以便外部处理
        }
    },

    // 当前ISP name
    providerInfo: async function () {
        try {
            const result = await this.callHandler('ispInfo');
            res = this.parseIfJson(result);
            if (typeof res === "object") {
                return res;
            }
        } catch (error) {
            this.log(`Failed to get provider info: ${error}`);
        }
        return null;
    },

    parseIfJson: function (ret) {
        if (typeof ret !== "string") {
            return ret; // 直接返回，不是字符串就不用解析
        }

        try {
            const parsed = JSON.parse(ret);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed; // 成功解析并且是对象，返回解析后的对象
            }
        } catch (e) {
            // 解析失败，说明不是 JSON 格式
            return null;
        }

        return ret; // 解析失败则返回原字符串
    },

    // 显示成功提示框
    showMessage: function (message, autoClose = true, autoCloseDelay = 10) {
        const modalMessage = document.querySelector('#karing-modal-message');
        if (modalMessage) {
            modalMessage.textContent = message;
        } else {
            // 创建模态框的 HTML
            const modalHTML = `
        <div id="karing-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999;">
            <div id="karing-modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.25); text-align: center;">
                <p style="margin: 10px 0;" id="karing-modal-message">${message}</p>
                <button id="karing-modal-confirm" style="padding: 5px 15px; background: #007BFF; color: white; border: none; border-radius: 3px; cursor: pointer;">Confirm</button>
            </div>
        </div>
`;
            // 将模态框插入到页面中
            const body = document.querySelector('body');
            body.insertAdjacentHTML('beforeend', modalHTML);
        }


        // 获取确认按钮
        const confirmButton = document.querySelector('#karing-modal-confirm');

        // 添加点击事件
        confirmButton.addEventListener('click', () => {
            // 删除模态框
            const modalOverlay = document.querySelector('#karing-modal-overlay');
            if (modalOverlay) {
                modalOverlay.remove();
            }

            // 如果 autoClose 为 true，则调用 closeWindow
            if (autoClose) {
                this.closeWindow();
            }
        });

        // 添加自动关闭逻辑：3秒后关闭模态框（用户仍可手动关闭）
        if (autoCloseDelay > 0) {
            setTimeout(() => {
                const modalOverlay = document.querySelector('#karing-modal-overlay');
                if (modalOverlay) {
                    modalOverlay.remove();
                }
            }, 1000 * autoCloseDelay);
        }
    },
    toast: async function (...args) {
        return this.showMessage(...args);
    },

    // GET 请求方法
    get: function (url, options = {}) {
        const opts = {
            ...{
                'with_bearer': false,
                'author': 'authorization',
                'token': null,
            }, ...options
        };

        // 获取 localStorage 中的 authorization token
        const token = (opts.token === null) ? localStorage.getItem(opts.author) : opts.token;

        // 构造请求头
        const headers = new Headers();
        if (token) {
            if (opts.with_bearer) {
                token = `Bearer ${token}`;
            }
            headers.append(opts.author, token);
        }

        // 发起 GET 请求
        return fetch(url, {
            method: 'GET',
            headers: headers
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Request failed, status code: ' + response.status);
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(data => {
                this.log('fetch data:', data);
                // 校验响应数据中是否包含 data
                if (data) {
                    return data; // 返回完整的 data 对象
                } else {
                    this.log('fetch return empty!');
                    return false;
                }
            })
            .catch(error => {
                // 捕获请求错误并输出
                this.error('Request failed: ', error);
                return false;
            });
    },

    // Cookie object with get, set, and delete methods
    cookie: {
        // Get a cookie by name
        get: function (name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        },

        // Set a cookie with a name, value, and optional expiration in hours
        set: function (name, value, hours = 24) {
            const d = new Date();
            d.setTime(d.getTime() + (hours * 60 * 60 * 1000)); // Set expiry time in hours
            const expires = `expires=${d.toUTCString()}`;
            document.cookie = `${name}=${value}; ${expires}; path=/`;
        },

        // Delete a cookie by name
        del: function (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }
    },

};

// 使用示例

// // 预设 PID
// (async function () {
//     try {
//         //参数:
//         //  PID 在harry后台创建服务商时 自动分配的id
//         //  预设的意义在于预加载配置文件
//         //      1.校验配置.
//         //      2.减少后续用户等待时间.
//         const result = _karing.prepare(PID);
//         if (result == '') {
//             //3秒自动关闭提示框
//             _karing.toast('Successfully prepared, next step...', true, 3);
//         }
//         else {
//             _karing.error('prepare failed, err:', result);
//         }
//     } catch (error) {
//         console.error('Preparation failed:', error);
//     }
// })();

// // 添加karing配置
// window.onload = async function () {
//     try {
//         //参数:
//         //  PID置空 app自动读取prepare设置的值
//         //  user_nick: 用户昵称
//         //  link: 机场订阅链接
//         //  link_name: 订阅名称, 可用机场名
//         const result = await _karing.config(null, user_nick, link, link_name);
//         if (result == '') {
//             //3秒自动关闭提示框
//             _karing.toast('Import configuration successful, enjoy!', true, 3);
//         }
//         else {
//             _karing.error('config failed, err:', result);
//         }
//     } catch (error) {
//         console.error('Configuration failed:', error);
//     }
// };


// end