<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\DailyExpense;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Use provided date, or default to today
        if ($request->has('date') && $request->date != '') {
            $date = Carbon::parse($request->date);
        } else {
            $date = Carbon::today();
        }

        $transactions = Transaction::whereDate('created_at', $date)
            ->where('status', 'paid')
            ->pluck('id');

        $revenue = Transaction::whereIn('id', $transactions)->sum('grand_total');

        $expenses = DailyExpense::whereDate('date', $date)->sum('amount');

        $netProfit = $revenue - $expenses;

        $soldItems = \App\Models\TransactionDetail::whereIn('transaction_id', $transactions)
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->selectRaw('products.name, SUM(transaction_details.quantity) as total_quantity, SUM(transaction_details.subtotal) as total_sales')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->get();

        return response()->json([
            'date' => $date->toDateString(),
            'revenue' => $revenue,
            'expenses' => $expenses,
            'net_profit' => $netProfit,
            'sold_items' => $soldItems
        ]);
    }
}
