export interface FortuneStick {
  id: number;
  level: string;
  title: string;
  poem: string;
  meaning: string;
  advice: string;
  story: string;
}

export interface StickResponse {
  success: boolean;
  data?: FortuneStick;
  error?: string;
}
