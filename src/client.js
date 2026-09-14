import { KashRockAuthError, raiseForStatus } from "./errors.js"

export const DEFAULT_BASE = "https://kashrock.up.railway.app"

function cleanParams(params) {
  const out = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === "") continue
    out[key] = typeof value === "boolean" ? (value ? "true" : "false") : String(value)
  }
  return out
}

export class KashRock {
  constructor(apiKey = process.env.KASHROCK_API_KEY, { baseUrl = DEFAULT_BASE, timeout = 60_000 } = {}) {
    if (!apiKey) {
      throw new KashRockAuthError(
        "Pass an API key or set KASHROCK_API_KEY. Get one at https://www.kashrock.com/pricing",
        { status: 401 },
      )
    }
    this.apiKey = apiKey
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.timeout = timeout
  }

  async _get(path, params) {
    const query = new URLSearchParams(cleanParams(params)).toString()
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ""}`
    const response = await fetch(url, {
      headers: { "X-API-Key": this.apiKey },
      signal: AbortSignal.timeout(this.timeout),
    })
    const text = await response.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = { detail: text.slice(0, 500) }
    }
    if (response.status >= 400) raiseForStatus(response.status, body)
    return body
  }

  _sport(sport, suffix, params) {
    return this._get(`/v6/esports/${sport}/${suffix}`, params)
  }

  me() {
    return this._get("/v6/me")
  }
  books() {
    return this._get("/v6/books")
  }
  props(sport, params) {
    return this._sport(sport, "props", params)
  }
  playerProps(sport, params) {
    return this._sport(sport, "player-props", params)
  }
  media(sport, params) {
    return this._sport(sport, "media", params)
  }
  lines(sport, params) {
    return this._sport(sport, "lines", params)
  }
  gaps(sport, params) {
    return this._sport(sport, "gaps", params)
  }
  coverage(sport, params = {}) {
    return this.props(sport, { include_props: false, ...params })
  }
  rankings(sport, params) {
    return this._sport(sport, "rankings", params)
  }
  searchPlayers(sport, q, params) {
    return this._sport(sport, "players/search", { q, ...params })
  }
  player(sport, playerId, params) {
    return this._sport(sport, `players/${playerId}`, params)
  }
  playerStats(sport, playerId, params) {
    return this._sport(sport, `players/${playerId}/stats`, params)
  }
  playerStatsFull(sport, playerId, params) {
    return this._sport(sport, `players/${playerId}/stats/full`, params)
  }
  gamelogs(sport, player, params) {
    return this._sport(sport, `players/${player}/gamelogs`, params)
  }
  matches(sport, params) {
    return this._sport(sport, "matches", params)
  }
  match(sport, krMatchId, params) {
    return this._sport(sport, `matches/id/${krMatchId}`, params)
  }
  searchMatches(sport, params) {
    return this._sport(sport, "matches/search", params)
  }
  teamMatches(sport, team, params) {
    return this._sport(sport, `teams/${team}/matches`, params)
  }
  streams(sport, params) {
    return this._sport(sport, "streams", params)
  }
  liveGames(sport, params) {
    return this._sport(sport, "live/games", params)
  }
  liveBoxscore(sport, gameId, params) {
    return this._sport(sport, `live/${gameId}/boxscore`, params)
  }
  liveFrames(sport, gameId, params) {
    return this._sport(sport, `live/${gameId}/frames`, params)
  }
  liveEvents(sport, gameId, params) {
    return this._sport(sport, `live/${gameId}/events`, params)
  }
  boxscore(sport, matchSlug, params) {
    return this._sport(sport, `matches/${matchSlug}/boxscore`, params)
  }
  boxscores(sport, params) {
    return this._sport(sport, "boxscores", params)
  }
  results(sport, params) {
    return this._sport(sport, "results", params)
  }
  historyTape(params) {
    return this._get("/v6/esports/history/contract", params)
  }
  teamH2h(sport, params) {
    return this._sport(sport, "teams/h2h", params)
  }
  researchBoard(params) {
    return this._get("/v6/esports/research/board", params)
  }
  researchBoardTapes(params) {
    return this._get("/v6/esports/research/board-tapes", params)
  }
  researchPlayer(params) {
    return this._get("/v6/esports/research/player", params)
  }
  matchPrep(matchSlug, sport = "cs2", params) {
    return this._sport(sport, `matches/${matchSlug}/prep`, params)
  }
  playerBoard(matchSlug, sport = "cs2", params) {
    return this._sport(sport, `matches/${matchSlug}/player-board`, params)
  }
  tournamentMaps(matchSlug, sport = "cs2", params) {
    return this._sport(sport, `matches/${matchSlug}/tournament-maps`, params)
  }
}
