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
    timeAgo: string; // ej: "3d"
    image?: ImageSourcePropType | null; // opcional
    upvotes?: number; // Deprecated - usar votos?.count
    initialVoteCount?: number; // Deprecated - usar votos?.count
    initialUserHasVoted?: boolean; // Deprecated - usar votos?.usuario_ha_votado
    votos?: VotesInfo; // Nueva estructura embebida desde el backend
    seguimiento?: FollowInfo; // información de seguimiento del backend
    ubicacion?: UbicacionInfo; // Nueva estructura de ubicación
    onFollow?: () => void;
    onMore?: () => void;
    onLocation?: () => void;
    onUpvote?: () => void;
    onComment?: () => void;
    onShare?: () => void;
    followLabel?: string; // ej: "Seguir"
    aspectRatio?: number; // ej: 16/9 (default)
    isFollowed?: boolean; // Deprecated - usar seguimiento?.is_following
    isUpvoted?: boolean; // Deprecated - usar votos?.usuario_ha_votado
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
