import os
import json
import logging
from openai import AsyncOpenAI
from models.schemas import ClaudePromptContext, GenerateResponse, ToolSchema

logger = logging.getLogger(__name__)

# Groq uses the OpenAI-compatible API
def _get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=os.getenv("GROQ_API_KEY", ""),
        base_url="https://api.groq.com/openai/v1"
    )

async def generate_mcp_server(context: ClaudePromptContext) -> GenerateResponse:
    client = _get_client()
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    endpoints_json = [e.model_dump() for e in context.endpoints]

    system_prompt = """You are an expert engineering assistant.
Your task is to analyze network intercepts (HAR endpoints) and generate a fully functional Model Context Protocol (MCP) server using the `fastmcp` library in Python.
The server should help the user achieve their specific task.

Here is the FastMCP server template pattern you must follow for your Python code generation:
from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("{server_name}")

@mcp.tool()
def tool_name(param: str) -> dict:
    \"\"\"Clear description of what this tool does.\"\"\"
    response = httpx.get(
        "https://api.example.com/endpoint",
        params={"param": param},
        headers={"Content-Type": "application/json"}
    )
    return response.json()

if __name__ == "__main__":
    mcp.run()

You must output a single JSON object with the following keys:
- "server_code": A strictly valid Python string containing the fully written FastMCP server.
- "tools": A list of objects, each with "name", "description", "parameters" (key-value dict of param to type/desc), "endpoint" (url string), and "method" (string).
- "install_command": A pip command string to install required dependencies (e.g., 'uv pip install mcp httpx').
- "claude_config": A dictionary representing the config block for claude_desktop_config.json.
- "readme": A markdown formatted string with instructions.

Return ONLY a raw JSON string without any markdown wraps like ```json."""

    user_prompt = f"""Task Description: {context.task_description}
Server Name: {context.server_name}

Here are the filtered network endpoints observed:
{json.dumps(endpoints_json, indent=2)}

Generate the required JSON output."""

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=4000, 
        )

        response_text = response.choices[0].message.content or ""
        stripped = response_text.strip()

        # Extract JSON block between the first { and last }
        try:
            start_index = stripped.find('{')
            end_index = stripped.rfind('}')
            if start_index == -1 or end_index == -1:
                raise ValueError("No JSON object found in response")
            
            json_str = stripped[start_index:end_index+1]
            data = json.loads(json_str)

            return GenerateResponse(
                server_code=data["server_code"],
                tools=[ToolSchema(**t) for t in data["tools"]],
                install_command=data["install_command"],
                claude_config=data["claude_config"],
                readme=data["readme"],
            )
        except (ValueError, KeyError, json.JSONDecodeError) as e:
            logger.error(f"Failed to parse LLM response: {str(e)}")
            logger.error(f"Raw response: {response_text}")
            raise e
    except Exception as e:
        logger.error(f"Failed to generate MCP server via Groq ({model}): {str(e)}")
        raise e
