import type { EducationModule } from '@/src/types/content';

export const percent = (completed: number, total: number) =>
  total === 0 ? 0 : Math.round((completed / total) * 100);

export const overallProgress = (modules: EducationModule[], completedScreenIds: string[]) => {
  const total = modules.reduce((sum, module) => sum + module.screens.length, 0);
  const validIds = new Set(modules.flatMap((module) => module.screens.map((screen) => screen.id)));
  const completed = new Set(completedScreenIds.filter((id) => validIds.has(id))).size;
  return { completed, total, percentage: percent(completed, total) };
};

export const moduleProgress = (module: EducationModule, completedScreenIds: string[]) => {
  const complete = new Set(completedScreenIds);
  const completed = module.screens.filter((screen) => complete.has(screen.id)).length;
  return { completed, total: module.screens.length, percentage: percent(completed, module.screens.length) };
};

export const equalSets = (left: string[], right: string[]) =>
  left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
