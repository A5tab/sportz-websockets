import { 
  Pressable, 
  StyleSheet, 
  useColorScheme, 
  StyleProp, 
  ViewStyle, 
  PressableProps 
} from 'react-native'
import React from 'react'
import { getTheme } from '../constants/Colors'

interface ThemedButtonProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'outline';
}

const ThemedButton = ({ style, variant = 'primary', ...props }: ThemedButtonProps) => {
    const theme = getTheme(useColorScheme() ?? "light")
    
    return (
        <Pressable
            {...props}
            
            style={({ pressed }) => [
                styles.button,
                { 
                  backgroundColor: variant === 'primary' ? theme.primary : 'transparent',
                  borderColor: theme.primary,
                  borderWidth: variant === 'outline' ? 1 : 0
                },
                pressed && styles.pressed,
                style, 
            ]}
        />
    )
}

export default ThemedButton

const styles = StyleSheet.create({
    button: {
        borderRadius: 8, 
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }]
    }
})