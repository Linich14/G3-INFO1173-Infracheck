import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserCircle2, Bell, Globe, Sun, Check, ChevronDown } from 'lucide-react-native';

type RowProps = {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

function SettingRow({ icon, label, right, onPress, disabled }: RowProps) {
  const Comp = onPress ? TouchableOpacity : View;
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

export default function SettingsPag() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [appearanceEnabled, setAppearanceEnabled] = useState(true);

  // Idioma
  const LANGS = ['Español', 'English'] as const;
  type Lang = typeof LANGS[number];
  const [language, setLanguage] = useState<Lang>('Español');
  const [langOpen, setLangOpen] = useState(false);

  const pickLang = (lang: Lang) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090A0D]">
      {/* Header “píldora” */}
      <View className="bg-[#13161E] p-3 mx-4 mt-2 mb-3 rounded-[12px]">
        <Text className="text-[#537CF2] font-bold text-center text-2xl">Ajustes</Text>
      </View>

      {/* Cuenta */}
      <SettingRow
        icon={<UserCircle2 size={28} color="#FF8C2A" />}
        label="Cuenta"
        onPress={() => {}}
      />

      {/* Notificaciones */}
      <SettingRow
        icon={<Bell size={28} color="#F9504F" />}
        label="Notificaciones"
        right={
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ false: '#3b3b3b', true: '#22c55e' }}
            thumbColor="#fff"
          />
        }
      />

      <SettingRow
        icon={<Globe size={28} color="#22c55e" />}
        label="Idioma"
        onPress={() => setLangOpen((v) => !v)}
        right={
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-400 text-xl">{language}</Text>
            <ChevronDown size={18} color="#9CA3AF" />
          </View>
        }
      />
      {langOpen && (
        <View className="mx-4 -mt-2 mb-2 bg-[#10131A] rounded-[12px] overflow-hidden border border-[#1f2937]">
          {LANGS.map((l, idx) => {
            const selected = l === language;
            return (
              <TouchableOpacity
                key={l}
                onPress={() => pickLang(l)}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  idx !== LANGS.length - 1 ? 'border-b border-[#1f2937]' : ''
                } ${selected ? 'bg-[#151a23]' : ''}`}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base">{l}</Text>
                {selected ? <Check size={18} color="#22c55e" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Apariencia */}
      <SettingRow
        icon={<Sun size={28} color="#FFD85A" />}
        label="Apariencia"
        right={
          <Switch
            value={appearanceEnabled}
            onValueChange={setAppearanceEnabled}
            trackColor={{ false: '#3b3b3b', true: '#22c55e' }}
            thumbColor="#fff"
          />
        }
      />
    </SafeAreaView>
  );
}