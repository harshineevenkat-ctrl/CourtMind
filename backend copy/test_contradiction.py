from contradiction import detect_contradiction

result = detect_contradiction(
    "The witness testified that he personally saw Mr. Jones sign the agreement on 12 January 2024.",
    "The witness testified that he was not present when the agreement was signed, and only saw it the next day on 13 January 2024."
)
print(result)