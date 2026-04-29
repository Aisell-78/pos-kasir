<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Product extends Model
{
    use BelongsToUser;

    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
