import { join } from 'node:path';

export const RECIPE_IMAGE_UPLOAD_DIR = join(
  process.cwd(),
  'uploads',
  'recipes',
);

export const RECIPE_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const RECIPE_IMAGE_ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
