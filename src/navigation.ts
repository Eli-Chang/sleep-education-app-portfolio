import type { EducationModule } from './content.js';

export function nextScreenId(module: EducationModule, currentScreenId: string): string | null {
  const index = module.screens.findIndex((screen) => screen.id === currentScreenId);
  if (index < 0 || index + 1 >= module.screens.length) return null;
  return module.screens[index + 1].id;
}
