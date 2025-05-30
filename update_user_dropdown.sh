#!/bin/bash

# List of admin pages to update
pages=(
    "clients.html"
    "contracts.html"
    "customers.html"
    "invoices.html"
    "projects.html"
    "reports.html"
    "security.html"
    "settings.html"
    "team.html"
)

# Path to the admin pages directory
dir="/home/judson/Documents/GitHub/Webflare-Design-Co/docs/admin/pages"

# Function to update a single file
update_file() {
    local file="$1"
    
    # Backup the original file
    cp "$dir/$file" "$dir/$file.bak"
    
    # Update the user dropdown content
    sed -i '/<div class="user-dropdown-header">/,/<\/div>/!b' -i \
        -e '/<div class="user-dropdown-header">/,/<\/div>/!b' -i \
        -e '/<div class="user-dropdown-menu">/,/<\/div>/!b' -i \
        -e '/<div class="user-dropdown-menu">/a\ \
                                <a href="#" class="user-dropdown-item logout" onclick="logout()">\ \
                                    <i class="fas fa-sign-out-alt"></i>\ \
                                    Logout\ \
                                </a>\ \
                            </div>' "$dir/$file"
    
    echo "Updated $file"
}

# Update each page
for page in "${pages[@]}"; do
    update_file "$page"
done
