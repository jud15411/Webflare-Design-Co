// Filter dropdown functionality
function toggleFilterMenu(button) {
    const filterMenu = button.parentElement.querySelector('.filter-menu');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const filterMenus = document.querySelectorAll('.filter-menu');

    // Close all other menus
    filterMenus.forEach(menu => {
        menu.classList.remove('active');
    });
    filterDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });

    // Open the menu
    filterMenu.classList.add('active');
    button.classList.add('active');
}

// Close filter menu
function closeFilterMenu(button) {
    const filterMenu = button.parentElement;
    const filterButton = filterMenu.parentElement.querySelector('.filter-dropdown');
    
    filterMenu.classList.remove('active');
    filterButton.classList.remove('active');
}

// Close menu when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener for outside clicks
    document.addEventListener('click', function(e) {
        const filterMenus = document.querySelectorAll('.filter-menu');
        filterMenus.forEach(filterMenu => {
            if (!filterMenu.contains(e.target)) {
                const filterButton = filterMenu.parentElement.querySelector('.filter-dropdown');
                filterMenu.classList.remove('active');
                filterButton.classList.remove('active');
            }
        });
    });
});

// Save changes without applying filters
function saveChanges() {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get filter state
    const filterState = JSON.parse(localStorage.getItem('filterState')) || {};
    
    // Get all selected filters
    const dateRange = document.querySelector('input[name="dateRange"]:checked')?.value;
    const selectedCustomers = Array.from(document.querySelectorAll('input[name="customerFilter"]:checked')).map(cb => cb.value);
    
    // Update filter state
    if (!filterState[currentPage]) {
        filterState[currentPage] = {};
    }
    
    // Save date range
    if (dateRange) {
        filterState[currentPage]['dateRange'] = dateRange;
    }
    
    // Save selected customers
    if (selectedCustomers.length > 0) {
        filterState[currentPage]['customers'] = selectedCustomers;
    }
    
    // Save filter state
    localStorage.setItem('filterState', JSON.stringify(filterState));
}

// Date Range Filter
function toggleDateRange(button) {
    const options = button.parentElement.parentElement.querySelector('.date-range-options');
    options.classList.toggle('active');
    button.classList.toggle('active');
}

// Customer Filter
function toggleCustomerList(button) {
    const options = button.parentElement.parentElement.querySelector('.customer-options');
    options.classList.toggle('active');
    button.classList.toggle('active');
    
    // Load customer list if not already loaded
    const customerList = options.querySelector('.customer-list');
    if (!customerList.innerHTML) {
        loadCustomerList(customerList);
    }
}

function loadCustomerList(listElement) {
    // Get customers from localStorage or API
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    // Create customer items
    customers.forEach(customer => {
        const item = document.createElement('div');
        item.className = 'customer-item';
        item.innerHTML = `
            <input type="checkbox" name="customerFilter" value="${customer.id}">
            <span>${customer.name}</span>
        `;
        listElement.appendChild(item);
    });
}

