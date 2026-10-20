/**
 * Restrained Tonal Palette for GPU-Accelerated Scroll Background
 * 
 * Single directional color journey:
 * 1. layer-start (Top / Hero): Deep indigo-navy (#090B10)
 * 2. layer-mid (Middle): Warm near-black with faint gold undertone (#120F0A), catching the #C5A059 gold accent
 * 3. layer-end (Bottom / Footer): Pure pitch black (#000000)
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
    name: "Deep Indigo Navy",
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% -10%, #131A2B 0%, #0D131F 50%, #090B10 100%)",
  },
  mid: {
    id: "layer-mid",
    name: "Warm Gold Charcoal",
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% 30%, rgba(197, 160, 89, 0.12) 0%, #1A150D 40%, #120F0A 75%, #0A0906 100%)",
  },
  end: {
    id: "layer-end",
    name: "Pitch Black",
    gradient:
      "radial-gradient(ellipse 130% 90% at 50% 60%, #0B0D12 0%, #050608 55%, #000000 100%)",
  },
};

export const STATIC_HERO_GRADIENT = PALETTE_STOPS.start.gradient;
