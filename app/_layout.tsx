import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import "../global.css";
import { getSession } from "../lib/protoSession";
import { AppSplash } from "../src/components/AppSplash";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      // Restore session and keep the branded splash up for a calm minimum time.
      const [s] = await Promise.all([
        getSession(),
        new Promise((r) => setTimeout(r, 1600)),
      ]);
      setIsAuthed(!!s.isAuthed);
      setReady(true);
    })();
  }, []);

  if (!ready) return <AppSplash />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthed ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
