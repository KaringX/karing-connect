# karing-connect
## 介绍
- 从karing内置webview容器打开机场(VPN服务商)登录页面, 实现登录即导入配置.
- 优点
    - 用户登录闭环, APP内置机场信息.
    - 功能可配置:
        - 提供官方消息推送配置功能.
        - 套餐到期提醒.
        - *todo* 机场可根据自身特性定制部分APP默认配置, 比如ipv6、dns等.
    - 无附加广告:
        - Karing设置页`专项流量`广告位仅显示该机场链接.
- PS: 如果您是机场主(VPN服务商)，那么本项目也许有您想要的功能.
    - 如果您仅想要一个代理应用, 那么请绕行.


## V2Board
### 第一步 v2board 系统
- 在v2board目录下增加两个文件
	- custom.js: `public/theme/v2board/assets/custom.js`
	- karing-connect.html: `public/karing-connect.html`
	- *注意* 如果您使用其他主题, 注意替换custom路径中的 `theme/v2board`
- custom会载入一个远程文件 `karing.min.js`
    - 必然也可在GitHub下载原始文件 并自主部署
	- 按自己需求修改更没问题, 原始文件无加密, 未删注释.
	- GitHub: https://github.com/KaringX/karing-connect/blob/main/karing.js

### 第二步 harry.karing 后台
- 修改配置文件 `base.json`
    - *connect* 字段
    - 咒语 *spells* 字段, 推荐使用机场名称.
```js
{
    "pid": 123456,
	...

	"connet": "https://your-domain/karing-connect.html",
    "spells": [
        '急速云',
        'RapidNetwork',
    ],
    ...
}
```


# SSPanel
### sspanel 系统
- 1 添加controller
    - 新建控制器用于处理Karing连接
	- 添加文件 `src/Controllers/KaringController.php`
- 2 添加路由
	- 修改文件 `app/routes.php` 最后加入一条路由
```php
    // Connect to Karing
    $app->get('/karing/connect', App\Controllers\KaringController::class . ':connect');

```
- 3 对应的登录连接即
	- https://your-domain/karing/connect

### harry.karing 后台
- 修改配置文件 `base.json`
    - *connect* 字段
    - 咒语 *spells* 字段, 推荐使用机场名称.
```js
{
    "pid": 123456,
	...

	"connet": "https://your-domain/karing/connect",
    "spells": [
        '急速云',
        'RapidNetwork',
    ],
    ...
}
```


## 链接
- 对接文档 https://karing.app/category/cooperation
- v2board https://github.com/v2board/v2board
- sspanel https://github.com/Anankke/SSPanel-UIM
