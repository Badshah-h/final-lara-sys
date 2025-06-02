<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Widget;
use App\Models\AIModel;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class ChatService
{
    protected $aiModelService;

    public function __construct(AIModelService $aiModelService)
    {
        $this->aiModelService = $aiModelService;
    }

    /**
     * Create a new chat session.
     *
     * @param array $data
     * @return ChatSession
     */
    public function createSession(array $data): ChatSession
    {
        $session = ChatSession::create([
            'user_id' => Auth::id(),
            'widget_id' => $data['widget_id'] ?? null,
            'session_id' => $data['session_id'] ?? $this->generateSessionId(),
            'metadata' => $data['metadata'] ?? [],
            'status' => 'active',
            'started_at' => now(),
        ]);

        // Send welcome message if widget has one configured
        if ($session->widget_id) {
            $widget = Widget::find($session->widget_id);
            if ($widget && isset($widget->configuration['general']['welcomeMessage'])) {
                $this->addMessage($session->id, [
                    'content' => $widget->configuration['general']['welcomeMessage'],
                    'role' => 'assistant',
                    'type' => 'welcome'
                ]);
            }
        }

        return $session->load('messages');
    }

    /**
     * Get chat session by ID.
     *
     * @param int $sessionId
     * @return ChatSession|null
     */
    public function getSession(int $sessionId): ?ChatSession
    {
        return ChatSession::with(['messages', 'widget', 'user'])
            ->where('id', $sessionId)
            ->first();
    }

    /**
     * Get all chat sessions for the authenticated user.
     *
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getSessions(array $filters = [])
    {
        $query = ChatSession::with(['widget', 'user'])
            ->orderBy('updated_at', 'desc');

        if (isset($filters['widget_id'])) {
            $query->where('widget_id', $filters['widget_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Send a message in a chat session.
     *
     * @param int $sessionId
     * @param array $messageData
     * @return ChatMessage
     * @throws Exception
     */
    public function sendMessage(int $sessionId, array $messageData): ChatMessage
    {
        $session = $this->getSession($sessionId);

        if (!$session) {
            throw new Exception('Chat session not found');
        }

        if ($session->status !== 'active') {
            throw new Exception('Chat session is not active');
        }

        // Add user message
        $userMessage = $this->addMessage($sessionId, [
            'content' => $messageData['content'],
            'role' => 'user',
            'type' => $messageData['type'] ?? 'text',
            'metadata' => $messageData['metadata'] ?? []
        ]);

        // Generate AI response
        try {
            $aiResponse = $this->generateAIResponse($session, $messageData['content']);

            $assistantMessage = $this->addMessage($sessionId, [
                'content' => $aiResponse,
                'role' => 'assistant',
                'type' => 'text',
                'metadata' => [
                    'model_used' => $session->widget->ai_model_id ?? 'default',
                    'response_time' => microtime(true) - LARAVEL_START
                ]
            ]);

            // Update session timestamp
            $session->touch();

            return $assistantMessage;

        } catch (Exception $e) {
            Log::error('Failed to generate AI response', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);

            // Send error message
            return $this->addMessage($sessionId, [
                'content' => 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
                'role' => 'assistant',
                'type' => 'error',
                'metadata' => ['error' => $e->getMessage()]
            ]);
        }
    }

    /**
     * Add a message to a chat session.
     *
     * @param int $sessionId
     * @param array $messageData
     * @return ChatMessage
     */
    public function addMessage(int $sessionId, array $messageData): ChatMessage
    {
        return ChatMessage::create([
            'chat_session_id' => $sessionId,
            'content' => $messageData['content'],
            'role' => $messageData['role'],
            'type' => $messageData['type'] ?? 'text',
            'metadata' => $messageData['metadata'] ?? [],
            'sent_at' => now(),
        ]);
    }

    /**
     * Get messages for a chat session.
     *
     * @param int $sessionId
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getMessages(int $sessionId, array $filters = [])
    {
        $query = ChatMessage::where('chat_session_id', $sessionId)
            ->orderBy('sent_at', 'asc');

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['per_page'] ?? 50);
    }

    /**
     * Generate AI response for a chat session.
     *
     * @param ChatSession $session
     * @param string $userMessage
     * @return string
     * @throws Exception
     */
    private function generateAIResponse(ChatSession $session, string $userMessage): string
    {
        // Get the AI model to use
        $aiModel = $this->getAIModelForSession($session);

        if (!$aiModel) {
            throw new Exception('No AI model configured for this chat');
        }

        // Build conversation context
        $context = $this->buildConversationContext($session);

        // Generate response using AI model
        return $this->aiModelService->generateResponse($aiModel, $userMessage, [
            'context' => $context,
            'max_tokens' => 500,
            'temperature' => 0.7
        ]);
    }

    /**
     * Get the AI model to use for a session.
     *
     * @param ChatSession $session
     * @return AIModel|null
     */
    private function getAIModelForSession(ChatSession $session): ?AIModel
    {
        // Try to get model from widget configuration
        if ($session->widget && $session->widget->ai_model_id) {
            $model = AIModel::find($session->widget->ai_model_id);
            if ($model && $model->isActive) {
                return $model;
            }
        }

        // Fall back to default model
        return AIModel::where('isDefault', true)
            ->where('isActive', true)
            ->first();
    }

    /**
     * Build conversation context from recent messages.
     *
     * @param ChatSession $session
     * @param int $maxMessages
     * @return string
     */
    private function buildConversationContext(ChatSession $session, int $maxMessages = 10): string
    {
        $messages = ChatMessage::where('chat_session_id', $session->id)
            ->where('type', '!=', 'welcome')
            ->orderBy('sent_at', 'desc')
            ->limit($maxMessages)
            ->get()
            ->reverse();

        $context = '';
        foreach ($messages as $message) {
            $role = $message->role === 'user' ? 'Human' : 'Assistant';
            $context .= "{$role}: {$message->content}\n";
        }

        return $context;
    }

    /**
     * End a chat session.
     *
     * @param int $sessionId
     * @return bool
     */
    public function endSession(int $sessionId): bool
    {
        $session = ChatSession::find($sessionId);

        if (!$session) {
            return false;
        }

        $session->update([
            'status' => 'ended',
            'ended_at' => now()
        ]);

        return true;
    }

    /**
     * Generate a unique session ID.
     *
     * @return string
     */
    private function generateSessionId(): string
    {
        return 'chat_' . uniqid() . '_' . time();
    }

    /**
     * Get chat analytics for a widget.
     *
     * @param int $widgetId
     * @param array $dateRange
     * @return array
     */
    public function getChatAnalytics(int $widgetId, array $dateRange = []): array
    {
        $query = ChatSession::where('widget_id', $widgetId);

        if (!empty($dateRange['start'])) {
            $query->where('started_at', '>=', $dateRange['start']);
        }

        if (!empty($dateRange['end'])) {
            $query->where('started_at', '<=', $dateRange['end']);
        }

        $totalSessions = $query->count();
        $activeSessions = $query->where('status', 'active')->count();
        $endedSessions = $query->where('status', 'ended')->count();

        $messageQuery = ChatMessage::whereIn('chat_session_id',
            $query->pluck('id')
        );

        $totalMessages = $messageQuery->count();
        $userMessages = $messageQuery->where('role', 'user')->count();
        $assistantMessages = $messageQuery->where('role', 'assistant')->count();

        return [
            'total_sessions' => $totalSessions,
            'active_sessions' => $activeSessions,
            'ended_sessions' => $endedSessions,
            'total_messages' => $totalMessages,
            'user_messages' => $userMessages,
            'assistant_messages' => $assistantMessages,
            'avg_messages_per_session' => $totalSessions > 0 ? round($totalMessages / $totalSessions, 2) : 0,
        ];
    }
}
