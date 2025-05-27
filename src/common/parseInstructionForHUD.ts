export const getDirectionSymbol = (text: string): string => {
  if (/좌회전|왼쪽/.test(text)) return '⬅️';
  if (/우회전|오른쪽/.test(text)) return '➡️';
  if (/직진|계속|진입/.test(text)) return '⬆️';
  if (/출구|빠져나가|진출/.test(text)) return '↘️';
  if (/유턴/.test(text)) return '🔄';
  if (/도착/.test(text)) return '🏁';
  return '⬆️';
};

export const extractLandmark = (text: string): string => {
  const quoteMatch = text.match(/["'“‘](.+?)["'”’]/);
  if (quoteMatch) return quoteMatch[1];

  const directionMatch = text.match(/([가-힣0-9]+?)\s*방면으로/);
  if (directionMatch) return directionMatch[1];

  if (/도착/.test(text)) return '목적지';
  return '직진';
};

export const parseInstructionForHUD = (
  instruction: string
): { arrow: string; landmark: string } => {
  return {
    arrow: getDirectionSymbol(instruction),
    landmark: extractLandmark(instruction),
  };
};
