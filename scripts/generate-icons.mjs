// Code-native brand mark; generated PNGs are included so app users need no image tool.
import sharp from "sharp";
const svg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="80" fill="#172334"/><path d="M150 355V170H205V192Q250 150 295 175Q340 195 340 250V355H280V250Q280 205 240 225Q210 235 210 270V355Z" fill="white"/><circle cx="370" cy="330" r="25" fill="#e88b52"/></svg>',
);
await sharp(svg).resize(192).png().toFile("public/icon-192.png");
await sharp(svg).png().toFile("public/icon-512.png");
