# KashRock JavaScript SDK

Official JS client for the [KashRock esports API](https://www.kashrock.com).

Props, odds, matches, live scores, and history — one key, normalized IDs.

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

Get a free Sandbox key at [kashrock.com/pricing](https://www.kashrock.com/pricing). Docs: [kashrock.com/docs](https://www.kashrock.com/docs).

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

Same paths as the HTTP API and the [KashRock MCP](https://www.kashrock.com/mcp). Stacks are not included.

Sandbox keys are CS2 props only. Hobby+ unlocks the rest of the board. Builder+ unlocks matches, live, gamelogs, and history.

Requires Node 18+ (native `fetch`).

## License

MIT
