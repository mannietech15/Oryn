import re
with open('/home/mannietech/.gemini/antigravity/brain/4cdeaf0c-47dc-49dc-bd7e-018059b27057/.system_generated/logs/overview.txt', 'r') as f:
    text = f.read()
match = re.search(r'### Full Component Source.*?```(?:tsx|jsx)\n(.*?)\n```', text, re.DOTALL)
if match:
    with open('src/components/SplashCursor.tsx', 'w') as out:
        out.write(match.group(1))
    print('Saved SplashCursor.tsx')
else:
    print('Not found')
