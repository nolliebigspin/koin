import { useMemo } from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

type Theme = ReturnType<typeof useUnistyles>["theme"];
type ThemeTypographyKey = keyof Theme["typography"];
type ThemeColorKey = keyof Theme["colors"];
type ThemeSpacingKey = keyof Theme["spacing"];

type SpacingValue = ThemeSpacingKey | number;

export type StyledTextProps = TextProps & {
  variant?: ThemeTypographyKey;
  color?: ThemeColorKey;
  align?: TextStyle["textAlign"];
  mt?: SpacingValue;
  mb?: SpacingValue;
};

export function Text({
  variant,
  color = "text",
  align,
  mt,
  mb,
  style,
  children,
  ...rest
}: StyledTextProps) {
  const { theme } = useUnistyles();

  const resolveSpacing = (value: SpacingValue | undefined): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === "number") return value;
    return theme.spacing[value];
  };

  const textStyle = useMemo<TextStyle>(() => {
    const s: TextStyle = {};

    if (variant !== undefined) Object.assign(s, theme.typography[variant]);
    s.color = theme.colors[color];
    if (align !== undefined) s.textAlign = align;
    if (mt !== undefined) s.marginTop = resolveSpacing(mt);
    if (mb !== undefined) s.marginBottom = resolveSpacing(mb);

    return s;
  }, [variant, color, align, mt, mb, theme]);

  return (
    <RNText style={[textStyle, style]} {...rest}>
      {children}
    </RNText>
  );
}
