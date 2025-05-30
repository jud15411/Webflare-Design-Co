#!/bin/bash

# List of admin pages to update
PAGES="settings.html projects.html clients.html security.html contracts.html invoices.html reports.html team.html"

# Update each page
for page in $PAGES; do
    echo "Updating $page..."
    
    # Update avatar styling
    sed -i '/.user-avatar {/,/}/c\        .user-avatar {\n            width: 40px;\n            height: 40px;\n            border-radius: 50%;\n            background: var(--primary-color);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            color: white;\n            font-weight: 600;\n            font-size: 0.875rem;\n        }' "../pages/$page"

done
