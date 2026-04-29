<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');
        
        if ($request->has('is_menu')) {
            $query->where('is_menu', $request->boolean('is_menu'));
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name'        => 'required|string',
            'price'       => 'nullable|numeric',
            'stock'       => 'required|integer',
            'is_menu'     => 'required|boolean',
            'image'       => 'nullable|image|max:5120', // max 5MB
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = asset('storage/' . $path);
        } else {
            unset($validated['image']);
        }

        $product = Product::create($validated);
        return response()->json($product->load('category'), 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name'        => 'sometimes|string',
            'price'       => 'nullable|numeric',
            'stock'       => 'sometimes|integer',
            'is_menu'     => 'sometimes|boolean',
            'image'       => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                $oldPath = str_replace(asset('storage/'), '', $product->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = asset('storage/' . $path);
        } else {
            unset($validated['image']);
        }

        $product->update($validated);
        return response()->json($product->load('category'));
    }

    public function destroy(Product $product)
    {
        // Delete associated image file if exists
        if ($product->image) {
            $oldPath = str_replace(asset('storage/'), '', $product->image);
            Storage::disk('public')->delete($oldPath);
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}

