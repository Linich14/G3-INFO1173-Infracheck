import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, ArrowLeft, X } from 'lucide-react-native';
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
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (onSearch && isSearching) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch, isSearching]);

  const handleManualSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleFocus = () => {
    setIsSearching(true);
  };

  return (
    <View className='px-4 mb-4'>
      {/* Barra de búsqueda con botón de atrás integrado */}
      <View className='flex-row items-center gap-3'>
        {/* Botón de atrás */}
        <TouchableOpacity 
          className='bg-[#537CF2] rounded-2xl p-4'
          onPress={() => router.push('/home')}
        >
          <ArrowLeft size={24} color='white' />
        </TouchableOpacity>
        
        {/* Barra de búsqueda con redondeado completo */}
        <View className='flex-1 flex-row items-center bg-gray-300 rounded-full px-4 py-3.5'>
          <Search size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleFocus}
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
            <TouchableOpacity 
              onPress={handleClearSearch} 
              className='ml-1'
            >
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
          {loading && (
            <ActivityIndicator size={18} color='#537CF2' className='ml-2' />
          )}
        </View>
      </View>
    </View>
  );
}