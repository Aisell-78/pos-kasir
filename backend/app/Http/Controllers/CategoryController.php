<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        // Auto-seed default categories for users who have none yet
        if (Category::count() === 0) {
            foreach (['Menu Utama', 'Minuman'] as $catName) {
                Category::create(['name' => $catName]);
            }
        }

        $categories = Category::with('products')->get();
        
        // Custom Sort: Menu Utama first, Minuman second, then others
        $sorted = $categories->sortBy(function($category) {
            if ($category->name === 'Menu Utama') return 0;
            if ($category->name === 'Minuman') return 1;
            return 2;
        })->values();

        return response()->json($sorted);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Kategori tidak bisa dihapus karena masih memiliki produk.'], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
