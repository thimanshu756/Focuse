/**
 * Health check routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns server health status and app version requirements
 * Used by mobile apps to check for force updates
 */
router.get('/', (req: Request, res: Response) => {
  const minAppVersion = process.env.MIN_APP_VERSION || '1.0.0';
  const latestAppVersion = process.env.LATEST_APP_VERSION || '1.0.0';
  const forceUpdateBelow = process.env.FORCE_UPDATE_BELOW || '0.9.0';

  // Parse versions to compare
  const parseVersion = (version: string): number[] => {
    return version.split('.').map((v) => parseInt(v, 10));
  };

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = parseVersion(v1);
    const parts2 = parseVersion(v2);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  };

  // Check if client version requires force update
  const clientVersion = req.headers['x-app-version'] as string;
  let forceUpdate = false;

  if (clientVersion) {
    forceUpdate = compareVersions(clientVersion, forceUpdateBelow) < 0;
  }

  res.json({
    success: true,
    data: {
      status: 'healthy',
      minAppVersion,
      latestAppVersion,
      forceUpdate,
      message: forceUpdate ? 'Please update your app to continue' : undefined,
    },
  });
});

export default router;
