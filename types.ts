export interface Meme {
  id: string;
  imageUrl: string;
  prompt: string;
  title: string;
  description?: string;
  isDarkHumor: boolean;
  timestamp: number;
}

export interface GenerateMemeResponse {
  success: boolean;
  imageUrl?: string;
  title?: string;
  error?: string;
}

export type LoadingState = 'idle' | 'generating' | 'success' | 'error';