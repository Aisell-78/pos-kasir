<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DailyExpense;

class DailyExpenseController extends Controller
{
    public function index(Request $request)
    {
        $today = \Carbon\Carbon::today();
        $yesterday = \Carbon\Carbon::yesterday();

        $summary = [
            'today' => DailyExpense::whereDate('date', $today)->sum('amount'),
            'yesterday' => DailyExpense::whereDate('date', $yesterday)->sum('amount'),
        ];

        $queryDate = $request->has('date') && $request->date != '' ? \Carbon\Carbon::parse($request->date) : $today;

        return response()->json([
            'expenses' => DailyExpense::whereDate('date', $queryDate)->latest()->get(),
            'summary' => $summary
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'name' => 'required|string',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $expense = DailyExpense::create($validated);

        return response()->json($expense, 201);
    }

    public function destroy($id)
    {
        $expense = DailyExpense::findOrFail($id);
        $expense->delete();
        
        return response()->json(['message' => 'Expense deleted successfully']);
    }
}
