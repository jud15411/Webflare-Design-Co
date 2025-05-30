#!/bin/bash

# List of admin pages to update
PAGES="contracts.html customers.html invoices.html projects.html reports.html security.html team.html"

# Update each page
for page in $PAGES; do
    echo "Updating $page..."
    
    # Add notification icon
    sed -i '/<div class="user-info" onclick="toggleUserDropdown(event)">/a\                        <div class="notification-icon">\n                            <i class="fas fa-bell"></i>\n                        </div>' "../pages/$page"
    
    # Add user-dropdown-avatar div
    sed -i '/<div class="user-dropdown-header">/a\                                <div class="user-dropdown-avatar">\n                                    <!-- Profile photo will be inserted here -->\n                                </div>' "../pages/$page"
done
