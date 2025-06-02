import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DataSource } from '@/services/ai-configuration/dataSourceService';
import * as dataSourceService from '@/services/ai-configuration/dataSourceService';

export function useDataSources() {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentDataSource, setCurrentDataSource] = useState<DataSource | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const { toast } = useToast();

    const refreshDataSources = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await dataSourceService.getAllDataSources();
            setDataSources(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load data sources',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const handleAddDataSource = useCallback(() => {
        setCurrentDataSource(null);
        setShowAddDialog(true);
    }, []);

    const handleEditDataSource = useCallback((dataSource: DataSource) => {
        setCurrentDataSource(dataSource);
        setShowEditDialog(true);
    }, []);

    const handleDeleteDataSource = useCallback(async (id: string) => {
        try {
            setIsLoading(true);
            await dataSourceService.deleteDataSource(id);
            await refreshDataSources();
            toast({
                title: 'Success',
                description: 'Data source deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete data source',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [refreshDataSources, toast]);

    const handleSaveNewDataSource = useCallback(async (data: Omit<DataSource, 'id'>) => {
        try {
            setIsSaving(true);
            await dataSourceService.createDataSource(data);
            await refreshDataSources();
            setShowAddDialog(false);
            toast({
                title: 'Success',
                description: 'Data source created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create data source',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    }, [refreshDataSources, toast]);

    const handleSaveEditedDataSource = useCallback(async (data: Partial<DataSource>) => {
        if (!currentDataSource) return;

        try {
            setIsSaving(true);
            await dataSourceService.updateDataSource(currentDataSource.id, data);
            await refreshDataSources();
            setShowEditDialog(false);
            toast({
                title: 'Success',
                description: 'Data source updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update data source',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    }, [currentDataSource, refreshDataSources, toast]);

    const handleTestDataSource = useCallback(async (id: string) => {
        try {
            const result = await dataSourceService.testDataSource(id, 'test');
            toast({
                title: 'Test Result',
                description: result.result,
                variant: 'default',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to test data source',
                variant: 'destructive',
            });
        }
    }, [toast]);

    return {
        dataSources,
        isLoading,
        isSaving,
        currentDataSource,
        showAddDialog,
        showEditDialog,
        searchQuery,
        selectedType,
        setSearchQuery,
        setSelectedType,
        setShowAddDialog,
        setShowEditDialog,
        handleAddDataSource,
        handleEditDataSource,
        handleDeleteDataSource,
        handleSaveNewDataSource,
        handleSaveEditedDataSource,
        handleTestDataSource,
        refreshDataSources,
    };
} 