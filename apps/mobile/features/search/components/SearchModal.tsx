import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { SearchModalProps } from '../types';
import { Report } from '../../comments/types';
import { useLanguage } from '~/contexts/LanguageContext';

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  reports,
  onSelectReport,
}) => {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState('');

  const filteredReports = useMemo(() => {
    if (!searchText.trim()) return reports;
    
    return reports.filter(report => 
      report.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [reports, searchText]);

  const handleReportSelect = (report: Report) => {
    onSelectReport(report);
    setSearchText('');
    onClose();
  };

  const renderReportItem = (report: Report) => (
    <TouchableOpacity
      key={report.id}
      onPress={() => handleReportSelect(report)}
      className="bg-[#13161E] rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-700"
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-white text-lg font-semibold flex-1 mr-3" numberOfLines={2}>
          {report.title}
        </Text>
        <View className="bg-[#537CF2] px-3 py-1 rounded-full min-w-[60px]">
          <Text className="text-white text-xs font-medium text-center">
            {report.upvotes} Ups
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-400 text-xs flex-1 mr-2" numberOfLines={1}>
          {t('searchBy')} {report.author}
        </Text>
        <Text className="text-gray-400 text-xs">
          {report.timeAgo}
        </Text>
      </View>
      
      <View className="flex-row items-center mt-2">
        <Text className="text-gray-400 text-xs">
          {report.comments.length} {report.comments.length !== 1 ? t('searchCommentsPlural') : t('searchCommentsSingular')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ backgroundColor: '#090A0D', flex: 1 }}>
        <View style={{ backgroundColor: '#090A0D', flex: 1 }}>
          {/* Header */}
          <View className="bg-[#13161E] flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-row items-center flex-1">
              <Search size={24} color="#537CF2" />
              <Text className="text-[#537CF2] text-lg font-bold ml-3">
                {t('searchTitle')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full"
              style={{ backgroundColor: 'rgba(83, 124, 242, 0.1)' }}
            >
              <X size={20} color="#537CF2" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="p-4 bg-[#090A0D]">
            <View 
              className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border"
              style={{ borderColor: '#537CF2' }}
            >
              <Search size={20} color="#9CA3AF" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-white text-base"
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results */}
          <ScrollView 
            className="flex-1"
            style={{ backgroundColor: '#090A0D' }}
            showsVerticalScrollIndicator={false}
          >
            {searchText.trim() === '' ? (
              <View className="flex-1 justify-center items-center py-20">
                <Search size={48} color="#537CF2" />
                <Text className="text-[#537CF2] text-lg font-medium mt-4">
                  {t('searchPlaceholder')}
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                  {t('searchTitle')}
                </Text>
              </View>
            ) : filteredReports.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <Search size={48} color="#537CF2" />
                <Text className="text-[#537CF2] text-lg font-medium mt-4">
                  {t('searchNoResults')}
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                  {t('searchNoResults')} &quot;{searchText}&quot;
                </Text>
              </View>
            ) : (
              <>
                <View className="px-4 py-3 bg-[#13161E] mx-4 rounded-lg mt-2">
                  <Text className="text-[#537CF2] text-sm font-medium">
                    {filteredReports.length} {filteredReports.length !== 1 ? t('searchCommentsPlural') : t('searchCommentsSingular')}
                  </Text>
                </View>
                <View className="py-4">
                  {filteredReports.map(renderReportItem)}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};