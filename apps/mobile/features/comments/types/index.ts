export interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
}

export interface Report {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  image?: any;
  upvotes: number;
  comments: Comment[];
  categoria?: string; // Categoría del reporte (Infraestructura, Limpieza, Alumbrado, etc.)
}

export interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postTitle: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
}