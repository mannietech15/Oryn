import { Schema } from '../../shared/utils/validator';

export interface DownloadQueryDto {
  url: string;
  filename?: string;
}

export const downloadQuerySchema = Schema.object<DownloadQueryDto>({
  url: Schema.string({ min: 1 }) as any,
  filename: Schema.string({ optional: true, max: 100 }) as any,
});
