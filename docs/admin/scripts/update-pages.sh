#!/bin/bash

# List of admin pages to update
PAGES="contracts.html customers.html invoices.html projects.html reports.html security.html team.html"

# Update each page
for page in $PAGES; do
    echo "Updating $page..."
    
    # Add user-photo.js script
    sed -i '/<script>/i\    <script src="../scripts/user-photo.js"></script>' "../pages/$page"
    
    # Remove userAvatar textContent line
    sed -i '/userAvatar.textContent =/d' "../pages/$page"
    
    # Add userData variable
    sed -i '/const currentUser =/a\            const userData = JSON.parse(localStorage.getItem('"'userData'"')) || {};' "../pages/$page"
    
    # Add avatar styles
    sed -i '/.user-avatar {/a\            display: flex;\n            align-items: center;\n            justify-content: center;\n            color: white;\n            font-weight: 600;\n        }\n\n        .user-avatar img {\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n            border-radius: 50%;\n        }' "../pages/$page"
done
