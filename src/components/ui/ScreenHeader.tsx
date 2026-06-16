import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { theme } from "../../constants/theme";

/** Consistent screen header with optional back button and right slot. */
export function ScreenHeader({
  title,
  subtitle,
  showBack,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center px-5 pt-2 pb-4 bg-card">
      {showBack ? (
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-muted"
        >
          <ChevronLeft size={20} color={theme.color.foreground} />
        </TouchableOpacity>
      ) : null}

      <View className="flex-1">
        <Text className="text-[22px] font-bold text-foreground">{title}</Text>
        {subtitle ? (
          <Text className="text-[13px] text-muted-foreground mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </View>
  );
}
