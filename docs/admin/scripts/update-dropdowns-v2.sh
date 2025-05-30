#!/bin/bash

# List of admin pages to update
PAGES="security.html contracts.html invoices.html reports.html team.html"

# Update each page
for page in $PAGES; do
    echo "Updating $page..."
    
    # Update the dropdown menu structure
    sed -i '/<div class="user-dropdown-menu">/,/<\/div>/c\                            <div class="user-dropdown-menu">\n                                <a href="#" class="user-dropdown-item logout" onclick="logout()">\n                                    <i class="fas fa-sign-out-alt"></i>\n                                    Logout\n                                </a>\n                            </div>' "../pages/$page"
done
