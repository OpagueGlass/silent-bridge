import { useTheme } from 'react-native-paper'
import { theme as appTheme, shadows, spacing, typography } from '../theme/theme'

export function useAppTheme() {
  const paperTheme = useTheme()
  
  return {
    ...paperTheme,
    spacing,
    typography,
    shadows,
    // Ensure we're using our custom theme
    colors: appTheme.colors,
    roundness: appTheme.roundness,
  }
}
