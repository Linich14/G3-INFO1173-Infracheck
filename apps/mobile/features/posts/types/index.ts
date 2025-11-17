import { ImageSourcePropType } from 'react-native';

export interface VotesInfo {
    count: number;
    usuario_ha_votado: boolean;
}

export interface FollowInfo {
    is_following: boolean;
    seguidores_count: number;
}

export interface UrgenciaInfo {
    valor: number;
    etiqueta: string;
}

export interface UbicacionInfo {
    latitud: number;
    longitud: number;
}

export interface UsuarioInfo {
    id: number;
    nickname: string;
}

export interface FollowedReportDetail {
    id: number;
    titulo: string;
    descripcion?: string;
    ubicacion: UbicacionInfo;
    urgencia: UrgenciaInfo;
    fecha_creacion: string;
    usuario?: UsuarioInfo;
    estado: string;
    tipo?: string;
    ciudad?: string;
    categoria?: string;
    imagen?: string;
}

export interface FollowedReportItem {
    id: number;
    titulo: string;
    fecha_seguimiento: string;
    reporte: FollowedReportDetail;
}

export interface FollowedReportsResponse {
    count: number;
    results: FollowedReportItem[];
}

export interface ReportCardProps {
    id: string;
    title: string;
    author: string;
    timeAgo: string;
    image?: ImageSourcePropType;
    upvotes?: number; // Deprecated - use votos.count
    initialVoteCount?: number; // Deprecated
    initialUserHasVoted?: boolean; // Deprecated
    commentsCount?: number; // Contador de comentarios
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
    onFollow?: () => void;
    onMore?: () => void;
    onLocation?: () => void;
    onUpvote?: () => void;
    onComment?: () => void;
    onShare?: () => void;
    followLabel?: string;
    aspectRatio?: number;
    isFollowed?: boolean;
    isUpvoted?: boolean;
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
