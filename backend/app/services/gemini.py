import json
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# The prompt tells Gemini exactly what JSON shape to return.
# Keeping it strict (response_mime_type="application/json") means you can
# call json.loads() directly on response.text without extra parsing.
ANALYSIS_PROMPT = """
You are an expert climbing coach analyzing a climbing video. Analyze the climber's technique and provide structured feedback.

Return a JSON object with exactly these fields:
{
  "movement_summary": "<2-3 sentence summary of overall movement quality>",
  "footwork_score": <1-10 integer>,
  "body_position_score": <1-10 integer>,
  "balance_score": <1-10 integer>,
  "technique_tags": ["<tag1>", "<tag2>", ...],
  "key_moments": [
    {"timestamp_seconds": <number>, "description": "<what happens at this moment>"},
    ...
  ]
}

technique_tags examples: "heel hook", "flag", "drop knee", "hip turn", "smear", "crimp grip", "open hand", "barn door"
Focus on movement efficiency, weight transfer, footwork precision, and body positioning.
"""


async def analyze_video(video_bytes: bytes, mime_type: str = "video/mp4") -> dict:
    """Use Gemini to analyze the climbing video and return structured feedback."""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = await model.generate_content_async(
        [{"mime_type": mime_type, "data": video_bytes}, ANALYSIS_PROMPT],
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )

    result = json.loads(response.text)
    print(result)
    return result


async def generate_embedding(text: str) -> list[float]:
  """Converts text of video analysis into a vector embedding using Gemini's text-embedding-004 model."""
  result = await genai.embed_content_async(model="models/gemini-embedding-2", content=text)
  return result["embedding"]
