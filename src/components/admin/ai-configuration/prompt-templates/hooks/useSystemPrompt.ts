import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { SystemPrompt } from '@/types/ai-configuration';
import { showSuccessToast, showErrorToast } from '@/lib/utils';

export function useSystemPrompt() {
    const [systemPrompt, setSystemPrompt] = useState<SystemPrompt | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSystemPrompt = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.get<SystemPrompt>('/system-prompt');
            setSystemPrompt(data);
        } catch (error) {
            console.error('Failed to fetch system prompt:', error);
            showErrorToast('Error', 'Failed to load system prompt');
            setSystemPrompt(null);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSystemPrompt = async (content: string) => {
        try {
            setIsSaving(true);
            const data = await apiService.put<SystemPrompt>('/system-prompt', { content });
            setSystemPrompt(data);
            showSuccessToast('Success', 'System prompt saved successfully');
        } catch (error) {
            console.error('Failed to save system prompt:', error);
            showErrorToast('Error', 'Failed to save system prompt');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        fetchSystemPrompt();
    }, []);

    return {
        systemPrompt,
        isLoading,
        isSaving,
        saveSystemPrompt,
        fetchSystemPrompt,
    };
} 