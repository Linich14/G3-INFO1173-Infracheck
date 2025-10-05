import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, ArrowLeft, RefreshCw, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useDebounce } from '../hooks/useDebounce';

interface UsersSearchBarProps {
  onSearch?: (query: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function UsersSearchBar({ 
  onSearch, 
  loading = false, 
  onRefresh, 
  refreshing = false 
}: UsersSearchBarProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms de delay

  // Efecto para ejecutar búsqueda automática con debounce
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);

  const handleManualSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleRefresh = () => {
    setSearchQuery('');
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };
  return (
    <View className='px-5 mb-5'>
      {/* Fila de navegación y refresh */}
      <View className='flex-row items-center gap-4 mb-3'>
        <TouchableOpacity 
          className='bg-[#537CF2] rounded-2xl p-4'
          onPress={() => router.push('/home')}
        >
          <ArrowLeft size={24} color='white' />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className='bg-[#10b981] rounded-2xl p-4'
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size={24} color='white' />
          ) : (
            <RefreshCw size={24} color='white' />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Barra de búsqueda */}
      <View className='flex-row items-center gap-3'>
        <View className='flex-1 flex-row items-center bg-gray-300 rounded-full px-4 py-4'>
          <Search size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nickname, email o RUT..."
            placeholderTextColor="#6b7280"
            className='flex-1 text-gray-800 px-3 text-base'
            onSubmitEditing={handleManualSearch}
            returnKeyType="search"
            editable={!loading}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} className='ml-2'>
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          className={`rounded-full p-4 ${
            searchQuery.length > 0 ? 'bg-[#537CF2]' : 'bg-gray-500'
          }`}
          onPress={handleManualSearch}
          disabled={loading || searchQuery.length === 0}
        >
          {loading ? (
            <ActivityIndicator size={20} color='white' />
          ) : (
            <Search size={20} color='white' />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}