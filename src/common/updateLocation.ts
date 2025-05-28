import haversine = require('haversine-distance');

let prevCoords = null;
let prevTime = null;

export const updateLocation = (current, pathFromRedis, guideList) => {
  const now = Date.now();
  const { lat, lng, speed } = current;

  // 1. 속도 계산
  // AFTER
  let calculatedSpeed = 0;
  if (prevCoords && prevTime) {
    const distance = haversine(prevCoords, { latitude: lat, longitude: lng });
    const timeDiff = (now - prevTime) / 1000;
    calculatedSpeed = distance / timeDiff;
  }

  // 현재 위치 저장
  prevCoords = { latitude: lat, longitude: lng };
  prevTime = now;


  // 2. path에서 가장 가까운 지점 탐색
  let minDist = Infinity;
  let closestIdx = 0;

  pathFromRedis.forEach((p, idx) => {
    const [lngP, latP] = p.coords;
    const dist = haversine(
      { latitude: lat, longitude: lng },
      { latitude: latP, longitude: lngP }
    );

    if (dist < minDist) {
      minDist = dist;
      closestIdx = idx;
    }
  });

  // if (minDist > 1000) {
  //   console.warn("🚨 현재 위치가 경로와 너무 멉니다. 무시 처리됨");
  //   return {
  //     instruction: "위치를 확인해주세요",
  //     speed: calculatedSpeed,
  //     distanceToNext: minDist,
  //     closestPathIndex: closestIdx,
  //     matchedGuide: null
  //   };
  // }

  // 3. 도착 판정: path의 마지막 index 기준
  const isArrived = minDist < 30 && closestIdx >= pathFromRedis.length - 1;

  // 4. 안내 정보 찾기
  const matchedPath = pathFromRedis[closestIdx];
  const pathidx = matchedPath.pathidx;

  const guide = guideList.find(g => g.pointidx === pathidx);
  const nextStep = guideList.find(g => g.pointidx === pathidx + 1);

  const instruction = isArrived
    ? '목적지에 도착했습니다.'
    : (nextStep?.instructions || guide?.instructions || '');

  const nextdistance = Math.round(minDist)

  // 5. 디버깅 출력
  console.log(`📍 현재 위치: ${lat}, ${lng}`);
  console.log(`🧭 가장 가까운 path: ${matchedPath.coords[1]}, ${matchedPath.coords[0]} (pathidx: ${pathidx})`);
  console.log(`🚗 계산 속도: ${calculatedSpeed?.toFixed(2)} m/s`);
  console.log(`➡️ 다음 안내: ${instruction} (${nextdistance}m 앞)`);

  return {
    speed: calculatedSpeed,
    distanceToNext: minDist,
    instruction,
    closestPathIndex: closestIdx,
    matchedGuide: guide,
    nextdistance
  };
};
