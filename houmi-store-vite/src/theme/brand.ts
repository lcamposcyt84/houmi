// Brand colors extracted from Houmi logo
// Primary: Deep navy blue from the circle background
// Accent: Vibrant yellow/gold from the text

export const brandColors = {
  // Primary palette - from logo
  primary: "#1B3A6D",        // Deep navy blue
  primaryLight: "#2A4F8F",   // Lighter navy
  primaryDark: "#0F2444",    // Darker navy
  
  // Secondary/Accent - from logo text
  accent: "#F7C72C",         // Vibrant yellow/gold
  accentLight: "#FFD95A",    // Lighter gold
  accentDark: "#D4A520",     // Darker gold
  
  // Neutrals
  background: "#FAFBFC",     // Soft white
  surface: "#FFFFFF",        // Pure white
  surfaceElevated: "#F5F7FA", // Slightly elevated surface
  
  // Text colors
  text: "#1A1D21",           // Near black
  textMuted: "#6B7280",      // Muted gray
  textOnPrimary: "#FFFFFF",  // White text on primary
  textOnAccent: "#1B3A6D",   // Navy text on accent
  
  // Semantic colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  
  // Border colors
  border: "#E5E7EB",
  borderFocus: "#1B3A6D",
};

export const cssVariables = `
  :root {
    --brand-primary: ${brandColors.primary};
    --brand-primary-light: ${brandColors.primaryLight};
    --brand-primary-dark: ${brandColors.primaryDark};
    --brand-secondary: ${brandColors.accent};
    --brand-accent: ${brandColors.accent};
    --brand-accent-light: ${brandColors.accentLight};
    --brand-accent-dark: ${brandColors.accentDark};
    --brand-background: ${brandColors.background};
    --brand-surface: ${brandColors.surface};
    --brand-surface-elevated: ${brandColors.surfaceElevated};
    --brand-text: ${brandColors.text};
    --brand-text-muted: ${brandColors.textMuted};
    --brand-text-on-primary: ${brandColors.textOnPrimary};
    --brand-text-on-accent: ${brandColors.textOnAccent};
    --brand-success: ${brandColors.success};
    --brand-warning: ${brandColors.warning};
    --brand-error: ${brandColors.error};
    --brand-info: ${brandColors.info};
    --brand-border: ${brandColors.border};
    --brand-border-focus: ${brandColors.borderFocus};
  }
`;

export default brandColors;





