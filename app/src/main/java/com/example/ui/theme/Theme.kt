package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    primaryContainer = PrimaryContainerBlue,
    onPrimaryContainer = Color.White,
    secondaryContainer = Color(0xFF2A2B2F),
    background = DarkBackground,
    surface = DarkSurface,
    onBackground = Color.White,
    onSurface = Color.White,
    onSurfaceVariant = Color(0xFFC2C6D8),
    tertiary = SuccessGreen,
    error = AlertRed,
    outlineVariant = Color(0xFF454748)
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    primaryContainer = PrimaryContainerBlue,
    onPrimary = Color.White,
    onPrimaryContainer = OnPrimaryContainer,
    secondaryContainer = SecondaryContainer,
    background = LightBackground,
    surface = LightSurface,
    onBackground = OnSurface,
    onSurface = OnSurface,
    onSurfaceVariant = OnSurfaceVariant,
    tertiary = SuccessGreen,
    error = AlertRed,
    outlineVariant = OutlineVariant
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Set false to ensure our custom theme displays
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
