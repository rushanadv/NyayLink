import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NyayLink — Legal Access",
    short_name: "NyayLink",
    description: "Understand your legal options and connect with advocates.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FDFEFC",
    theme_color: "#205C43",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    categories: ["legal", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
