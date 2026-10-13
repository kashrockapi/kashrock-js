/**
 * The V7 routes: one method per endpoint, reached as `new KashRock(key).v7`.
 *
 * V7 takes KashRock ids only — `kr_match_id`, `kr_tm_*`, `kr_pl_*`, `kr_cb_*`, `kr_prop_*`. A provider or book
 * id is never accepted. Every method spreads extra options straight through as query parameters, so a parameter
 * added to a route works here without an SDK release.
 *
 * The V6 methods on the client are unchanged and keep working until V6 is sunset on 12 December 2026.
 * See https://www.kashrock.com/docs/migrate-v6-v7
 */

/** A single id, or an array of them, as the comma list every V7 list parameter takes. */
function joined(ids) {
  if (ids === undefined || ids === null) return undefined
  return Array.isArray(ids) ? ids.map(String).join(",") : ids
}

export class V7 {
  /** @param {{_get: (path: string, params?: object) => Promise<any>}} client */
  constructor(client) {
    this._client = client
  }

  _get(path, params) {
    return this._client._get(path, params)
  }

  _sport(sport, suffix, params) {
    return this._get(`/v7/${sport}/${suffix}`, params)
  }

  // -- reference ---------------------------------------------------------------------------------

  /** Sports, books, markets, the routes table and your plan. Call this first. */
  meta({ include, ...rest } = {}) {
    return this._get("/v7/meta", { include, ...rest })
  }

  // -- matches -----------------------------------------------------------------------------------

  /**
   * Fixtures, in-progress and finished matches for one sport, or `sport = "all"`.
   * `ids` takes one kr_match_id or up to 100. `include` adds boxscore, prep, veto, maps, player_board,
   * lines, streams or h2h.
   */
  matches(sport, { status, date, q, team, ids, include, limit, ...rest } = {}) {
    return this._sport(sport, "matches", { status, date, q, team, ids: joined(ids), include, limit, ...rest })
  }

  // -- markets -----------------------------------------------------------------------------------

  /** Player and combo props across every book. `board` is dfs, main or all. */
  props(sport, { board, view, market, player, book, limit, ...rest } = {}) {
    return this._sport(sport, "props", { board, view, market, player, book, limit, ...rest })
  }

  /** Team and match markets with a KashRock fair price and EV. `view` is consensus or moneyline. */
  lines(sport, { market, view, format, includeStarted, ...rest } = {}) {
    return this._sport(sport, "lines", { market, view, format, include_started: includeStarted, ...rest })
  }

  /**
   * Price a multi-leg ticket, or discover ranked independent parlays for one `book`. Hobby+.
   * Pass `ticket` as comma-separated `kr_match_id:market:selection` to price, or omit it to discover.
   */
  parlays(sport, book, { ticket, market, size, include, limit, ...rest } = {}) {
    return this._sport(sport, "parlays", { book, ticket, market, size, include, limit, ...rest })
  }

  /** Money-behind, shift, steam and whale plays. Hobby+. `kind` is all, volume, shift, steam or whale. */
  flow(sport, { kind, include, limit, ...rest } = {}) {
    return this._sport(sport, "flow", { kind, include, limit, ...rest })
  }

  /** The quote tape. `kind` is contract or lines. `match` takes a kr_match_id, `prop` a kr_prop_ id. */
  history(sport, { kind, match, prop, ...rest } = {}) {
    return this._sport(sport, "history", { kind, match: joined(match), prop, ...rest })
  }

  /** Graded bets: hit, miss, push. `from` and `to` bound the window. */
  results(sport, { grade, limit, ...rest } = {}) {
    return this._sport(sport, "results", { grade, limit, ...rest })
  }

  // -- live --------------------------------------------------------------------------------------

  /**
   * Live matches. `sport = "all"` lists every title in one call. `game` takes a kr_match_id.
   * `include` adds boxscore, events, frame, odds, odds_history or streams.
   */
  live(sport, { game, include, at, ...rest } = {}) {
    return this._sport(sport, "live", { game, include, at, ...rest })
  }

  // -- people ------------------------------------------------------------------------------------

  /**
   * Find a player, look one up, or rank them. `ids` takes kr_pl_ and kr_cb_ ids; retired name-hash ids
   * still resolve. `sort = "rank"` ranks them.
   */
  players(sport, { q, ids, sort, include, format, limit, ...rest } = {}) {
    return this._sport(sport, "players", { q, ids: joined(ids), sort, include, format, limit, ...rest })
  }

  /** Team research. `ids` takes kr_tm_ ids. `include` adds form, roster, maps, h2h, main_lines or upcoming. */
  teams(sport, { q, ids, include, limit, ...rest } = {}) {
    return this._sport(sport, "teams", { q, ids: joined(ids), include, limit, ...rest })
  }

  // -- breakdown ---------------------------------------------------------------------------------

  /** One actionable fact bundle for a match or a team pairing. Builder+. */
  breakdown(sport, { match, team, team1, team2, ...rest } = {}) {
    return this._sport(sport, "breakdown", { match, team, team1, team2, ...rest })
  }

  /** The published breakdown pages. Needs no API key. */
  breakdownIndex(sport, { kind, ...rest } = {}) {
    return this._sport(sport, "breakdown/index", { kind, ...rest })
  }

  /** One published breakdown page. Needs no API key. */
  breakdownPublished(sport, kind, slug, params = {}) {
    return this._get(`/v7/${sport}/breakdown/published/${kind}/${slug}`, params)
  }
}
