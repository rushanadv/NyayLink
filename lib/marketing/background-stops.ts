/**
 * White and Forest Green Palette for GPU-Accelerated Scroll Background
 * 
 * Clean, luminous white-dominant canvas with selective pale mint nuances:
 * 1. layer-start (Top / Hero): Pure luminous white (#FFFFFF)
 * 2. layer-mid (Middle): Clean white with subtle pale mint warmth (#FFFFFF -> rgba(234, 243, 237, 0.45) -> #FFFFFF)
 * 3. layer-end (Bottom / Footer): Luminous white resolving into pristine footer (#FFFFFF)
 */

export interface PaletteStop {
  id: string;
  name: string;
  gradient: string;
}

export const PALETTE_STOPS: {
  start: PaletteStop;
  mid: PaletteStop;
  end: PaletteStop;
} = {
  start: {
    id: "layer-start",
    name: "Luminous Pure White",
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% -10%, #FFFFFF 0%, #FFFFFF 60%, #FAFCFB 100%)",
  },
  mid: {
    id: "layer-mid",
    name: "Pristine White & Pale Mint",
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% 30%, rgba(234, 243, 237, 0.45) 0%, #FFFFFF 50%, #FAFCFB 100%)",
  },
  end: {
    id: "layer-end",
    name: "Architectural White Canvas",
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% 60%, #FFFFFF 0%, #F5F9F6 60%, #FFFFFF 100%)",
  },
};

export const STATIC_HERO_GRADIENT = PALETTE_STOPS.start.gradient;
