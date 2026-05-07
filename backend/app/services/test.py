import google.generativeai as genai
genai.configure(api_key="AIzaSyDYKQs3mwG11j7iGZrBfVxDQGicCfgBrFg")
for m in genai.list_models():
    print(m.name)