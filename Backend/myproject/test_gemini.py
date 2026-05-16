import google.generativeai as genai

genai.configure(
    api_key="AIzaSyA5bQLWsYX4KTJ7fC0I-SDPm5ibYkkDrqs"
)

for m in genai.list_models():
    print(m.name)