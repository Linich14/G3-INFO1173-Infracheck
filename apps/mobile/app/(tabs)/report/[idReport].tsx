import { useLocalSearchParams, useRouter } from 'expo-router';
import ReportDetailsScreen from '~/features/report/screens/ReportDetails.screen';

export default function ReportDetailsRoute() {
    const router = useRouter();

    // Cambiar de params.id a params.idReport para coincidir con el nombre del archivo
    const params = useLocalSearchParams<{ idReport?: string | string[] }>();
    const reportId =
        typeof params.idReport === 'string'
            ? params.idReport
            : Array.isArray(params.idReport)
              ? params.idReport[0]
              : '';

    const onBack = () => {
        try {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/home');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            router.replace('/(tabs)/home');
        }
    };

    return <ReportDetailsScreen reportId={reportId} onBack={onBack} />;
}
