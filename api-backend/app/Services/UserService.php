<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\Repositories\ActivityLogRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class UserService
{
    protected $userRepository;
    protected $activityLogRepository;

    /**
     * Create a new service instance.
     *
     * @param UserRepository $userRepository
     * @param ActivityLogRepository $activityLogRepository
     */
    public function __construct(
        UserRepository $userRepository,
        ActivityLogRepository $activityLogRepository
    ) {
        $this->userRepository = $userRepository;
        $this->activityLogRepository = $activityLogRepository;
    }

    /**
     * Get all users with pagination.
     *
     * @param array $params
     * @return array
     */
    public function getAllUsers(array $params): array
    {
        return $this->userRepository->getAllWithPagination($params);
    }

    /**
     * Get user by ID.
     *
     * @param int $id
     * @return User
     */
    public function getUserById(int $id): User
    {
        return $this->userRepository->findOrFail($id)->load('roles');
    }

    /**
     * Create a new user.
     *
     * @param array $data
     * @return User
     */
    public function createUser(array $data): User
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'] ?? 'active',
            'avatar' => $data['avatar'] ?? null,
        ];

        $user = $this->userRepository->create($userData);

        // Assign role if provided
        if (isset($data['role'])) {
            $user->assignRole($data['role']);
        }

        // Send welcome email if requested
        if (isset($data['send_email']) && $data['send_email']) {
            // Implementation for sending welcome email
        }

        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'created_user',
            'target' => $user->email,
            'details' => json_encode(['user_id' => $user->id]),
        ]);

        return $user->load('roles');
    }

    /**
     * Update an existing user.
     *
     * @param int $id
     * @param array $data
     * @return User
     */
    public function updateUser(int $id, array $data): User
    {
        $user = $this->userRepository->findOrFail($id);

        $userData = [];
        if (isset($data['name'])) $userData['name'] = $data['name'];
        if (isset($data['email'])) $userData['email'] = $data['email'];
        if (isset($data['password'])) $userData['password'] = Hash::make($data['password']);
        if (isset($data['avatar'])) $userData['avatar'] = $data['avatar'];

        $user = $this->userRepository->update($user, $userData);

        // Update role if provided
        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'updated_user',
            'target' => $user->email,
            'details' => json_encode(['user_id' => $user->id]),
        ]);

        return $user->load('roles');
    }

    /**
     * Delete a user.
     *
     * @param int $id
     * @return bool
     */
    public function deleteUser(int $id): bool
    {
        $user = $this->userRepository->findOrFail($id);
        
        // Store email for activity log
        $email = $user->email;
        
        // Delete user
        $result = $this->userRepository->delete($user);
        
        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'deleted_user',
            'target' => $email,
            'details' => json_encode(['user_id' => $id]),
        ]);
        
        return $result;
    }

    /**
     * Update user status.
     *
     * @param int $id
     * @param string $status
     * @return User
     */
    public function updateUserStatus(int $id, string $status): User
    {
        $user = $this->userRepository->findOrFail($id);
        $user = $this->userRepository->update($user, ['status' => $status]);
        
        // Log activity
        $this->activityLogRepository->create([
            'user_id' => auth()->id(),
            'action' => 'updated_user_status',
            'target' => $user->email,
            'details' => json_encode(['user_id' => $user->id, 'status' => $status]),
        ]);
        
        return $user;
    }

    /**
     * Send password reset email.
     *
     * @param string $email
     * @return array
     */
    public function sendPasswordResetEmail(string $email): array
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            // Log activity
            $this->activityLogRepository->create([
                'user_id' => auth()->id(),
                'action' => 'sent_password_reset',
                'target' => $email,
            ]);
            
            return [
                'success' => true,
                'message' => __($status),
            ];
        }

        return [
            'success' => false,
            'message' => __($status),
        ];
    }

    /**
     * Get user permissions.
     *
     * @param int $id
     * @return array
     */
    public function getUserPermissions(int $id): array
    {
        $user = $this->userRepository->findOrFail($id);
        return $user->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Get user activity logs.
     *
     * @param int $id
     * @param array $params
     * @return array
     */
    public function getUserActivityLogs(int $id, array $params): array
    {
        $user = $this->userRepository->findOrFail($id);
        return $this->activityLogRepository->getByUserId($user->id, $params);
    }
}
