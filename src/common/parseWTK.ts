export const parseWKT = (pointStr: string): [number, number] | null => {
  const match = pointStr.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return null;
  const [, lat, lng] = match;
  return [parseFloat(lng), parseFloat(lat)];
};
