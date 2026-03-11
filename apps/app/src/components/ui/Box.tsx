import { useMemo } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

type Theme = ReturnType<typeof useUnistyles>["theme"];
type ThemeSpacingKey = keyof Theme["spacing"];
type ThemeColorKey = keyof Theme["colors"];
type ThemeRadiusKey = keyof Theme["radius"];

type SpacingValue = ThemeSpacingKey | number;

export type BoxProps = ViewProps & {
  p?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;
  pt?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  pr?: SpacingValue;
  m?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  mt?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mr?: SpacingValue;
  gap?: SpacingValue;

  flex?: number;
  direction?: ViewStyle["flexDirection"];
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  wrap?: ViewStyle["flexWrap"];

  bg?: ThemeColorKey;

  radius?: ThemeRadiusKey | number;
  borderColor?: ThemeColorKey;
  borderWidth?: number;

  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  minHeight?: ViewStyle["minHeight"];
  minWidth?: ViewStyle["minWidth"];
};

export function Box({
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  gap,
  flex,
  direction,
  align,
  justify,
  wrap,
  bg,
  radius,
  borderColor,
  borderWidth,
  width,
  height,
  minHeight,
  minWidth,
  style,
  children,
  ...rest
}: BoxProps) {
  const { theme } = useUnistyles();

  const resolveSpacing = (value: SpacingValue | undefined): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === "number") return value;
    return theme.spacing[value];
  };

  const boxStyle = useMemo<ViewStyle>(() => {
    const s: ViewStyle = {};

    if (p !== undefined) s.padding = resolveSpacing(p);
    if (px !== undefined) s.paddingHorizontal = resolveSpacing(px);
    if (py !== undefined) s.paddingVertical = resolveSpacing(py);
    if (pt !== undefined) s.paddingTop = resolveSpacing(pt);
    if (pb !== undefined) s.paddingBottom = resolveSpacing(pb);
    if (pl !== undefined) s.paddingLeft = resolveSpacing(pl);
    if (pr !== undefined) s.paddingRight = resolveSpacing(pr);

    if (m !== undefined) s.margin = resolveSpacing(m);
    if (mx !== undefined) s.marginHorizontal = resolveSpacing(mx);
    if (my !== undefined) s.marginVertical = resolveSpacing(my);
    if (mt !== undefined) s.marginTop = resolveSpacing(mt);
    if (mb !== undefined) s.marginBottom = resolveSpacing(mb);
    if (ml !== undefined) s.marginLeft = resolveSpacing(ml);
    if (mr !== undefined) s.marginRight = resolveSpacing(mr);

    if (gap !== undefined) s.gap = resolveSpacing(gap);

    if (flex !== undefined) s.flex = flex;
    if (direction !== undefined) s.flexDirection = direction;
    if (align !== undefined) s.alignItems = align;
    if (justify !== undefined) s.justifyContent = justify;
    if (wrap !== undefined) s.flexWrap = wrap;

    if (bg !== undefined) s.backgroundColor = theme.colors[bg];
    if (radius !== undefined)
      s.borderRadius = typeof radius === "number" ? radius : theme.radius[radius];
    if (borderColor !== undefined) s.borderColor = theme.colors[borderColor];
    if (borderWidth !== undefined) s.borderWidth = borderWidth;

    if (width !== undefined) s.width = width;
    if (height !== undefined) s.height = height;
    if (minHeight !== undefined) s.minHeight = minHeight;
    if (minWidth !== undefined) s.minWidth = minWidth;

    return s;
  }, [
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    m,
    mx,
    my,
    mt,
    mb,
    ml,
    mr,
    gap,
    flex,
    direction,
    align,
    justify,
    wrap,
    bg,
    radius,
    borderColor,
    borderWidth,
    width,
    height,
    minHeight,
    minWidth,
    theme,
  ]);

  return (
    <View style={[boxStyle, style]} {...rest}>
      {children}
    </View>
  );
}
