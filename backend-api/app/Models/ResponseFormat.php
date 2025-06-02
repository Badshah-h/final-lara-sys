<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResponseFormat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'template',
        'example_output',
        'system_instructions',
        'parameters',
        'variables',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'parameters' => 'array',
        'variables' => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     *
     * @var array
     */
    protected $appends = ['content'];

    /**
     * Get the content attribute (alias for template for backward compatibility)
     */
    public function getContentAttribute(): ?string
    {
        return $this->template;
    }

    /**
     * Override toArray to include frontend-compatible attributes
     */
    public function toArray()
    {
        $array = parent::toArray();

        // Add camelCase isDefault
        $array['isDefault'] = $this->is_default;

        // Extract format properties from parameters
        $parameters = $this->parameters ?? [];
        $array['format'] = $parameters['format'] ?? 'conversational';
        $array['length'] = $parameters['length'] ?? 'medium';
        $array['tone'] = $parameters['tone'] ?? 'professional';

        // Extract options
        $array['options'] = [
            'useHeadings' => $parameters['useHeadings'] ?? false,
            'useBulletPoints' => $parameters['useBulletPoints'] ?? false,
            'includeLinks' => $parameters['includeLinks'] ?? false,
            'formatCodeBlocks' => $parameters['formatCodeBlocks'] ?? false,
        ];

        return $array;
    }
}
