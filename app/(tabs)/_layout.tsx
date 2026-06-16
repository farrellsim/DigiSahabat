import { Tabs } from "expo-router";
import { TabBar } from "../../src/components/ui/TabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="digibuddy" />
      <Tabs.Screen name="friends" />
      <Tabs.Screen name="profile" />

      {/* Hidden screens - not shown in the tab bar */}
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
