<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class DailyExpense extends Model
{
    use BelongsToUser;

    protected $guarded = [];
}
