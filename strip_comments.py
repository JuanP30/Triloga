import re
import os

def remove_js_comments(text):
    # Regex to catch // comments and /* */ comments but avoid removing URLs in fetch('http://...')
    # This regex is a simplistic approach for JS/CSS
    # We will just iterate over server.js, js/main.js, css/style.css
    pass

for root, _, files in os.walk('.'):
    for name in files:
        if name.endswith('.js') and 'node_modules' not in root and 'dumper' not in name:
            path = os.path.join(root, name)
            with open(path, 'r') as f:
                content = f.read()
            
            # Remove multi-line /* ... */
            content = re.sub(r'/\*[\s\S]*?\*/', '', content)
            # Remove single line // ...
            content = re.sub(r'(?<![:/])//.*', '', content)
            
            with open(path, 'w') as f:
                f.write(content)

        if name.endswith('.css') and 'node_modules' not in root:
            path = os.path.join(root, name)
            with open(path, 'r') as f:
                content = f.read()
            content = re.sub(r'/\*[\s\S]*?\*/', '', content)
            with open(path, 'w') as f:
                f.write(content)
                
        if name.endswith('.html') and 'node_modules' not in root:
            path = os.path.join(root, name)
            with open(path, 'r') as f:
                content = f.read()
            content = re.sub(r'<!--[\s\S]*?-->', '', content)
            with open(path, 'w') as f:
                f.write(content)
