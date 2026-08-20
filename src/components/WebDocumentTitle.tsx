import { usePathname } from 'expo-router';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';

export function WebDocumentTitle() {
  const pathname = usePathname();
  const { state } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const title = getTitle(pathname, state.language, t);
    if (document.title !== title) document.title = title;
  }, [pathname, state.language, t]);
  return null;
}

function getTitle(pathname: string, locale: 'en' | 'es', t: (key: string) => string) {
  if (pathname === '/' || pathname === '/index') return `${t('home')} · ${t('appName')}`;
  if (pathname === '/settings') return `${t('settings')} · ${t('appName')}`;
  if (pathname === '/about') return `${t('about')} · ${t('appName')}`;
  if (pathname === '/ai') return `Vela · ${t('appName')}`;
  const completion = pathname.match(/^\/module\/([^/]+)\/complete$/);
  if (completion) {
    const module = getModule(locale, completion[1]);
    return module ? `${t('moduleComplete')} · ${module.shortTitle}` : t('moduleComplete');
  }
  const moduleOverview = pathname.match(/^\/module\/([^/]+)$/);
  if (moduleOverview) {
    const module = getModule(locale, moduleOverview[1]);
    return module ? `${module.shortTitle} · ${t('appName')}` : t('appName');
  }
  const lesson = pathname.match(/^\/lesson\/([^/]+)\/([^/]+)$/);
  if (lesson) {
    const module = getModule(locale, lesson[1]);
    const screen = module?.screens.find((candidate) => candidate.id === lesson[2]);
    return screen ? `${screen.title} · ${module?.shortTitle ?? t('appName')}` : t('appName');
  }
  return t('appName');
}
