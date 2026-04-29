<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToUser
{
    protected static function bootBelongsToUser()
    {
        if (Auth::check()) {
            static::addGlobalScope('user_id', function (Builder $builder) {
                $builder->where('user_id', Auth::id());
            });

            static::creating(function ($model) {
                if (!$model->user_id) {
                    $model->user_id = Auth::id();
                }
            });
        }
    }
}
