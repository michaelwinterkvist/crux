import { KILTER_API_BASE_URL } from '@crux/shared';

const BASE_SYNC_DATE = '1970-01-01 00:00:00.000000';

const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'Kilter%20Board/202 CFNetwork/1568.100.1 Darwin/24.0.0',
};

export interface KilterSession {
  token: string;
  userId: number;
}

export interface KilterAscent {
  climb_uuid: string;
  user_id: number;
  angle: number;
  is_mirror: boolean;
  bid_count: number;
  quality: number;
  difficulty: number;
  is_benchmark: boolean;
  comment: string;
  climbed_at: string;
  is_listed: boolean;
  attempt_id?: number;
}

export interface KilterClimb {
  uuid: string;
  name: string;
  description: string;
  setter_id: number;
  layout_id: number;
  is_draft: boolean;
  frames_count: number;
  angle?: number;
}

export async function authenticate(username: string, password: string): Promise<KilterSession> {
  const response = await fetch(`${KILTER_API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      tou: 'accepted',
      pp: 'accepted',
      ua: 'app',
    }),
  });

  if (response.status === 422) {
    throw new Error('Invalid Kilter Board username or password');
  }
  if (!response.ok) {
    throw new Error(`Kilter API login failed: ${response.status}`);
  }

  const data = await response.json();
  // session can be a string token or an object { token, user_id }
  const session = data.session;
  const token = typeof session === 'string' ? session : session?.token;
  const userId = typeof session === 'string' ? (data.user_id ?? 0) : (session?.user_id ?? 0);
  if (!token) {
    throw new Error(`Kilter auth: no token in response: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return { token, userId };
}

async function* syncPages(
  tables: Record<string, string>,
  token?: string,
  maxPages = 10,
): AsyncGenerator<Record<string, unknown[]>> {
  const payload: Record<string, string> = { ...tables };
  let page = 0;
  let complete = false;

  while (!complete && page < maxPages) {
    const body = Object.entries(payload)
      .map(([table, date]) => `${encodeURIComponent(table)}=${encodeURIComponent(date)}`)
      .join('&');

    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (token) {
      headers['Cookie'] = `token=${token}`;
    }

    const response = await fetch(`${KILTER_API_BASE_URL}/sync`, {
      method: 'POST',
      headers,
      body,
    });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Kilter sync failed: ${response.status} ${response.url} body=${errorBody.slice(0, 200)}`);
    }

    const json = await response.json();
    complete = json._complete ?? false;
    delete json._complete;

    yield json;

    // Update pagination cursors
    if (token) {
      for (const sync of json.user_syncs ?? []) {
        if (sync.table_name in payload && sync.last_synchronized_at) {
          payload[sync.table_name] = sync.last_synchronized_at;
        }
      }
    }
    for (const sync of json.shared_syncs ?? []) {
      if (sync.table_name in payload && sync.last_synchronized_at) {
        payload[sync.table_name] = sync.last_synchronized_at;
      }
    }

    page++;
  }
}

export interface KilterSyncResult {
  ascents: KilterAscent[];
  climbs: KilterClimb[];
}

export async function fetchAscentsAndClimbs(token: string, since?: Date): Promise<KilterSyncResult> {
  const sinceStr = since
    ? since.toISOString().replace('T', ' ').replace('Z', '')
    : BASE_SYNC_DATE;

  const result: KilterSyncResult = { ascents: [], climbs: [] };

  // Request ascents and climbs together in one sync call
  for await (const page of syncPages({ ascents: sinceStr, climbs: sinceStr }, token)) {
    if (Array.isArray(page.ascents)) {
      result.ascents.push(...(page.ascents as KilterAscent[]));
    }
    if (Array.isArray(page.climbs)) {
      result.climbs.push(...(page.climbs as KilterClimb[]));
    }
  }

  return result;
}

export function buildClimbUrl(climbUuid: string): string {
  return `https://kilterboardapp.com/climbs/${climbUuid}`;
}
