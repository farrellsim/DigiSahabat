import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Home,
  BookOpen,
  Bot,
  Users,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { theme } from "../../constants/theme";

/** Only these routes appear in the bar; hidden routes (chat, settings) are skipped. */
const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  home: { label: "Home", icon: Home },
  learn: { label: "Learn", icon: BookOpen },
  digibuddy: { label: "DigiBuddy", icon: Bot },
  friends: { label: "Friends", icon: Users },
  profile: { label: "Profile", icon: User },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;
  const visible = state.routes.filter((r) => TABS[r.name]);

  return (
    <View
      className="bg-card border-t border-border"
      style={{
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        paddingTop: 8,
        shadowColor: "#0F172A",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -3 },
        elevation: 8,
      }}
    >
      <View className="flex-row items-center justify-around px-2">
        {visible.map((route) => {
          const { label, icon: Icon } = TABS[route.name];
          const isFocused = activeName === route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              className="flex-1 items-center justify-center"
            >
              <View
                className="items-center justify-center rounded-2xl px-4 py-1.5"
                style={{
                  backgroundColor: isFocused ? theme.color.mint : "transparent",
                }}
              >
                <Icon
                  size={22}
                  color={isFocused ? theme.color.primary : theme.color.muted}
                  strokeWidth={isFocused ? 2.4 : 2}
                />
              </View>
              <Text
                className="text-[10px] mt-1"
                style={{
                  color: isFocused ? theme.color.primary : theme.color.muted,
                  fontWeight: isFocused ? "700" : "500",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
