export type Json = Record<string, unknown>

export declare class KashRockError extends Error {
  status: number | null
  body: unknown
}

export declare class KashRockAuthError extends KashRockError {}
export declare class KashRockPlanError extends KashRockError {
  upgradeUrl: string
}
export declare class KashRockRateLimitError extends KashRockError {}

export declare class V7 {
  meta(params?: Json): Promise<Json>
  matches(sport: string, params?: Json & { ids?: string | string[] }): Promise<Json>
  props(sport: string, params?: Json): Promise<Json>
  lines(sport: string, params?: Json): Promise<Json>
  parlays(sport: string, book: string, params?: Json): Promise<Json>
  flow(sport: string, params?: Json): Promise<Json>
  live(sport: string, params?: Json): Promise<Json>
  players(sport: string, params?: Json & { ids?: string | string[] }): Promise<Json>
  teams(sport: string, params?: Json & { ids?: string | string[] }): Promise<Json>
  history(sport: string, params?: Json): Promise<Json>
  results(sport: string, params?: Json): Promise<Json>
  breakdown(sport: string, params?: Json): Promise<Json>
  breakdownIndex(sport: string, params?: Json): Promise<Json>
  breakdownPublished(sport: string, kind: string, slug: string, params?: Json): Promise<Json>
}

export declare const DEFAULT_BASE: string

export declare class KashRock {
  constructor(apiKey?: string, opts?: { baseUrl?: string; timeout?: number })
  /** The V7 routes. Prefer these over the V6 methods below. */
  readonly v7: V7
  me(): Promise<Json>
  books(): Promise<Json>
  props(sport: string, params?: Json): Promise<Json>
  playerProps(sport: string, params?: Json): Promise<Json>
  media(sport: string, params?: Json): Promise<Json>
  lines(sport: string, params?: Json): Promise<Json>
  gaps(sport: string, params?: Json): Promise<Json>
  coverage(sport: string, params?: Json): Promise<Json>
  rankings(sport: string, params?: Json): Promise<Json>
  searchPlayers(sport: string, q: string, params?: Json): Promise<Json>
  player(sport: string, playerId: string, params?: Json): Promise<Json>
  playerStats(sport: string, playerId: string, params?: Json): Promise<Json>
  playerStatsFull(sport: string, playerId: string, params?: Json): Promise<Json>
  gamelogs(sport: string, player: string, params?: Json): Promise<Json>
  matches(sport: string, params?: Json): Promise<Json>
  match(sport: string, krMatchId: string, params?: Json): Promise<Json>
  searchMatches(sport: string, params?: Json): Promise<Json>
  teamMatches(sport: string, team: string, params?: Json): Promise<Json>
  streams(sport: string, params?: Json): Promise<Json>
  liveGames(sport: string, params?: Json): Promise<Json>
  liveBoxscore(sport: string, gameId: string, params?: Json): Promise<Json>
  liveFrames(sport: string, gameId: string, params?: Json): Promise<Json>
  liveEvents(sport: string, gameId: string, params?: Json): Promise<Json>
  boxscore(sport: string, matchSlug: string, params?: Json): Promise<Json>
  boxscores(sport: string, params?: Json): Promise<Json>
  results(sport: string, params?: Json): Promise<Json>
  historyTape(params?: Json): Promise<Json>
  teamH2h(sport: string, params?: Json): Promise<Json>
  researchBoard(params?: Json): Promise<Json>
  researchBoardTapes(params?: Json): Promise<Json>
  researchPlayer(params?: Json): Promise<Json>
  matchPrep(matchSlug: string, sport?: string, params?: Json): Promise<Json>
  playerBoard(matchSlug: string, sport?: string, params?: Json): Promise<Json>
  tournamentMaps(matchSlug: string, sport?: string, params?: Json): Promise<Json>
}
