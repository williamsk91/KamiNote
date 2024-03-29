/**
 * Color scheme
 *  except for black and white,
 *  each color comes as a pair of lighter and darker version.
 *  src: https://www.materialui.co/flatuicolors
 */
export const colors = {
  black: "#000",
  white: "#fff",

  turqoise: "#1abc9c",
  greensea: "#16a085",
  emerald: "#2ecc71",
  nephritis: "#27ae60",
  peterriver: "#3498db",
  belizehole: "#2980b9",
  amethyst: "#9b59b6",
  wisteria: "#8e44ad",
  wetasphalt: "#34495e",
  midnight: "#2c3e50",
  sunflower: "#f1c40f",
  orange: "#f39c12",
  carrot: "#e67e22",
  pumpkin: "#d35400",
  alizarin: "#e74c3c",
  pomegranate: "#c0392b",
  clouds: "#ecf0f1",
  silver: "#bdc3c7",
  concrete: "#95a5a6",
  asbestos: "#7f8c8d",

  beige: "rgb(247, 246, 243)"
};

export type Color = keyof typeof colors;
