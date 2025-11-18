export interface Comment {
    id: string | number;
    author: string;
    content: string;
    timeAgo: string;
    usuario?: {
        id: number;
        nickname: string;
    };
    puede_eliminar?: boolean;
    es_autor?: boolean;
    es_admin?: boolean;
}

export interface Report {
    id: string;
    title: string;
    author: string;
    authorId?: string;
    timeAgo: string;
    image?: any;
    upvotes: number;
    comments: Comment[];
    categoria?: string; // Categoría del reporte (Infraestructura, Limpieza, Alumbrado, etc.)
    votos?: {
        count: number;
        usuario_ha_votado: boolean;
    };
    seguimiento?: {
        is_following: boolean;
        seguidores_count: number;
    };
    ubicacion?: {
        latitud: number;
        longitud: number;
    };
}

export interface CommentsModalProps {
    visible: boolean;
    onClose: () => void;
    postTitle: string;
    reportId: string | number;
    comments: Comment[];
    onAddComment: (content: string) => Promise<void>;
    onRefreshComments?: () => void;
}
