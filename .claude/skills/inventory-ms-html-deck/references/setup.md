# Agent and browser setup

## Claude Code project skill

Place this folder at:

```text
<project-root>/.claude/skills/inventory-ms-html-deck/
```

Claude Code discovers project skills from `.claude/skills/`. Invoke it directly with:

```text
/inventory-ms-html-deck create presentation/index.html
```

or ask naturally for the Inventory MS HTML graduation presentation.

## Personal skill

To make it available across projects, copy the skill folder to:

```text
~/.claude/skills/inventory-ms-html-deck/
```

## Playwright MCP

Standard MCP configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Claude Code CLI form:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Restart or reload the agent after changing MCP configuration.

## Playwright CLI alternative

```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills
```

The browser-based QA loop is still required whether MCP or CLI is used.
