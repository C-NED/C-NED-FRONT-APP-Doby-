import { ImageSourcePropType } from 'react-native';

export const getDirectionSymbol = (text: string): ImageSourcePropType | string => {
  if (text.includes('좌회전') || text.includes('왼쪽')) {
    return require('../styles/icons/navi_left.png');
  }
  if (text.includes('우회전') || text.includes('오른쪽')) {
    return require('../styles/icons/navi_right.png');
  }
  if (text.includes('출구') || text.includes('빠져나가') || text.includes('진출')) {
    return require('../styles/icons/navi_escape.png');
  }
  if (text.includes('유턴')) {
    return require('../styles/icons/navi_rotate.png');
  }
  if (text.includes('도착')) {
    return require('../styles/icons/navi_flag.png'); // 특별히 처리할 텍스트용
  }
  return require('../styles/icons/navi_up.png');
};

export const extractLandmark = (text: string): string => {
  const quoteMatch = text.match(/["'“‘](.+?)["'”’]/);
  if (quoteMatch) return quoteMatch[1];

  const directionMatch = text.match(/([가-힣0-9]+?)\s*방면으로/);
  if (directionMatch) {
    console.log('Direction Match:', directionMatch[1]); // 디버깅용 로그
    return directionMatch[1];
}

  if (text.includes('도착')) return '목적지';

  return '직진';
};

export const parseInstructionForHUD = (
  instruction: string,
  nextdistance: number
): { arrow: ImageSourcePropType | string; landmark: string } => {
  const rawLandmark = extractLandmark(instruction);
  const distancePrefix = nextdistance > 0 ? `${Math.round(nextdistance)}m 앞 ` : "";
  return {
    arrow: getDirectionSymbol(instruction),
    landmark: `${distancePrefix}${rawLandmark}`,
  };
};

