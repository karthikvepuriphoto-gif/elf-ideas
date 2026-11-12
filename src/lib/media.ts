export function photoUrl(file: string, thumb = false): string {
  const folder = thumb ? "thumbs" : "photos";
  return `${import.meta.env.BASE_URL}${folder}/${file}`;
}
