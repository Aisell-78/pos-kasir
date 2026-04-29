<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StoreSetting;

class StoreSettingController extends Controller
{
    public function show(Request $request)
    {
        $settings = StoreSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'store_name' => $request->user()->name,
                'address'    => null,
                'phone'      => null,
                'footer_text' => 'Terima kasih telah berbelanja!',
            ]
        );

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name'  => 'nullable|string|max:255',
            'address'     => 'nullable|string|max:500',
            'phone'       => 'nullable|string|max:50',
            'footer_text' => 'nullable|string|max:500',
        ]);

        $settings = StoreSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($settings);
    }
}
