import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { UserCircle2, Bell, Globe, Sun, Check, ChevronDown } from 'lucide-react-native';
import { SonidosNotificacion } from '~/components/SonidosNotificacion';
import { useLanguage } from '~/contexts/LanguageContext';

/** ---------- UI Row Reutilizable ---------- */
type RowProps = {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

function SettingRow({ icon, label, right, onPress, disabled }: RowProps) {
  const Comp: any = onPress ? TouchableOpacity : View;
  return (
    <Comp
      disabled={disabled}
      onPress={onPress}
      className="p-4 bg-[#13161E] mx-4 my-2 rounded-[12px] flex-row items-center active:opacity-80"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
        {icon}
      </View>
      <Text className="text-white text-[22px] flex-1">{label}</Text>
      {right ? <View className="items-center justify-center">{right}</View> : null}
    </Comp>
  );
}

/** ---------- Pantalla de Ajustes ---------- */
export default function SettingsPag() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [appearanceEnabled, setAppearanceEnabled] = useState(true);
  const { locale, setLocale, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const LANGS: { code: 'es' | 'en'; label: string }[] = useMemo(
    () => [
      { code: 'es', label: locale === 'es' ? t('spanish') : t('spanish') },
      { code: 'en', label: locale === 'en' ? t('english') : t('english') },
    ],
    [locale, t]
  );

  const currentLangLabel =
    locale === 'es' ? t('spanish') : t('english');

  const pickLang = (code: 'es' | 'en') => {
    setLocale(code);
    setLangOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090A0D]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header "píldora" */}
        <View className="bg-[#13161E] p-3 mx-4 mt-2 mb-3 rounded-[12px]">
          <Text className="text-[#537CF2] font-bold text-center text-2xl">{t('settings')}</Text>
        </View>

        {/* Cuenta / Account */}
        <SettingRow
          icon={<UserCircle2 size={28} color="#FF8C2A" />}
          label={t('account')}
          onPress={() => router.push('/profile')}
        />

        {/* Notificaciones / Notifications */}
        <SettingRow
          icon={<Bell size={28} color="#F9504F" />}
          label={t('notifications')}
          right={
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: '#3b3b3b', true: '#22c55e' }}
              thumbColor="#fff"
            />
          }
        />

      {/* Idioma / Language */}
      <SettingRow
        icon={<Globe size={28} color="#22c55e" />}
  label={t('language')}
        onPress={() => setLangOpen(v => !v)}
        right={
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-400 text-xl">{currentLangLabel}</Text>
            <ChevronDown size={18} color="#9CA3AF" />
          </View>
        }
      />

      {langOpen && (
        <View className="mx-4 -mt-2 mb-2 bg-[#10131A] rounded-[12px] overflow-hidden border border-[#1f2937]">
          {LANGS.map((opt, idx) => {
            const selected = opt.code === locale;
            return (
              <TouchableOpacity
                key={opt.code}
                onPress={() => pickLang(opt.code)}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  idx !== LANGS.length - 1 ? 'border-b border-[#1f2937]' : ''
                } ${selected ? 'bg-[#151a23]' : ''}`}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base">{opt.label}</Text>
                {selected ? <Check size={18} color="#22c55e" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Apariencia / Appearance */}
      <SettingRow
        icon={<Sun size={28} color="#FFD85A" />}
        label={t('appearance')}
        right={
          <Switch
            value={appearanceEnabled}
            onValueChange={setAppearanceEnabled}
            trackColor={{ false: '#3b3b3b', true: '#22c55e' }}
            thumbColor="#fff"
          />
        }
      />

      {/* Sonidos de Notificación */}
      <View className="mx-4 my-2">
        <SonidosNotificacion />
      </View>
    </ScrollView>
  </SafeAreaView>
);
}