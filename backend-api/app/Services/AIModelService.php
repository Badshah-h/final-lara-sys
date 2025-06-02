<?php

namespace App\Services;

use App\Models\AIModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use OpenAI\Laravel\Facades\OpenAI;
use Exception;

class AIModelService
{
    /**
     * Get all AI models.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllModels()
    {
        return AIModel::all();
    }

    /**
     * Get public AI models (active and default only).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPublicModels()
    {
        return AIModel::where('isActive', true)->get();
    }

    /**
     * Get an AI model by ID.
     *
     * @param string $id
     * @return AIModel
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getModelById($id)
    {
        return AIModel::findOrFail($id);
    }

    /**
     * Create a new AI model.
     *
     * @param array $modelData
     * @return AIModel
     */
    public function createModel(array $modelData)
    {
        // If this is marked as default, unset all other defaults
        if (isset($modelData['isDefault']) && $modelData['isDefault']) {
            $this->unsetDefaultModels();
        }

        return AIModel::create($modelData);
    }

    /**
     * Update an existing AI model.
     *
     * @param string $id
     * @param array $modelData
     * @return AIModel
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function updateModel($id, array $modelData)
    {
        $model = AIModel::findOrFail($id);

        // If this is being set as default, unset all other defaults
        if (isset($modelData['isDefault']) && $modelData['isDefault'] && !$model->isDefault) {
            $this->unsetDefaultModels();
        }

        $model->update($modelData);
        return $model;
    }

    /**
     * Delete an AI model.
     *
     * @param string $id
     * @return bool
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function deleteModel($id)
    {
        $model = AIModel::findOrFail($id);
        return $model->delete();
    }

    /**
     * Set a model as the default.
     *
     * @param string $id
     * @return AIModel
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function setDefaultModel($id)
    {
        // Unset current defaults
        $this->unsetDefaultModels();

        // Set the new default
        $model = AIModel::findOrFail($id);
        $model->update(['isDefault' => true]);

        return $model;
    }

    /**
     * Unset isDefault flag from all models.
     */
    private function unsetDefaultModels()
    {
        AIModel::where('isDefault', true)->update(['isDefault' => false]);
    }

    /**
     * Test a model with a prompt.
     *
     * @param string $id
     * @param string $prompt
     * @param array $options
     * @return string
     * @throws Exception
     */
    public function testModel($id, $prompt, array $options = [])
    {
        try {
            $model = AIModel::findOrFail($id);

            if (!$model->isActive) {
                throw new Exception('Model is not active');
            }

            if (!$model->apiKey) {
                throw new Exception('Model API key is not configured');
            }

            return $this->callAIProvider($model, $prompt, $options);

        } catch (Exception $e) {
            Log::error('Error testing AI model: ' . $e->getMessage(), [
                'model_id' => $id,
                'prompt' => $prompt,
                'options' => $options
            ]);
            throw $e;
        }
    }

    /**
     * Generate a response using the AI model.
     *
     * @param AIModel $model
     * @param string $prompt
     * @param array $options
     * @return string
     * @throws Exception
     */
    public function generateResponse(AIModel $model, string $prompt, array $options = []): string
    {
        if (!$model->isActive) {
            throw new Exception('Model is not active');
        }

        if (!$model->apiKey) {
            throw new Exception('Model API key is not configured');
        }

        return $this->callAIProvider($model, $prompt, $options);
    }

    /**
     * Call the appropriate AI provider based on the model configuration.
     *
     * @param AIModel $model
     * @param string $prompt
     * @param array $options
     * @return string
     * @throws Exception
     */
    private function callAIProvider(AIModel $model, string $prompt, array $options = []): string
    {
        $maxTokens = $options['max_tokens'] ?? 150;
        $temperature = $options['temperature'] ?? 0.7;

        switch (strtolower($model->provider)) {
            case 'openai':
                return $this->callOpenAI($model, $prompt, $maxTokens, $temperature);

            case 'anthropic':
                return $this->callAnthropic($model, $prompt, $maxTokens, $temperature);

            case 'google':
                return $this->callGoogle($model, $prompt, $maxTokens, $temperature);

            default:
                return $this->callGenericProvider($model, $prompt, $maxTokens, $temperature);
        }
    }

    /**
     * Call OpenAI API.
     *
     * @param AIModel $model
     * @param string $prompt
     * @param int $maxTokens
     * @param float $temperature
     * @return string
     * @throws Exception
     */
    private function callOpenAI(AIModel $model, string $prompt, int $maxTokens, float $temperature): string
    {
        try {
            $client = OpenAI::client($model->apiKey);

            $response = $client->chat()->create([
                'model' => $model->modelId,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => $maxTokens,
                'temperature' => $temperature,
            ]);

            return $response->choices[0]->message->content ?? 'No response generated';

        } catch (Exception $e) {
            Log::error('OpenAI API error: ' . $e->getMessage());
            throw new Exception('Failed to get response from OpenAI: ' . $e->getMessage());
        }
    }

    /**
     * Call Anthropic API.
     *
     * @param AIModel $model
     * @param string $prompt
     * @param int $maxTokens
     * @param float $temperature
     * @return string
     * @throws Exception
     */
    private function callAnthropic(AIModel $model, string $prompt, int $maxTokens, float $temperature): string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->apiKey,
                'Content-Type' => 'application/json',
                'x-api-key' => $model->apiKey,
                'anthropic-version' => '2023-06-01'
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => $model->modelId,
                'max_tokens' => $maxTokens,
                'temperature' => $temperature,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['content'][0]['text'] ?? 'No response generated';
            }

            throw new Exception('Anthropic API request failed: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Anthropic API error: ' . $e->getMessage());
            throw new Exception('Failed to get response from Anthropic: ' . $e->getMessage());
        }
    }

    /**
     * Call Google AI API.
     *
     * @param AIModel $model
     * @param string $prompt
     * @param int $maxTokens
     * @param float $temperature
     * @return string
     * @throws Exception
     */
    private function callGoogle(AIModel $model, string $prompt, int $maxTokens, float $temperature): string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->apiKey,
                'Content-Type' => 'application/json',
            ])->post($model->baseUrl ?: 'https://generativelanguage.googleapis.com/v1/models/' . $model->modelId . ':generateContent', [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => $maxTokens,
                    'temperature' => $temperature,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response generated';
            }

            throw new Exception('Google AI API request failed: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google AI API error: ' . $e->getMessage());
            throw new Exception('Failed to get response from Google AI: ' . $e->getMessage());
        }
    }

    /**
     * Call a generic AI provider.
     *
     * @param AIModel $model
     * @param string $prompt
     * @param int $maxTokens
     * @param float $temperature
     * @return string
     * @throws Exception
     */
    private function callGenericProvider(AIModel $model, string $prompt, int $maxTokens, float $temperature): string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->apiKey,
                'Content-Type' => 'application/json',
            ])->post($model->baseUrl, [
                'model' => $model->modelId,
                'prompt' => $prompt,
                'max_tokens' => $maxTokens,
                'temperature' => $temperature,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['text'] ?? $data['response'] ?? 'No response generated';
            }

            throw new Exception('Generic AI API request failed: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Generic AI API error: ' . $e->getMessage());
            throw new Exception('Failed to get response from AI provider: ' . $e->getMessage());
        }
    }
}
