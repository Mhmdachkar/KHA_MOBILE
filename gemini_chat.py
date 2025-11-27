import os
import google.generativeai as genai

# 1. Get the API Key
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found.")
    print("Please run: $env:GEMINI_API_KEY = 'your_key_here'")
    exit()

# 2. Configure the API
genai.configure(api_key=api_key)

# 3. Initialize the Model
try:
    # We are using the Pro model you found in your list
    model = genai.GenerativeModel('gemini-2.5-pro')
    chat = model.start_chat(history=[])
except Exception as e:
    print(f"Error connecting to Google: {e}")
    exit()

print("------------------------------------------------------")
print("  Gemini 2.5 Pro Terminal (PowerShell Edition) ")
print("  Type 'quit' to stop.")
print("------------------------------------------------------")

while True:
    try:
        user_input = input("\nYou: ")
        
        # Check if input is empty to prevent crashing
        if not user_input.strip():
            continue

        if user_input.lower() in ['quit', 'exit']:
            break
        
        print("Gemini: ", end="", flush=True)
        response = chat.send_message(user_input, stream=True)
        
        for chunk in response:
            print(chunk.text, end="", flush=True)
        print() 
        
    except Exception as e:
        print(f"\nAn error occurred: {e}")