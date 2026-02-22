
import { getThemeColorStyles } from './colors';
import { getThemeLayout } from './layouts';
import { Theme, ThemeColor } from './types';
import { availableThemes } from '@/components/event/EventThemeSelection';
import { verticalGreyTheme } from './vertical-theme';
import { circularGreyTheme } from './circular-theme';
import { diagonalGreyTheme } from './diagonal-theme';
import { stackedGreyTheme } from './stacked-theme';

export const getThemeById = (themeId: string | null | undefined): Theme => {
  if (!themeId) {
    return availableThemes[0]; // Default theme
  }
  
  const theme = availableThemes.find(theme => theme.id === themeId);
  return theme || availableThemes[0]; // Return default if not found
};

// Get theme styles including layout
export const getThemeStyles = (themeId: string): ThemeColor => {
  switch(themeId) {
    case 'circular':
      return circularGreyTheme;
    case 'diagonal':
      return diagonalGreyTheme;
    case 'stacked':
      return stackedGreyTheme;
    case 'vertical':
    default:
      return verticalGreyTheme;
  }
};
