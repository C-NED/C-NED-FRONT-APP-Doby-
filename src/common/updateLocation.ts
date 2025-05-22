import haversine = require('haversine-distance');

let prevCoords = null;
let prevTime = null;

export const updateLocation = (current, guideList) => {
  const now = Date.now();

  const { lat, lng, speed } = current;

  // fallback 속도 계산
  let calculatedSpeed = speed;
  if ((!speed || speed === 0) && prevCoords && prevTime) {
    const distance = haversine(prevCoords, { latitude: lat, longitude: lng });
    const timeDiff = (now - prevTime) / 1000; // seconds
    calculatedSpeed = distance / timeDiff;
  }

  prevCoords = { latitude: lat, longitude: lng };
  prevTime = now;

  // 가장 가까운 지점 찾기
  let minDist = Infinity;
  let closestIdx = 0;

  guideList.forEach((step, idx) => {
    const dist = haversine(
      { latitude: lat, longitude: lng },
      { latitude: step.point[1], longitude: step.point[0] }
    );
    if (dist < minDist) {
      minDist = dist;
      closestIdx = idx;
    }
  });

  // 다음 안내 추출
  const nextStep = guideList[closestIdx + 1];
  const instruction = nextStep?.instructions ?? '목적지에 도착했습니다.';

  console.log(`📍 위치: ${lat}, ${lng}`);
  console.log(`🚗 속도: ${calculatedSpeed?.toFixed(2)} m/s`);
  console.log(`➡️ 다음 안내: ${instruction} (${Math.round(minDist)}m 앞)`);

  return {
    speed: calculatedSpeed,
    distanceToNext: minDist,
    instruction,
  };
};
