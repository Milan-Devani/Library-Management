<?php
/**
 * REST API Router
 * Dispatches HTTP requests to corresponding controllers.
 */

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/BookController.php';
require_once __DIR__ . '/../controllers/MemberController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/AuthorController.php';
require_once __DIR__ . '/../controllers/IssueController.php';
require_once __DIR__ . '/../controllers/ReturnController.php';
require_once __DIR__ . '/../controllers/FineController.php';
require_once __DIR__ . '/../controllers/SettingController.php';
require_once __DIR__ . '/../controllers/DashboardController.php';

function routeRequest() {
    $method = $_SERVER['REQUEST_METHOD'];

    // Determine the route path
    $path = '';
    if (isset($_GET['route'])) {
        $path = '/' . ltrim($_GET['route'], '/');
    } else {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Find /api/ position if exists
        $apiPos = strpos($uri, '/api');
        if ($apiPos !== false) {
            $path = substr($uri, $apiPos);
        } else {
            // Strip script directory
            $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
            if ($scriptDir !== '/' && strpos($uri, $scriptDir) === 0) {
                $path = substr($uri, strlen($scriptDir));
            } else {
                $path = $uri;
            }
        }
    }

    $path = rtrim($path, '/');
    if (empty($path)) {
        $path = '/';
    }

    // Health check / welcome route
    if ($method === 'GET' && ($path === '/' || $path === '/api')) {
        sendResponse(true, 'Library Management System REST API is running successfully', [
            'version' => '1.0.0',
            'server_time' => date('Y-m-d H:i:s')
        ]);
    }

    // Auth Routes
    if ($method === 'POST' && $path === '/api/login') {
        (new AuthController())->login();
    }
    if ($method === 'POST' && $path === '/api/register') {
        (new AuthController())->register();
    }
    if ($method === 'POST' && $path === '/api/logout') {
        (new AuthController())->logout();
    }
    if ($method === 'GET' && $path === '/api/me') {
        (new AuthController())->me();
    }

    // Dashboard Route
    if ($method === 'GET' && $path === '/api/dashboard') {
        (new DashboardController())->getStats();
    }

    // Books Routes
    if ($method === 'GET' && $path === '/api/books') {
        (new BookController())->getAll();
    }
    if ($method === 'POST' && $path === '/api/books') {
        (new BookController())->create();
    }
    if (preg_match('#^/api/books/(\d+)$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'GET') {
            (new BookController())->getById($id);
        } elseif ($method === 'PUT') {
            (new BookController())->update($id);
        } elseif ($method === 'DELETE') {
            (new BookController())->delete($id);
        }
    }

    // Members Routes
    if ($method === 'GET' && $path === '/api/members') {
        (new MemberController())->getAll();
    }
    if ($method === 'POST' && $path === '/api/members') {
        (new MemberController())->create();
    }
    if (preg_match('#^/api/members/(\d+)$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'GET') {
            (new MemberController())->getById($id);
        } elseif ($method === 'PUT') {
            (new MemberController())->update($id);
        } elseif ($method === 'DELETE') {
            (new MemberController())->delete($id);
        }
    }

    // Categories Routes
    if ($method === 'GET' && $path === '/api/categories') {
        (new CategoryController())->getAll();
    }
    if ($method === 'POST' && $path === '/api/categories') {
        (new CategoryController())->create();
    }
    if (preg_match('#^/api/categories/(\d+)$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'GET') {
            (new CategoryController())->getById($id);
        } elseif ($method === 'PUT') {
            (new CategoryController())->update($id);
        } elseif ($method === 'DELETE') {
            (new CategoryController())->delete($id);
        }
    }

    // Authors Routes
    if ($method === 'GET' && $path === '/api/authors') {
        (new AuthorController())->getAll();
    }
    if ($method === 'POST' && $path === '/api/authors') {
        (new AuthorController())->create();
    }
    if (preg_match('#^/api/authors/(\d+)$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'GET') {
            (new AuthorController())->getById($id);
        } elseif ($method === 'PUT') {
            (new AuthorController())->update($id);
        } elseif ($method === 'DELETE') {
            (new AuthorController())->delete($id);
        }
    }

    // Issues Routes
    if ($method === 'GET' && $path === '/api/issues') {
        (new IssueController())->getAll();
    }
    if ($method === 'POST' && $path === '/api/issues') {
        (new IssueController())->create();
    }
    if (preg_match('#^/api/issues/(\d+)$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'GET') {
            (new IssueController())->getById($id);
        }
    }

    // Return Route
    if (preg_match('#^/api/issues/(\d+)/return$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'POST') {
            (new ReturnController())->returnBook($id);
        }
    }

    // Fines Routes
    if ($method === 'GET' && $path === '/api/fines') {
        (new FineController())->getAll();
    }
    if (preg_match('#^/api/fines/(\d+)/pay$#', $path, $matches)) {
        $id = $matches[1];
        if ($method === 'POST') {
            (new FineController())->payFine($id);
        }
    }

    // Settings Routes
    if ($method === 'GET' && $path === '/api/settings') {
        (new SettingController())->getAll();
    }
    if ($method === 'POST' && $path === '/api/settings') {
        (new SettingController())->update();
    }
    if ($method === 'PUT' && $path === '/api/settings') {
        (new SettingController())->update();
    }

    // 404 Route Not Found
    sendResponse(false, "API route not found: [{$method}] {$path}", null, 404);
}
