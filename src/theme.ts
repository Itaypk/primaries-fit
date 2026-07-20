/** Accent palettes (ported from the Claude Design prototype). */
export type AccentName = "clay" | "sage" | "teal";

export interface Palette {
  accent: string;
  soft: string;
  ink: string;
}

export const palettes: Record<AccentName, Palette> = {
  clay: { accent: "#c0684a", soft: "#f4e5dd", ink: "#7d3d29" },
  sage: { accent: "#6f854f", soft: "#e7edd9", ink: "#465a2d" },
  teal: { accent: "#3f8a86", soft: "#dbebe9", ink: "#295c59" },
};

/** Whether axis questions render as a draggable slider or segmented buttons. */
export type AxisStyle = "slider" | "segmented";

/** App-level presentation defaults (were DC props in the prototype). */
export const DEFAULT_ACCENT: AccentName = "teal";
export const DEFAULT_AXIS_STYLE: AxisStyle = "slider";