// Customer Search
function setupCustomerSearch() {
    const searchInput = document.getElementById('customerSearch');
    const customerList = document.querySelector('.customer-list');
    
    if (searchInput && customerList) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const items = customerList.querySelectorAll('.customer-item');
            
            items.forEach(item => {
                const name = item.querySelector('span').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Save Filters
function saveFilters() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get filter values based on current page
    let filterState = {};
    
    if (currentPage === 'customers') {
        filterState = {
            dateRange: document.querySelector('input[name="dateRange"]:checked')?.value || 'all',
            status: {
                active: document.getElementById('statusActive').checked,
                inactive: document.getElementById('statusInactive').checked
            }
        };
    } else if (currentPage === 'contracts') {
        filterState = {
            dateRange: document.querySelector('input[name="dateRange"]:checked')?.value || 'all',
            customer: document.getElementById('customerAll').checked,
            status: {
                draft: document.getElementById('statusDraft').checked,
                pending: document.getElementById('statusPending').checked,
                active: document.getElementById('statusActive').checked,
                completed: document.getElementById('statusCompleted').checked,
                cancelled: document.getElementById('statusCancelled').checked
            }
        };
    } else if (currentPage === 'invoices') {
        filterState = {
            dateRange: document.querySelector('input[name="dateRange"]:checked')?.value || 'all',
            status: {
                pending: document.getElementById('statusPending').checked,
                paid: document.getElementById('statusPaid').checked,
                overdue: document.getElementById('statusOverdue').checked
            }
        };
    }
    
    // Save to localStorage
    localStorage.setItem(`filterState_${currentPage}`, JSON.stringify(filterState));
    
    // Save selected customers
    const selectedCustomers = Array.from(document.querySelectorAll('input[name="customerFilter"]:checked')).map(cb => cb.value);
    if (selectedCustomers.length > 0) {
        filterState[currentPage]['customers'] = selectedCustomers;
    }
    
    // Save filter state
    localStorage.setItem('filterState', JSON.stringify(filterState));
    
    // Apply filters
    applyFilters(currentPage);
    
    // Close filter menu
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const filterMenus = document.querySelectorAll('.filter-menu');
    filterMenus.forEach(menu => menu.classList.remove('active'));
    filterDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
}

// Reset Filters
function resetFilters() {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get filter state
    const filterState = JSON.parse(localStorage.getItem('filterState')) || {};
    
    // Reset selected filters
    document.querySelectorAll('input[name="dateRange"]').forEach(radio => {
        if (radio.value === 'all') {
            radio.checked = true;
        }
    });
    document.querySelectorAll('input[name="customerFilter"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear filter state for this page
    if (filterState[currentPage]) {
        delete filterState[currentPage];
        localStorage.setItem('filterState', JSON.stringify(filterState));
    }
    
    // Apply default filters
    applyFilters(currentPage);
    
    // Close filter menu
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const filterMenus = document.querySelectorAll('.filter-menu');
    filterMenus.forEach(menu => menu.classList.remove('active'));
    filterDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
}

// Initialize customer search when filter menu opens
document.addEventListener('DOMContentLoaded', function() {
    // Initialize customer search
    setupCustomerSearch();
    
    // Add event listener for filter menu
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    filterDropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFilterMenu(this);
        });
    });
});

// Apply filters function
document.addEventListener('DOMContentLoaded', function() {
    // Get all filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Initialize filter state
    if (!localStorage.getItem('filterState')) {
        localStorage.setItem('filterState', JSON.stringify({}));
    }
    
    // Load saved filter state
    const filterState = JSON.parse(localStorage.getItem('filterState')) || {};
    const pageFilters = filterState[currentPage] || {};

    // Set initial checkbox states
    filterCheckboxes.forEach(checkbox => {
        const section = checkbox.closest('.filter-section');
        const sectionId = section.querySelector('h4').textContent.toLowerCase();
        const value = checkbox.value;
        
        if (pageFilters[sectionId] && pageFilters[sectionId][value]) {
            checkbox.checked = pageFilters[sectionId][value];
        }
    });

    // Add change event listeners
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const section = this.closest('.filter-section');
            const sectionId = section.querySelector('h4').textContent.toLowerCase();
            const value = this.value;
            const isChecked = this.checked;

            // Update the filter state
            updateFilterState(sectionId, value, isChecked);
        });
    });

    // Apply initial filters
    applyFilters();
});

// Update filter state function
function updateFilterState(section, value, checked) {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Get current filter state
    let filterState = JSON.parse(localStorage.getItem(`filterState_${currentPage}`)) || {};
    
    // Update filter state
    if (!filterState[section]) {
        filterState[section] = {};
    }

    filterState[section][value] = checked;
    
    // Save filter state
    localStorage.setItem(`filterState_${currentPage}`, JSON.stringify(filterState));
    
    // Apply filters
    applyFilters();
}
