import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import "../global.css";
import { getSession } from "../lib/protoSession";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setIsAuthed(!!s.isAuthed);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

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
