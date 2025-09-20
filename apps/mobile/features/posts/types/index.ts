import { ImageSourcePropType } from 'react-native';

export interface ReportCardProps {
  title: string;
  author: string;
  timeAgo: string;                 // ej: "3d"
  image?: ImageSourcePropType | null; // opcional
  upvotes?: number;
  onFollow?: () => void;
  onMore?: () => void;
  onLocation?: () => void;
  onUpvote?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  followLabel?: string;            // ej: "Seguir"
  aspectRatio?: number;            // ej: 16/9 (default)
}

export interface Post {
    id: string;
    title: string;
    author: string;
    timeAgo: string;
    image?: ImageSourcePropType | null;
    upvotes: number;
    commentCount?: number;
}

export interface PostInteractions {
    onFollow?: () => void;
    onMore?: () => void;
    onLocation?: () => void;
    onUpvote?: () => void;
    onComment?: () => void;
    onShare?: () => void;
}
