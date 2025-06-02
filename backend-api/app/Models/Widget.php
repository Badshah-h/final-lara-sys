<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Widget extends Model
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
        'type',
        'status',
        'configuration',
        'user_id',
        'embed_code',
        'ai_model_id',
        'prompt_template_id',
        'response_format_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'configuration' => 'array',
        'status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the settings for the widget.
     */
    public function settings(): HasMany
    {
        return $this->hasMany(WidgetSetting::class);
    }

    /**
     * Get the user that owns the widget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the AI model associated with the widget
     */
    public function aiModel(): BelongsTo
    {
        return $this->belongsTo(AIModel::class, 'ai_model_id');
    }

    /**
     * Get the prompt template associated with the widget
     */
    public function promptTemplate(): BelongsTo
    {
        return $this->belongsTo(PromptTemplate::class, 'prompt_template_id');
    }

    /**
     * Get the response format associated with the widget
     */
    public function responseFormat(): BelongsTo
    {
        return $this->belongsTo(ResponseFormat::class, 'response_format_id');
    }

    /**
     * Generate the embed code for this widget
     *
     * @param string $format
     * @return string
     */
    public function generateEmbedCode(string $format = 'js'): string
    {
        $domain = config('app.url');
        $widgetId = $this->id;

        switch ($format) {
            case 'js':
                return $this->generateJsEmbedCode($domain, $widgetId);
            case 'react':
                return $this->generateReactEmbedCode($domain, $widgetId);
            case 'iframe':
            default:
                return $this->generateIframeEmbedCode($domain, $widgetId);
        }
    }

    /**
     * Generate JavaScript embed code
     */
    private function generateJsEmbedCode(string $domain, int $widgetId): string
    {
        $config = $this->configuration ?? [];
        $position = $config['appearance']['position'] ?? 'bottom-right';
        $theme = $config['appearance']['theme'] ?? 'light';
        $autoOpen = $config['behavior']['autoOpen'] ?? false;

        return "<script>\n" .
               "  window.WIDGET_API_BASE_URL = '{$domain}/api';\n" .
               "  window.WIDGET_ID = '{$widgetId}';\n" .
               "  window.WIDGET_POSITION = '{$position}';\n" .
               "  window.WIDGET_THEME = '{$theme}';\n" .
               "  window.WIDGET_AUTO_OPEN = " . ($autoOpen ? 'true' : 'false') . ";\n" .
               "</script>\n" .
               "<script src=\"{$domain}/widget.js\" async></script>";
    }

    /**
     * Generate React embed code
     */
    private function generateReactEmbedCode(string $domain, int $widgetId): string
    {
        $config = $this->configuration ?? [];
        $position = $config['appearance']['position'] ?? 'bottom-right';
        $theme = $config['appearance']['theme'] ?? 'light';
        $autoOpen = $config['behavior']['autoOpen'] ?? false;

        return "import React, { useEffect } from 'react';\n\n" .
               "const ChatWidget = () => {\n" .
               "  useEffect(() => {\n" .
               "    // Set widget configuration\n" .
               "    window.WIDGET_API_BASE_URL = '{$domain}/api';\n" .
               "    window.WIDGET_ID = '{$widgetId}';\n" .
               "    window.WIDGET_POSITION = '{$position}';\n" .
               "    window.WIDGET_THEME = '{$theme}';\n" .
               "    window.WIDGET_AUTO_OPEN = " . ($autoOpen ? 'true' : 'false') . ";\n\n" .
               "    // Load widget script\n" .
               "    const script = document.createElement('script');\n" .
               "    script.src = '{$domain}/widget.js';\n" .
               "    script.async = true;\n" .
               "    document.body.appendChild(script);\n\n" .
               "    return () => {\n" .
               "      // Cleanup widget on unmount\n" .
               "      const widget = document.getElementById('chat-widget');\n" .
               "      if (widget) widget.remove();\n" .
               "      document.body.removeChild(script);\n" .
               "    };\n" .
               "  }, []);\n\n" .
               "  return null;\n" .
               "};\n\n" .
               "export default ChatWidget;";
    }

    /**
     * Generate iframe embed code
     */
    private function generateIframeEmbedCode(string $domain, int $widgetId): string
    {
        $width = $this->configuration['appearance']['widgetWidth'] ?? 350;
        $height = $this->configuration['appearance']['widgetHeight'] ?? 500;

        return "<iframe\n" .
               "  src=\"{$domain}/widget-iframe/{$widgetId}\"\n" .
               "  width=\"{$width}\"\n" .
               "  height=\"{$height}\"\n" .
               "  frameborder=\"0\"\n" .
               "  style=\"border: none; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);\"\n" .
               "  allow=\"microphone; camera\"\n" .
               "></iframe>";
    }
}
