#!/usr/bin/env -S deno run --allow-net --allow-env

// Configuration
const SERVER_URL = Deno.env.get("SERVER_URL") || "http://localhost:3000";

// Text encoder/decoder for stdin/stdout
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Logger utility
const log = {
  info: (...args: unknown[]) => console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  debug: (...args: unknown[]) => {
    if (Deno.env.get("DEBUG")) console.debug(...args);
  },
};

interface Agent {
  id: string;
  name: string;
}

interface Message {
  user: string;
  action: string;
  text: string;
}

async function getAgent(requestedName?: string): Promise<Agent> {
  try {
    const response = await fetch(`${SERVER_URL}/agents`);
    const data = await response.json();

    if (!data.agents || data.agents.length === 0) {
      log.error("No agents available");
      Deno.exit(1);
    }

    if (!requestedName) {
      if (data.agents.length > 1) {
        log.warn(`Multiple agents found, using the first one: ${data.agents[0].name}`);
      }
      return data.agents[0];
    }

    const agent = data.agents.find((a: { name: string }) => a.name === requestedName);
    if (!agent) {
      log.error(`No agent found with name: ${requestedName}`);
      Deno.exit(1);
    }
    return agent;
  } catch (error) {
    log.error("Failed to fetch agents:", error);
    await gracefulExit();
  }
}

async function handleUserInput(input: string, agent: Agent) {
  log.debug("handleUserInput", input, agent.name, agent.id);
  if (input.toLowerCase() === "exit") {
    await gracefulExit();
  }

  try {
    const response = await fetch(
      `${SERVER_URL}/${agent.id}/message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          userId: "user",
          userName: "User",
        }),
      },
    );

    const data = await response.json();
    log.debug("data: ", data);
    data.forEach((message: Message) => {
      log.info(`Agent::${message.user}::${message.action}: ${message.text}`);
      log.info("");
    });
  } catch (error) {
    log.error("Error fetching response:", error);
    await gracefulExit();
  }
}

async function readLine(): Promise<string> {
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) return "exit"; // EOF
  return decoder.decode(buf.subarray(0, n)).trim();
}

async function chat(agent: Agent) {
  log.debug("chat");
  log.info(`Agent Name: ${agent.name}`);
  log.info(`Agent ID: ${agent.id}`);
  log.info("");

  while (true) {
    await Deno.stdout.write(encoder.encode("You: "));
    const input = await readLine();
    await handleUserInput(input, agent);
    if (input.toLowerCase() === "exit") break;
  }
}

async function gracefulExit() {
  log.info("Terminating and cleaning up resources...");
  Deno.exit(0);
}

// Handle SIGINT (Ctrl+C)
Deno.addSignalListener("SIGINT", gracefulExit);

// Main
if (import.meta.main) {
  const agentName = Deno.args[0];
  const agent = await getAgent(agentName);
  log.info("Chat started. Type 'exit' to quit.");
  log.info(""); // Empty line
  await chat(agent);
}
