import { Link, Stack } from 'expo-router';

import { Text } from 'react-native';

import { Container } from '~/components/Container';
import { useLanguage } from '~/contexts/LanguageContext';

export default function NotFoundScreen() {
    const { t } = useLanguage();
    
    return (
        <>
            <Stack.Screen options={{ title: t('notFoundTitle') }} />
            <Container>
                <Text className={styles.title}>{t('notFoundMessage')}</Text>
                <Link href="/" className={styles.link}>
                    <Text className={styles.linkText}>{t('notFoundGoHome')}</Text>
                </Link>
            </Container>
        </>
    );
}

const styles = {
    title: `text-xl font-bold`,
    link: `mt-4 pt-4`,
    linkText: `text-base text-[#2e78b7]`,
};
