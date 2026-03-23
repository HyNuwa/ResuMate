import { type Request, type Response, type NextFunction } from 'express';
import { GeoUtils } from '../modules/utils/geo_utils';

/**
 * Geolocation middleware.
 *
 * Attaches `req.realIp` and `req.geo` to every incoming request.
 * Falls back to default geo data if the lookup fails.
 *
 * Verbose console logging is controlled by the LOG_GEO env var
 * (set to "false" or omit to silence it in production).
 */
export async function geolocationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ip = GeoUtils.getValidIP(req);
    req.realIp = ip;

    const geoData = await GeoUtils.getGeoData(ip);

    req.geo = {
      ip: geoData.ip,
      city: geoData.city,
      region: geoData.region,
      country: geoData.country,
      loc: geoData.loc,
      timezone: geoData.timezone,
      isProxy: geoData.isProxy,
      anonymizedIp: geoData.anonymizedIp,
      org: geoData.org,
    };

    if (process.env.LOG_GEO === 'true') {
      const displayIp = GeoUtils.shouldAnonymize() ? req.geo.anonymizedIp : req.geo.ip;
      console.log(
        `[geo] ${req.method} ${req.originalUrl} — IP: ${displayIp} ` +
          `${req.geo.city ?? '?'}, ${req.geo.country ?? '?'}`,
      );
    }

    next();
  } catch (error) {
    console.error('[geo] Geolocation lookup failed:', error);
    req.geo = GeoUtils.getDefaultGeoData(req.realIp);
    next();
  }
}
