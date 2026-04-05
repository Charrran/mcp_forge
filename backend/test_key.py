import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

async def test_key():
    load_dotenv()
    key = os.getenv("GROQ_API_KEY")
    print(f"Key loaded: {key[:10]}...{key[-5:] if key else 'None'}")
    
    client = AsyncOpenAI(
        api_key=key,
        base_url="https://api.groq.com/openai/v1"
    )
    
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=5
        )
        print("Success!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_key())
