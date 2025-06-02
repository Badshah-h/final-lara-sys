<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateResponseFormatRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'template' => 'nullable|string',
            'systemInstructions' => 'nullable|string',
            'format' => 'nullable|string|in:conversational,structured,bullet-points,step-by-step',
            'length' => 'nullable|string|in:concise,medium,detailed',
            'tone' => 'nullable|string|in:professional,friendly,casual,technical',
            'isDefault' => 'boolean',
            'parameters' => 'nullable|array',
            'variables' => 'nullable|array',
            'options' => 'nullable|array',
            'options.useHeadings' => 'boolean',
            'options.useBulletPoints' => 'boolean',
            'options.includeLinks' => 'boolean',
            'options.formatCodeBlocks' => 'boolean',
        ];
    }
}
