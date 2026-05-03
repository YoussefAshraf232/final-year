export const ALLOWED_IMAGE_DOMAINS = [
  "images.unsplash.com",
  "your-cdn.example.com",
];

export function isAllowedImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      ALLOWED_IMAGE_DOMAINS.includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}
