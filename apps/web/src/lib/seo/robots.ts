import { robotsForEnv } from '@netmarket/config';
import type { Robots } from '@netmarket/seo';
import { getPublicEnv } from '@/lib/env';

export function currentRobots(editorialNoindex = false, editorialFollow = false): Robots {
  return robotsForEnv(getPublicEnv().PUBLIC_DEPLOY_ENV, editorialNoindex, editorialFollow);
}
