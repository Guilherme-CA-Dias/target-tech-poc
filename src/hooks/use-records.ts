import useSWR from 'swr';
import { RecordsResponse } from '@/types/record';
import { authenticatedFetcher } from '@/lib/fetch-utils';
import { useState, useCallback, useEffect } from 'react';

export function useRecords(actionKey: string | null, search: string = '') {
  const [allRecords, setAllRecords] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<RecordsResponse>(
    actionKey ? `/api/records?action=${actionKey}${search ? `&search=${encodeURIComponent(search)}` : ''}` : null,
    authenticatedFetcher
  );

  // Reset records when action or search changes
  useEffect(() => {
    setAllRecords([]);
  }, [actionKey, search]);

  useEffect(() => {
    if (data?.records) {
      setAllRecords(prev => 
        prev.length === 0 ? data.records : [...prev, ...data.records]
      );
    }
  }, [data]);

  const loadMore = useCallback(async () => {
    if (!data?.cursor || isLoadingMore || !actionKey) return;

    setIsLoadingMore(true);
    try {
      const nextPage = await authenticatedFetcher(
        `/api/records?action=${actionKey}&cursor=${data.cursor}${search ? `&search=${encodeURIComponent(search)}` : ''}`
      );
      setAllRecords(prev => [...prev, ...nextPage.records]);
      await mutate({ ...nextPage, records: [...allRecords, ...nextPage.records] }, false);
    } catch (error) {
      console.error('Error loading more records:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [data?.cursor, actionKey, isLoadingMore, allRecords, mutate, search]);

  const importRecords = async () => {
    if (!actionKey || isImporting) return;

    setIsImporting(true);
    try {
      const response = await authenticatedFetcher(
        `/api/records/import?action=${actionKey}`
      );

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
    } catch (error) {
      console.error('Error importing records:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    records: allRecords,
    isLoading,
    isError: error,
    hasMore: !!data?.cursor,
    loadMore,
    isLoadingMore,
    importRecords,
    isImporting
  };
} 