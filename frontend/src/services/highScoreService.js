export const HIGH_SCORES_ENDPOINT = import.meta.env.VITE_HIGH_SCORES_API_URL || '/api/high-scores';
export const HIGH_SCORES_SESSION_ENDPOINT = `${HIGH_SCORES_ENDPOINT.replace(/\/+$/, '')}/session`;

export function formatCompletionTime(milliseconds = 0) {
  const safeMilliseconds = Math.max(0, Number(milliseconds) || 0);
  const totalCentiseconds = Math.floor(safeMilliseconds / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

export function getDeviceType(isMobileGameDevice = false) {
  if (typeof window === 'undefined' || !isMobileGameDevice) {
    return 'desktop';
  }

  const viewport = window.visualViewport;
  const width = Math.round(viewport?.width ?? window.innerWidth ?? 0);
  const height = Math.round(viewport?.height ?? window.innerHeight ?? 0);
  const shortestSide = Math.min(width, height);
  const longestSide = Math.max(width, height);
  const likelyTablet = shortestSide >= 700 || longestSide >= 1100 || (navigator.maxTouchPoints ?? 0) > 1;

  return likelyTablet ? 'tablet' : 'mobile';
}

export function getProvisionalRank(scores = [], completionTimeMs) {
  const realScores = scores.filter(score => !score.is_placeholder && Number.isFinite(score.completion_time_ms));

  return realScores.filter(score => score.completion_time_ms <= completionTimeMs).length + 1;
}

export function qualifiesForLeaderboard(scores = [], completionTimeMs) {
  const realScores = scores.filter(score => !score.is_placeholder && Number.isFinite(score.completion_time_ms));

  if (realScores.length < 25) {
    return true;
  }

  const cutoff = realScores[24];

  return cutoff ? completionTimeMs < cutoff.completion_time_ms : true;
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false || !payload) {
    const responseLooksLikeHtml = contentType.includes('text/html');
    const message = responseLooksLikeHtml
      ? 'The Hall of Fame endpoint returned HTML instead of an API response.'
      : payload?.message
        || `The Hall of Fame service returned an unexpected response (status ${response.status}).`;

    const error = new Error(message);
    error.status = response.status;
    error.errors = payload?.errors || {};
    throw error;
  }

  return payload;
}

export async function fetchHighScores() {
  const response = await fetch(HIGH_SCORES_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
  });

  return parseJsonResponse(response);
}

export async function createHighScoreSession() {
  const response = await fetch(HIGH_SCORES_SESSION_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  });

  return parseJsonResponse(response);
}

export async function reportHighScoreSessionProgress({
  sessionId,
  submissionToken,
  eventType,
  codexesCollected,
  totalCodexes,
  deathCount,
}) {
  const response = await fetch(`${HIGH_SCORES_SESSION_ENDPOINT}/${encodeURIComponent(sessionId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      submission_token: submissionToken,
      event_type: eventType,
      codexes_collected: codexesCollected,
      total_codexes: totalCodexes,
      death_count: deathCount,
    }),
  });

  return parseJsonResponse(response);
}

export async function submitHighScore({
  sessionId,
  submissionToken,
  playerName,
  location,
  completionTimeMs,
  deviceType,
  deathCount,
  codexesCollected,
  totalCodexes,
  gameVersion = import.meta.env.VITE_GAME_VERSION || '1.0.0',
}) {
  const response = await fetch(HIGH_SCORES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      submission_token: submissionToken,
      player_name: playerName,
      location,
      completion_time_ms: completionTimeMs,
      device_type: deviceType,
      death_count: deathCount,
      codexes_collected: codexesCollected,
      total_codexes: totalCodexes,
      game_version: gameVersion,
    }),
  });

  return parseJsonResponse(response);
}
