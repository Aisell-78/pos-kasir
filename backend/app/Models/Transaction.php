<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Transaction extends Model
{
    use BelongsToUser;

    protected $guarded = [];

    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
