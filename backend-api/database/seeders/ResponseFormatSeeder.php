<?php

namespace Database\Seeders;

use App\Models\ResponseFormat;
use Illuminate\Database\Seeder;

class ResponseFormatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default conversational format
        ResponseFormat::create([
            'name' => 'Default Conversational',
            'description' => 'A natural, conversational response format for general use',
            'template' => "You are a helpful AI assistant. Please provide a {length} response in a {tone} tone. {format_instructions}",
            'example_output' => "I understand you're looking for information about [topic]. Let me explain that in a clear and friendly way...",
            'system_instructions' => 'Provide responses in a natural, conversational manner with medium length and professional tone.',
            'parameters' => json_encode([
            'format' => 'conversational',
            'length' => 'medium',
            'tone' => 'professional',
                'useHeadings' => false,
                'useBulletPoints' => false,
                'includeLinks' => true,
                'formatCodeBlocks' => true,
            ]),
            'variables' => json_encode([
                'format_instructions' => 'Use a natural, flowing conversation style that feels like a friendly chat.',
            ]),
            'is_default' => true,
        ]);

        // Structured format with headings
        ResponseFormat::create([
            'name' => 'Structured Content',
            'description' => 'A structured format with headings and sections',
            'template' => "Please provide a {length} response in a {tone} tone. {format_instructions}",
            'example_output' => "# Main Topic\n\n## Overview\nThis is the main overview...\n\n## Key Points\n1. First point\n2. Second point\n\n## Conclusion\nIn summary...",
            'system_instructions' => 'Provide responses in a structured format with clear headings and sections, using a detailed length and professional tone.',
            'parameters' => json_encode([
            'format' => 'structured',
            'length' => 'detailed',
            'tone' => 'professional',
                'useHeadings' => true,
                'useBulletPoints' => true,
                'includeLinks' => true,
                'formatCodeBlocks' => true,
            ]),
            'variables' => json_encode([
                'format_instructions' => 'Organize the content with clear headings and sections, using markdown formatting.',
            ]),
            'is_default' => false,
        ]);

        // Bullet points format
        ResponseFormat::create([
            'name' => 'Concise Bullet Points',
            'description' => 'A concise format using bullet points for quick scanning',
            'template' => "Please provide a {length} response in a {tone} tone. {format_instructions}",
            'example_output' => "• Key point 1\n• Key point 2\n• Key point 3\n\nAdditional context...",
            'system_instructions' => 'Provide responses in a concise format using bullet points for quick scanning, maintaining a professional tone.',
            'parameters' => json_encode([
            'format' => 'bullet-points',
            'length' => 'concise',
            'tone' => 'professional',
                'useHeadings' => false,
                'useBulletPoints' => true,
                'includeLinks' => true,
                'formatCodeBlocks' => false,
            ]),
            'variables' => json_encode([
                'format_instructions' => 'Use bullet points for main ideas and keep explanations brief and to the point.',
            ]),
            'is_default' => false,
        ]);

        // Step by step format
        ResponseFormat::create([
            'name' => 'Step by Step Guide',
            'description' => 'A detailed step-by-step format for instructions and tutorials',
            'template' => "Please provide a {length} response in a {tone} tone. {format_instructions}",
            'example_output' => "## Getting Started\n\n1. First step\n   - Important detail\n   - Another detail\n\n2. Second step\n   - Key point\n   - Additional info\n\n3. Final step\n   - Important note\n   - Next steps",
            'system_instructions' => 'Provide responses in a detailed step-by-step format for instructions and tutorials, using a friendly tone.',
            'parameters' => json_encode([
            'format' => 'step-by-step',
            'length' => 'detailed',
            'tone' => 'friendly',
                'useHeadings' => true,
                'useBulletPoints' => false,
                'includeLinks' => true,
                'formatCodeBlocks' => true,
            ]),
            'variables' => json_encode([
                'format_instructions' => 'Break down the process into clear, numbered steps with supporting details.',
            ]),
            'is_default' => false,
        ]);
    }
}
