<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Menu::query();
        if ($request->query('admin') !== 'true') {
            $query->where('visible', true);
        }
        $menus = $query->get();
        return response()->json([
            'status' => 'success',
            'data' => $menus
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric',
            'desc' => 'nullable|string',
            'img' => 'nullable|string',
            'best_seller' => 'boolean',
            'visible' => 'boolean',
        ]);

        $menu = Menu::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $menu
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $menu = Menu::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'desc' => 'nullable|string',
            'img' => 'nullable|string',
            'best_seller' => 'boolean',
            'visible' => 'boolean',
        ]);

        $menu->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $menu
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Menu deleted successfully'
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:2048'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            // Move file to public directory so it's accessible (for local development)
            $file->move(public_path('uploads'), $filename);
            
            $url = config('app.url') . '/uploads/' . $filename;
            
            return response()->json([
                'status' => 'success',
                'url' => $url
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No file uploaded'
        ], 400);
    }
}
