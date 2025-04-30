<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Get the roles assigned to this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withPivot('is_active', 'created_by', 'updated_by')
            ->withTimestamps();
    }

    /**
     * Get all permissions the user has through their roles.
     */
    public function getAllPermissions()
    {
        return $this->roles()
            ->where('roles.is_active', true)
            ->where('role_user.is_active', true)
            ->with(['permissions' => function ($query) {
                $query->where('permissions.is_active', true)
                    ->where('permission_role.is_active', true);
            }])
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }

    /**
     * Check if the user has a specific role.
     *
     * @param string|array $roles
     * @return bool
     */
    public function hasRole($roles): bool
    {
        $userRoles = $this->roles()
            ->where('roles.is_active', true)
            ->where('role_user.is_active', true)
            ->pluck('name')
            ->toArray();
        
        if (is_array($roles)) {
            return !empty(array_intersect($roles, $userRoles));
        }
        
        return in_array($roles, $userRoles);
    }

    /**
     * Check if the user has a specific permission.
     *
     * @param string|array $permissions
     * @return bool
     */
    public function hasPermission($permissions): bool
    {
        $userPermissions = $this->getAllPermissions()->pluck('name')->toArray();
        
        if (is_array($permissions)) {
            return !empty(array_intersect($permissions, $userPermissions));
        }
        
        return in_array($permissions, $userPermissions);
    }

    /**
     * Get the activity logs for the user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the user who created this user.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this user.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}