export type ProgressState = {
  completedScreenIds: string[];
  completedModuleIds: string[];
  lastScreenByModule: Record<string, string>;
};

export const emptyProgress = (): ProgressState => ({ completedScreenIds: [], completedModuleIds: [], lastScreenByModule: {} });

export function completeScreen(state: ProgressState, screenId: string, moduleId: string, nextScreenId: string, isLast: boolean): ProgressState {
  return {
    completedScreenIds: state.completedScreenIds.includes(screenId) ? state.completedScreenIds : [...state.completedScreenIds, screenId],
    completedModuleIds: isLast && !state.completedModuleIds.includes(moduleId) ? [...state.completedModuleIds, moduleId] : state.completedModuleIds,
    lastScreenByModule: { ...state.lastScreenByModule, [moduleId]: nextScreenId }
  };
}

export function completionPercent(state: ProgressState, requiredScreenIds: string[]): number {
  const required = [...new Set(requiredScreenIds)];
  if (!required.length) return 0;
  const completed = required.filter((id) => state.completedScreenIds.includes(id)).length;
  return Math.round((completed / required.length) * 100);
}

export function serializeProgress(state: ProgressState): string {
  return JSON.stringify(state);
}

export function restoreProgress(serialized: string): ProgressState {
  try {
    const parsed = JSON.parse(serialized) as Partial<ProgressState>;
    if (!Array.isArray(parsed.completedScreenIds) || !Array.isArray(parsed.completedModuleIds) || !parsed.lastScreenByModule || typeof parsed.lastScreenByModule !== 'object') return emptyProgress();
    return {
      completedScreenIds: parsed.completedScreenIds.filter((value): value is string => typeof value === 'string'),
      completedModuleIds: parsed.completedModuleIds.filter((value): value is string => typeof value === 'string'),
      lastScreenByModule: Object.fromEntries(Object.entries(parsed.lastScreenByModule).filter(([, value]) => typeof value === 'string'))
    };
  } catch {
    return emptyProgress();
  }
}
