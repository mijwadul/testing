import os
import glob
import re

directory = 'd:/Titip/System Kusuma/frontend/src'

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # If the file contains /api/v1 hardcoded inside fetch or axios
            if re.search(r'[\'\"\`]/api/v1/', content) or re.search(r'baseURL:\s*[\'\"\`]/api/v1[\'\"\`]', content):
                # Ensure API_URL is imported if we are going to use it
                needs_import = False
                if 'API_URL' not in content:
                    needs_import = True
                
                # Replace '/api/v1/...' with `${API_URL}/...`
                # Be careful with existing template strings
                
                # We'll use a simpler approach: 
                # Replace "/api/v1/ with `${API_URL}/
                content_new = re.sub(r'\"/api/v1/([^\"]*)\"', r'`${API_URL}/\1`', content)
                content_new = re.sub(r'\'/api/v1/([^\']*)\'', r'`${API_URL}/\1`', content_new)
                
                # For strings that are already template literals: `/api/v1/something/${id}` -> `${API_URL}/something/${id}`
                content_new = re.sub(r'`/api/v1/([^`]*)`', r'`${API_URL}/\1`', content_new)

                # For axios baseURL: "/api/v1"
                content_new = re.sub(r'baseURL:\s*[\'\"\`]/api/v1[\'\"\`]', r'baseURL: API_URL', content_new)
                
                if content_new != content:
                    if needs_import:
                        # Find the relative path to api/auth.js
                        depth = filepath.replace(directory, '').count(os.sep)
                        if depth == 1: # in a folder like src/pages
                            import_path = '../api/auth'
                        elif depth == 2:
                            import_path = '../../api/auth'
                        else:
                            import_path = './api/auth' # naive
                        
                        # Add import at the top
                        content_new = f'import {{ API_URL }} from "{import_path}";\n' + content_new
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content_new)
                    print(f"Updated {filepath}")
