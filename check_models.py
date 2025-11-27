import google.generativeai as genai
import os

# Get the key
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: API Key is missing. Please set it in PowerShell first.")
    exit()

genai.configure(api_key=api_key)

print("------------------------------------------------")
print("   Talking to Google to find your models...     ")
print("------------------------------------------------")

try:
    # Ask Google for the list
    found_any = False
    for m in genai.list_models():
        # We only care about models that can Chat (generateContent)
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ FOUND: {m.name}")
            found_any = True
            
    if not found_any:
        print("❌ No chat models found. Your API key might be invalid or restricted.")

except Exception as e:
    print(f"❌ Error: {e}")