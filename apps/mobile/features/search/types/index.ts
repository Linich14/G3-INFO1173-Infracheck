import { Report } from '../../comments/types';

export interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

export interface SearchFilters {
  searchText: string;
  sortBy?: 'recent' | 'popular' | 'alphabetical';
}