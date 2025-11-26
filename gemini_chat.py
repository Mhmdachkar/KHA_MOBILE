import os
import google.generativeai as genai

# 1. Get the API Key from the environment variable you set in PowerShell
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found.")
    print("Please run: $env:GEMINI_API_KEY = 'your_key' in PowerShell")
    exit()

# 2. Configure the API
genai.configure(api_key=api_key)

# 3. Initialize the model (Gemini Pro)
model = genai.GenerativeModel('gemini-pro')

# 4. Start the chat loop
chat = model.start_chat(history=[])

print("------------------------------------------------------")
print("  Gemini Pro Terminal (PowerShell Edition) ")
print("  Type 'quit' or 'exit' to stop.")
print("------------------------------------------------------")

while True:
    # Get user input
    try:
        user_input = input("\nYou: ")
        if user_input.lower() in ['quit', 'exit']:
            break
        
        # Send to Gemini and stream the response
        print("Gemini: ", end="", flush=True)
        response = chat.send_message(user_input, stream=True)
        
        for chunk in response:
            print(chunk.text, end="", flush=True)
        print() # New line after response
        
    except Exception as e:
        print(f"\nAn error occurred: {e}")