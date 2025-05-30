// User Info Section Functionality
function toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.querySelector('.user-dropdown');
    const isActive = dropdown.classList.contains('active');
    
    // Close any open dropdowns
    document.querySelectorAll('.user-dropdown').forEach(d => {
        d.classList.remove('active');
    });
    
    // Toggle the clicked dropdown
    if (!isActive) {
        dropdown.classList.add('active');
    }
}

function logout() {
    localStorage.removeItem('userSession');
    window.location.href = '../login.html';
}

// Initialize user info functionality
console.log('User info script loaded');

// Function to initialize user info
function initUserInfo() {
    console.log('Initializing user info');
    
    // Check user session
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    if (!userSession) {
        console.log('No user session found');
        window.location.href = '../login.html';
        return;
    }

    // Get user info elements
    const userInfo = document.querySelector('.user-info');
    const dropdown = document.querySelector('.user-dropdown');
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const dropdownName = document.querySelector('.user-dropdown-name');
    const dropdownEmail = document.querySelector('.user-dropdown-email');
    
    if (!userInfo || !dropdown) {
        console.error('Missing required elements:', {
            userInfo: !!userInfo,
            dropdown: !!dropdown
        });
        return;
    }

    // Get user details from adminUsers
    const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const currentUser = users.find(user => user.role === userSession.role);
    
    if (currentUser) {
        userAvatar.textContent = currentUser.name;
        userName.textContent = currentUser.name;
        dropdownName.textContent = currentUser.name;
        dropdownEmail.textContent = currentUser.email;
    } else {
        userAvatar.textContent = userSession.role;
        userName.textContent = userSession.role;
        dropdownName.textContent = userSession.role;
        dropdownEmail.textContent = userSession.email || `${userSession.role.toLowerCase()}@webflaredesignco.com`;
    }

    // Add click handlers
    userInfo.addEventListener('click', (e) => {
        console.log('User info clicked');
        e.stopPropagation();
        const isActive = dropdown.classList.contains('active');
        
        // Close any open dropdowns
        document.querySelectorAll('.user-dropdown').forEach(d => {
            d.classList.remove('active');
        });
        
        // Toggle the clicked dropdown
        if (!isActive) {
            dropdown.classList.add('active');
        }
    });

    // Add click outside handler
    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initUserInfo);

// Also try to initialize immediately in case script is loaded after DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserInfo);
} else {
    // DOM is already loaded
    initUserInfo();
}
