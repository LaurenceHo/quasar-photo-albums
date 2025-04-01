export const getStaticFileUrl = (objectKey: string): string => {
  return `${import.meta.env.VITE_STATIC_FILES_URL}/${objectKey}`;
};

export const getYearOptions = () => {
  const yearOptions = ['na'];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; 2005 <= i; i--) {
    yearOptions.push(String(i));
  }
  return yearOptions;
};

export const fetchDbUpdatedTime: () => Promise<string | null> = async () => {
  let dbUpdatedTimeJSON: { time: string } = { time: '' };
  try {
    const response = await fetch(getStaticFileUrl('updateDatabaseAt.json'));
    dbUpdatedTimeJSON = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Might encounter CORS issue. Do nothing
    return null;
  }
  return dbUpdatedTimeJSON.time;
};

export const compareDbUpdatedTime = async (localDbUpdatedTime: string | null) => {
  // Get updated time from s3
  const time = await fetchDbUpdatedTime();
  return {
    isLatest: time === null ? false : localDbUpdatedTime === time,
    dbUpdatedTime: time,
  };
};

export const sortByKey = <T>(array: T[], key: keyof T, sortOrder: 'asc' | 'desc'): T[] => {
  return array.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      return 0;
    }
  });
};

export const interpolateGreatCircle = (
  start: [number, number],
  end: [number, number],
  steps: number,
): [number, number][][] => {
  const [lon1, lat1] = start;
  const [lon2, lat2] = end;

  // Convert to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ1 = (lon1 * Math.PI) / 180;
  let λ2 = (lon2 * Math.PI) / 180;

  // Calculate the longitude difference, ensuring the shortest path
  let Δλ = lon2 - lon1;
  if (Math.abs(Δλ) > 180) {
    Δλ = Δλ > 0 ? Δλ - 360 : Δλ + 360;
  }
  Δλ = (Δλ * Math.PI) / 180; // Convert to radians
  λ2 = λ1 + Δλ;

  // Great-circle distance (Haversine)
  const a =
    Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance in degrees for scaling the curvature exaggeration
  const distanceDegrees = Math.sqrt((lon2 - lon1) ** 2 + (lat2 - lat1) ** 2);

  // Generate points along the great-circle path
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * distance) / Math.sin(distance);
    const B = Math.sin(f * distance) / Math.sin(distance);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);

    let lon = (λ * 180) / Math.PI;
    lon = ((lon + 540) % 360) - 180; // Normalize to [-180, 180]

    let lat = (φ * 180) / Math.PI;

    // Exaggerate the curvature by adjusting the latitude
    const t = f; // Parameter from 0 to 1
    const curveFactor = Math.min(distanceDegrees * 0.2, 10); // Reduced for shorter routes
    const archHeight = curveFactor * 4 * t * (1 - t); // Parabolic shape: peaks at t = 0.5
    const direction = lat1 < lat2 ? 1 : -1; // Curve upward if going north, downward if going south
    lat += archHeight * direction;

    points.push([Number(lon.toFixed(6)), Number(lat.toFixed(6))]);
  }

  // Check for antimeridian crossing and split if necessary
  const segments: [number, number][][] = [];
  let currentSegment: [number, number][] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prevLon = points[i - 1][0];
    const currLon = points[i][0];

    // Detect antimeridian crossing
    if (Math.abs(currLon - prevLon) > 180) {
      // Calculate the crossing point at ±180°
      const fraction = (180 - Math.abs(prevLon)) / Math.abs(currLon - prevLon);
      const latCross = points[i - 1][1] + fraction * (points[i][1] - points[i - 1][1]);
      const crossingPoint: [number, number] = [prevLon < 0 ? -180 : 180, latCross];

      // End the current segment at the crossing point
      currentSegment.push(crossingPoint);
      segments.push(currentSegment);

      // Start a new segment from the other side of the antimeridian
      currentSegment = [[currLon < 0 ? -180 : 180, latCross]];
    }

    currentSegment.push(points[i]);
  }

  // Add the final segment
  segments.push(currentSegment);

  return segments;
};