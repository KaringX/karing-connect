<?php

/**
 * @filename KaringController.php
 * @desc Please add the following line to the routing before using this controller:
 *     $app->get('/karing/connect', App\Controllers\KaringController::class . ':connect');
 *     ruote file: app/routes.php
 *
 * @author Development Team KaringX, elon
 * @created 2024-12-21
 * @version 1.0.0
 *
 * @see {@link https://karing.app/category/cooperation} for more information about the Karing APP.
 * @see {@link https://github.com/Anankke/SSPanel-UIM} for more information about the SSPanel platform.
 *
 * @license MIT License
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Services\Auth;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;
use Slim\Http\ServerRequest;

use App\Utils\Cookie;
use App\Services\Subscribe;


final class KaringController extends BaseController
{
    /**
     * Connect to Karing
     */
    public function connect(ServerRequest $request, Response $response, array $args): ResponseInterface
    {
        $user = Auth::getUser();

        // login & come back
        if (! $user->isLogin) {
            Cookie::set(['redir' => '/karing/connect'], time() + 3600);
            return $response->withStatus(302)->withHeader('Location', '/auth/login');
        }

        // view
        $html = <<<KVIEW
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录成功</title>
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            font-size: 18px;
            color: #333;
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <div>
        <span>{uname} 登录成功, 配置同步中...</span>
    </div>
    <script src="https://harry.karing.app/assets/karing.min.js"></script>
    <script>
window.onload = async function () {
    try {
        if (_karing !== undefined && _karing.available()) {
            _karing.toast('正在同步配置, 请稍后...', false, 0);
            const result = await _karing.config(null, '{uname}', '{link}', '{lname}');
            if (result == '') {
                _karing.toast("配置导入成功, 返回Karing首页, 开始畅游.");
                await _karing.closeWindow(10);
            }else {
                _karing.toast("Import failed, please contact the administrator. Error: "+ result);
            }
        } else {
            console.log('error: not in karing webview');
        }
    } catch (error) {
        console.error('Configuration failed:', error);
        alert("Configuration failed, please contact the administrator. " + error);
    }
};
    </script>
</body>
</html>
KVIEW;

        $html = str_replace(
            [
                '{uname}',
                '{link}',
                '{lname}',
            ],
            [
                $user->user_name,
                Subscribe::getUniversalSubLink($this->user) . '/singbox',
                $_ENV['appName'],
            ],
            $html
        );

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html');
    }
}
