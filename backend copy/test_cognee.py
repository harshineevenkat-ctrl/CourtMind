import asyncio
from dotenv import load_dotenv
load_dotenv()
import cognee

async def main():
    await cognee.prune.prune_data()
    await cognee.remember("Doug is the groom. The wedding is Sunday.")
    result = await cognee.recall("Who is the groom?")
    print(result)

asyncio.run(main())
