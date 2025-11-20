<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if (!$request->hasFile('image')) {
                Log::error('No file was uploaded');
                return response()->json(['error' => 'No file was uploaded'], 400);
            }

            $file = $request->file('image');
            $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
            
            Log::info('Attempting to store file: ' . $filename);
            
            // Create uploads directory if it doesn't exist
            $uploadsPath = public_path('uploads');
            if (!File::exists($uploadsPath)) {
                File::makeDirectory($uploadsPath, 0755, true);
            }
            
            // Move the file directly to the public/uploads directory
            $file->move($uploadsPath, $filename);
            $path = 'uploads/' . $filename;
            
            Log::info('File stored successfully: ' . $path);
            
            // Generate the full URL to the file
            $baseUrl = $request->getSchemeAndHttpHost();
            $fullUrl = $baseUrl . '/' . $path;
            
            return response()->json([
                'url' => $fullUrl
            ]);
        } catch (\Exception $e) {
            Log::error('Upload error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
} 