/**
 * The V7 surface: every method hits the right path with the right query, and a V7 refusal maps to the right
 * error. Runs against a local stub, so it proves URL construction and error handling with no network or key.
 */
import assert from "node:assert/strict"
import { createServer } from "node:http"
import test from "node:test"

import { KashRock, KashRockPlanError, KashRockRateLimitError, V7 } from "../src/index.js"

/** A stub that echoes the request line back, or serves a canned refusal. */
async function withStub(handler, run) {
  const seen = []
  const server = createServer((req, res) => {
    seen.push(req.url)
    const canned = handler ? handler(req) : null
    res.writeHead(canned ? canned.status : 200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(canned ? canned.body : { available: true, url: req.url }))
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    await run(new KashRock("kr_test_key", { baseUrl: base }), seen)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

test("v7 is attached and is a V7", async () => {
  await withStub(null, (client) => {
    assert.ok(client.v7 instanceof V7)
  })
})

test("every v7 route builds its documented path", async () => {
  await withStub(null, async (client, seen) => {
    const v7 = client.v7
    await v7.meta({ include: "books" })
    await v7.matches("cs2", { status: "upcoming", limit: 2 })
    await v7.props("lol", { board: "all", view: "rows" })
    await v7.lines("cs2", { view: "consensus", format: "full" })
    await v7.parlays("cs2", "thunderpick", { size: 2 })
    await v7.flow("cs2", { kind: "steam" })
    await v7.live("all", { include: "boxscore" })
    await v7.players("cs2", { sort: "rank", include: "stats" })
    await v7.teams("cs2", { id: "kr_tm_87b794cec83a", include: "form" })
    await v7.history("cs2", { kind: "lines", match: "kr_cs2_a-vs-b-13-10-2026" })
    await v7.results("cs2", { grade: "hit" })
    await v7.breakdown("cs2", { team: "vitality" })
    await v7.breakdownIndex("cs2", { kind: "match" })
    await v7.breakdownPublished("cs2", "match", "a-vs-b-13-10-2026")

    assert.deepEqual(seen, [
      "/v7/meta?include=books",
      "/v7/cs2/matches?status=upcoming&limit=2",
      "/v7/lol/props?board=all&view=rows",
      "/v7/cs2/lines?view=consensus&format=full",
      "/v7/cs2/parlays?book=thunderpick&size=2",
      "/v7/cs2/flow?kind=steam",
      "/v7/all/live?include=boxscore",
      "/v7/cs2/players?sort=rank&include=stats",
      "/v7/cs2/teams?id=kr_tm_87b794cec83a&include=form",
      "/v7/cs2/history?kind=lines&match=kr_cs2_a-vs-b-13-10-2026",
      "/v7/cs2/results?grade=hit",
      "/v7/cs2/breakdown?team=vitality",
      "/v7/cs2/breakdown/index?kind=match",
      "/v7/cs2/breakdown/published/match/a-vs-b-13-10-2026",
    ])
  })
})

test("only matches takes a list of ids", async () => {
  await withStub(null, async (client, seen) => {
    await client.v7.matches("cs2", { ids: "kr_cs2_a-vs-b-13-10-2026" })
    await client.v7.matches("cs2", { ids: ["kr_cs2_a-vs-b-13-10-2026", "kr_cs2_c-vs-d-13-10-2026"] })
    await client.v7.players("cs2", { id: "kr_pl_33863a5e1393" })
    await client.v7.teams("cs2", { id: "kr_tm_87b794cec83a" })
    assert.deepEqual(seen, [
      "/v7/cs2/matches?ids=kr_cs2_a-vs-b-13-10-2026",
      "/v7/cs2/matches?ids=kr_cs2_a-vs-b-13-10-2026%2Ckr_cs2_c-vs-d-13-10-2026",
      "/v7/cs2/players?id=kr_pl_33863a5e1393",
      "/v7/cs2/teams?id=kr_tm_87b794cec83a",
    ])
  })
})

test("teams sends id, never ids", async () => {
  // Regression: an ids= query is ignored by the route, the catalog returns every team, and the
  // include blocks never attach -- they only attach on a single-row lookup.
  await withStub(null, async (client, seen) => {
    await client.v7.teams("cs2", { id: "kr_tm_87b794cec83a", include: "roster" })
    assert.deepEqual(seen, ["/v7/cs2/teams?id=kr_tm_87b794cec83a&include=roster"])
    assert.ok(!seen[0].includes("ids="))
  })
})

test("teams h2h sends team2", async () => {
  await withStub(null, async (client, seen) => {
    await client.v7.teams("cs2", { id: "kr_tm_87b794cec83a", team2: "Natus Vincere", include: "h2h" })
    assert.deepEqual(seen, ["/v7/cs2/teams?id=kr_tm_87b794cec83a&team2=Natus+Vincere&include=h2h"])
  })
})

test("an unset option is not sent as an empty parameter", async () => {
  await withStub(null, async (client, seen) => {
    await client.v7.matches("cs2")
    await client.v7.lines("cs2")
    assert.deepEqual(seen, ["/v7/cs2/matches", "/v7/cs2/lines"])
  })
})

test("includeStarted is sent as the include_started the route takes", async () => {
  await withStub(null, async (client, seen) => {
    await client.v7.lines("cs2", { includeStarted: true })
    assert.deepEqual(seen, ["/v7/cs2/lines?include_started=true"])
  })
})

test("a V7 plan refusal raises KashRockPlanError with the message and the upgrade url", async () => {
  const body = {
    error: {
      code: "plan_required",
      message: "Consensus lines and live odds require Hobby plan or higher.",
      status: 403,
      current_plan: "sandbox",
      required_plan: "hobby",
      upgrade_url: "https://www.kashrock.com/pricing",
    },
  }
  await withStub(
    () => ({ status: 403, body }),
    async (client) => {
      await assert.rejects(() => client.v7.lines("cs2"), (err) => {
        assert.ok(err instanceof KashRockPlanError)
        assert.equal(err.message, "Consensus lines and live odds require Hobby plan or higher.")
        assert.equal(err.upgradeUrl, "https://www.kashrock.com/pricing")
        assert.equal(err.status, 403)
        return true
      })
    },
  )
})

test("a V7 quota refusal raises KashRockRateLimitError even on a 403", async () => {
  const body = { error: { code: "quota_exceeded", message: "Daily quota used up.", status: 429 } }
  await withStub(
    () => ({ status: 429, body }),
    async (client) => {
      await assert.rejects(() => client.v7.props("cs2"), (err) => {
        assert.ok(err instanceof KashRockRateLimitError)
        assert.equal(err.message, "Daily quota used up.")
        return true
      })
    },
  )
})

test("a V6 flat detail refusal still works", async () => {
  await withStub(
    () => ({ status: 401, body: { detail: "API key required." } }),
    async (client) => {
      await assert.rejects(() => client.props("cs2"), (err) => {
        assert.equal(err.message, "API key required.")
        return true
      })
    },
  )
})

test("the V6 methods still call /v6", async () => {
  await withStub(null, async (client, seen) => {
    await client.props("cs2")
    await client.liveGames("cs2")
    assert.ok(seen.every((url) => url.startsWith("/v6/")), `expected only /v6 calls, got ${seen}`)
  })
})
