import * as Haptics from "expo-haptics";

const { ImpactFeedbackStyle, NotificationFeedbackType } = Haptics;

/** Soft tap — digit keys, routine actions */
export const tap = () => Haptics.impactAsync(ImpactFeedbackStyle.Soft);

/** Medium tap — backspace, swap */
export const medium = () => Haptics.impactAsync(ImpactFeedbackStyle.Medium);

/** Rigid click — decimal point, toggles */
export const rigid = () => Haptics.impactAsync(ImpactFeedbackStyle.Rigid);

/** Success confirmation — completing a step */
export const success = () => Haptics.notificationAsync(NotificationFeedbackType.Success);

/** Warning pulse — destructive/reset actions */
export const warning = () => Haptics.notificationAsync(NotificationFeedbackType.Warning);
