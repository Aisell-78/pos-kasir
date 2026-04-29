<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DailyExpenseController;
use App\Http\Controllers\DashboardController;

use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\AdminController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::post('/products/{product}', [ProductController::class, 'update']); // for FormData method spoofing
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/expenses', [DailyExpenseController::class, 'index']);
    Route::post('/expenses', [DailyExpenseController::class, 'store']);
    Route::delete('/expenses/{id}', [DailyExpenseController::class, 'destroy']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Store Settings
    Route::get('/settings', [StoreSettingController::class, 'show']);
    Route::put('/settings', [StoreSettingController::class, 'update']);

    // Admin / Developer Panel
    Route::get('/admin/clients', [AdminController::class, 'clients']);
});
