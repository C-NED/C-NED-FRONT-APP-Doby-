import haversine = require('haversine-distance');

let prevCoords = null;
let prevTime = null;

export const updateLocation = (current, pathFromRedis, guideList) => {
  const now = Date.now();
  const { lat, lng, speed } = current;

  // 1. 속도 계산 (fallback 포함)
  let calculatedSpeed = speed;
  if ((!speed || speed === 0) && prevCoords && prevTime) {
    const distance = haversine(prevCoords, { latitude: lat, longitude: lng });
    const timeDiff = (now - prevTime) / 1000;
    calculatedSpeed = distance / timeDiff;
  }

  prevCoords = { latitude: lat, longitude: lng };
  prevTime = now;

  // 2. path에서 가장 가까운 pointIndex 탐색
  let minDist = Infinity;
  let closestIdx = 0;

  pathFromRedis.forEach(([lngP, latP], idx) => {
    const dist = haversine({ latitude: lat, longitude: lng }, { latitude: latP, longitude: lngP });
    if (dist < minDist) {
      minDist = dist;
      closestIdx = idx;
    }
  });

  // 3. 해당 pointIndex에 대응하는 guide 찾기
  const guide = guideList.find(g => g.pointIndex === closestIdx);
  const nextStep = guideList.find(g => g.pointIndex === closestIdx + 1);
  const instruction = nextStep?.instructions ?? '목적지에 도착했습니다.';

  // 4. 디버깅 출력
  console.log(`📍 현재 위치: ${lat}, ${lng}`);
  console.log(`🧭 가장 가까운 path: ${pathFromRedis[closestIdx][1]}, ${pathFromRedis[closestIdx][0]} (idx: ${closestIdx})`);
  console.log(`🚗 계산 속도: ${calculatedSpeed?.toFixed(2)} m/s`);
  console.log(`➡️ 다음 안내: ${instruction} (${Math.round(minDist)}m 앞)`);

  return {
    speed: calculatedSpeed,
    distanceToNext: minDist,
    instruction,
    closestPathIndex: closestIdx,
    matchedGuide: guide,
  };
};
