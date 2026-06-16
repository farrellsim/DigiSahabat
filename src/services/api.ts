// Replace with your actual backend URL
const API_BASE_URL = "http://localhost:3000/api";
// For Android emulator use: 'http://10.0.2.2:3000/api'
// For iOS simulator use: 'http://localhost:3000/api'
// For physical device use your computer's IP: 'http://192.168.x.x:3000/api'

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  try {
    const formData = new FormData();

    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as any);

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to transcribe");
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error("Transcription API error:", error);
    throw error;
  }
}
