export interface EmailRequestDto {
  to: string | string[];
  subject?: string;
  body?: string;
  message?: string;
  content?: string;
}

export interface EmailResultDto {
  success: boolean;
  messageId: string;
  previewUrl?: string | null;
}
