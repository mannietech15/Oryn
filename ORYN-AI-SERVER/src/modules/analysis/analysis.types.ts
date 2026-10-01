export interface AnalysisRequestDto {
  prompt?: string;
  model?: string;
  language?: string;
}

export interface AnalysisResponseDto {
  analysis: string;
  filename: string;
}
