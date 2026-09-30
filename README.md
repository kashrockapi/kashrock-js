# KashRock JavaScript SDK

[![Listed on MCP Market](https://mcpmarket.com/badge/server/kashrock.svg)](https://mcpmarket.com/server/kashrock?utm_source=readme&utm_medium=badge "Listed on MCP Market")

Official JS client for the KashRock esports API.

Props, odds, matches, live scores, and history — one key, normalized IDs.

Site: https://www.kashrock.com

## Install

```bash
npm install kashrock
```

## Four lines to a live prop

```js
import { KashRock } from "kashrock"

const kr = new KashRock("YOUR_API_KEY")
console.log((await kr.props("cs2")).props[0])
```

Sandbox key: https://www.kashrock.com/pricing

Docs: https://www.kashrock.com/docs

`KASHROCK_API_KEY` works if you do not want the key in code.

## What you can call

```js
await kr.me()
await kr.props("cs2", { book: "prizepicks", limit: 20 })
await kr.lines("cs2")
await kr.matches("cs2", { status: "upcoming" })
await kr.liveGames("cs2")
await kr.gamelogs("cs2", "zywoo")
await kr.historyTape({ market_key: "kr_mk_…" })
```

Same paths as the HTTP API and the KashRock MCP. Stacks are not included.

MCP: https://www.kashrock.com/mcp

Sandbox keys work on every sport, up to 500 requests per UTC day: props, matches, players, delayed live scores, and 30 days of history. Hobby+ adds consensus lines and live odds. Builder+ adds the live WebSocket and quote history.

Requires Node 18+ (native `fetch`).

## License

MIT
