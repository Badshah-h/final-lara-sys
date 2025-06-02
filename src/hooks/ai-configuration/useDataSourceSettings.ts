import { useState, useCallback } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/utils';

interface DataSourceSettings {
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'exclusive';
    includeCitation: boolean;
}

export function useDataSourceSettings() {
    const [settings, setSettings] = useState<DataSourceSettings>({
        enabled: true,
        priority: 'medium',
        includeCitation: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveSettings = useCallback(async (newSettings: DataSourceSettings) => {
        try {
            setIsSaving(true);
            // TODO: Replace with actual API call
            // await dataSourceService.updateSettings(newSettings);
            setSettings(newSettings);
            showSuccessToast('Success', 'Settings saved successfully');
        } catch (error) {
            showErrorToast('Error', 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        settings,
        isSaving,
        handleSaveSettings,
    };
} 