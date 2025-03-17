# Eliza Terminal Chat

A command-line interface for chatting with Eliza agents using Deno.

## Requirements

- [Deno](https://deno.land/) runtime installed on your system
- `rlwrap`

## Installation

No installation needed! The script runs directly with Deno.

## Bash Alias Function

To simplify running the script, you can define a bash alias function:

```bash
function etc(){
  env SERVER_URL="${SERVER_URL:-http://localhost:3000}" rlwrap npx -y deno run -A https://raw.githubusercontent.com/btwiuse/eliza-terminal-chat/refs/heads/main/terminal-chat.ts "$@"
}
```

You can override the `SERVER_URL` value by setting the environment variable:

```bash
export SERVER_URL=https://example.com:443
```

## Usage

You can run the script in two ways:

1. Specify an agent name:
```bash
etc trump
```

2. Let it automatically select the first available agent:
```bash
etc
```

## Environment Variables

- `SERVER_URL`: The URL of the Eliza server (default: `http://localhost:3000`)

## Features

- Connect to any Eliza agent by name
- Automatic agent selection if no name provided
- Interactive chat interface in the terminal
- Clean exit with Ctrl+C or typing 'exit'
- Intelligent error handling:
  - Warns when multiple agents are available and none specified
  - Shows error when no agents are available
  - Shows error when specified agent not found

## How it Works

1. The script first connects to the Eliza server's `/agents` endpoint to:
   - List available agents
   - Find the specified agent (if name provided)
   - Select the first available agent (if no name provided)

2. Once connected, you can:
   - Type messages and press Enter to send
   - See agent responses in the terminal
   - Type 'exit' or press Ctrl+C to quit

## Error Messages

- "No agents available": The server has no configured agents
- "No agent found with name: [name]": The specified agent name doesn't exist
- "Multiple agents found, using the first one: [name]": Warning when auto-selecting from multiple agents
