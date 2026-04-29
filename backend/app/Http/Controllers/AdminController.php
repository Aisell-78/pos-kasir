<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Transaction;
use App\Models\DailyExpense;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Middleware check: only role=admin can access this
     */
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Akses Ditolak. Hanya Developer yang diizinkan.');
        }
    }

    public function clients(Request $request)
    {
        $this->checkAdmin($request);

        $users = User::where('role', 'user')
            ->withCount('transactions')
            ->with('storeSetting:id,user_id,store_name,address,phone')
            ->latest()
            ->get()
            ->map(function ($user) {
                $totalRevenue = Transaction::withoutGlobalScopes()
                    ->where('user_id', $user->id)
                    ->where('status', 'paid')
                    ->sum('grand_total');

                $lastTransaction = Transaction::withoutGlobalScopes()
                    ->where('user_id', $user->id)
                    ->latest()
                    ->first();

                return [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'email'           => $user->email,
                    'created_at'      => $user->created_at,
                    'store_name'      => $user->storeSetting?->store_name ?? $user->name,
                    'address'         => $user->storeSetting?->address,
                    'phone'           => $user->storeSetting?->phone,
                    'transactions_count' => $user->transactions_count,
                    'total_revenue'   => $totalRevenue,
                    'last_active'     => $lastTransaction?->created_at,
                ];
            });

        return response()->json([
            'total_clients' => $users->count(),
            'clients' => $users,
        ]);
    }
}
