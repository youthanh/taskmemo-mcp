// Example MCP client script to call MCP tool via STDIO
// Requires: npm install @modelcontextprotocol/sdk

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // Create STDIO transport (connects to MCP server running with STDIO)
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"]
  });

  // Create MCP client
  const client = new Client({
    name: "example-client",
    version: "1.0.0"
  });

  await client.connect(transport);

  const toolName = "list_projects";
  // Example: Call toolName tool
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: {
        workingDirectory: "c:/Users/Thanh/Documents/MyProject/bengmt_stack/server",
        // query: "cấu hình"
        // workingDirectory: "c:/Users/Thanh/Documents/.vibe/mcp/taskmemo-mcp"
      }
    });
    const fs = await import("fs/promises");
    const resultJsonPath = `client/response/${toolName}.json`;
    await fs.writeFile(resultJsonPath, JSON.stringify(result, null, 2), "utf8");
    console.log(`Result from ${toolName} đã lưu vào ${resultJsonPath}`);

    // Extract and save text content to .md file
    if (result && Array.isArray(result.content)) {
      const textBlocks = result.content
        .filter(item => item.type === "text" && typeof item.text === "string")
        .map(item => item.text)
        .join("\n\n");
      if (textBlocks.trim().length > 0) {
        const resultMdPath = `client/response/${toolName}.md`;
        await fs.writeFile(resultMdPath, textBlocks, "utf8");
        console.log(`Text content đã lưu vào ${resultMdPath}`);
      }
    }

    // List all available MCP tools
    // const tools = await client.listTools();
    // console.log("Available MCP tools:", JSON.stringify(tools, null, 2));

    // Write tool list to file
    // const fs = await import("fs/promises");
    // await fs.writeFile("mcp-tools-list.json", JSON.stringify(tools, null, 2), "utf8");
    // console.log("Tool list saved to mcp-tools-list.json");
  } catch (error) {
    console.error("Error calling MCP tool:", error);
  } finally {
    transport.close();
  }
}

main();
