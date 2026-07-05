import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def detect_contradiction(statement_a: str, statement_b: str):

    prompt = f"""
Statement A:
{statement_a}

Statement B:
{statement_b}

Do these two statements contradict each other?

Return ONLY valid JSON.

Example:
{{
    "contradiction": true,
    "explanation": "Witness changed his testimony."
}}
"""

    try:
        print("Sending request to Groq...")

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=150
        )

        print("Groq response received.")

        text = response.choices[0].message.content.strip()

        print("Raw Response:")
        print(text)

        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

        result = json.loads(text)

        print("Parsed JSON:")
        print(result)

        return result

    except Exception as e:
        print("Groq Error:")
        print(str(e))

        return {
            "contradiction": False,
            "explanation": str(e)
        }
