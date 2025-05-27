// Mobile menu functionality
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const menuOverlay = document.getElementById('menuOverlay');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
});

menuOverlay.addEventListener('click', () => {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
});

// Initialize contracts page
function initializeContracts() {
    loadContracts();
    loadCustomers();
    setupEventListeners();
}

// Load contracts from localStorage
function loadContracts() {
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const contractsList = document.getElementById('contractsList');
    
    if (contracts.length === 0) {
        contractsList.innerHTML = '<div class="empty-state">No contracts found</div>';
        return;
    }

    contractsList.innerHTML = contracts.map(contract => `
        <div class="contract-item" data-id="${contract.id}">
            <div class="contract-info">
                <div class="contract-header">
                    <h3>${contract.title}</h3>
                    <span class="status-badge ${contract.status}">${contract.status}</span>
                </div>
                <div class="contract-details">
                    <p><strong>Customer:</strong> ${contract.customerName}</p>
                    <p><strong>Start Date:</strong> ${new Date(contract.startDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> ${new Date(contract.endDate).toLocaleDateString()}</p>
                    <p><strong>Value:</strong> $${contract.value.toFixed(2)}</p>
                </div>
            </div>
            <div class="contract-actions">
                <button class="btn btn-secondary edit-contract" title="Edit Contract">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary print-contract" title="Print Contract">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-danger delete-contract" title="Delete Contract">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load customers for the form
function loadCustomers() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customerSelect = document.getElementById('customerId');
    
    customerSelect.innerHTML = '<option value="">Select Customer</option>' +
        customers.map(customer => `
            <option value="${customer.id}">${customer.name}</option>
        `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add contract form submission
    document.getElementById('addContractForm').addEventListener('submit', handleAddContract);
    
    // Contract list event delegation
    document.getElementById('contractsList').addEventListener('click', handleContractActions);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Handle contract form submission
function handleAddContract(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contractData = {
        id: 'CTR' + Date.now(),
        title: formData.get('title'),
        customerId: formData.get('customerId'),
        customerName: document.getElementById('customerId').selectedOptions[0].text,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        value: parseFloat(formData.get('value')),
        status: formData.get('status'),
        terms: formData.get('terms'),
        createdAt: new Date().toISOString()
    };

    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    contracts.push(contractData);
    localStorage.setItem('contracts', JSON.stringify(contracts));

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'add',
        description: `New contract "${contractData.title}" created for ${contractData.customerName}`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    e.target.reset();
    loadContracts();
    showNotification('Contract added successfully');
}

// Handle contract actions (edit, print, delete)
function handleContractActions(e) {
    const contractItem = e.target.closest('.contract-item');
    if (!contractItem) return;

    const contractId = contractItem.dataset.id;
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const contract = contracts.find(c => c.id === contractId);

    if (e.target.closest('.edit-contract')) {
        handleEditContract(contract);
    } else if (e.target.closest('.print-contract')) {
        printContract(contract);
    } else if (e.target.closest('.delete-contract')) {
        handleDeleteContract(contract);
    }
}

// Handle edit contract
function handleEditContract(contract) {
    const form = document.getElementById('addContractForm');
    form.title.value = contract.title;
    form.customerId.value = contract.customerId;
    form.startDate.value = contract.startDate;
    form.endDate.value = contract.endDate;
    form.value.value = contract.value;
    form.status.value = contract.status;
    form.terms.value = contract.terms;

    form.dataset.editId = contract.id;
    document.querySelector('.form-header h2').textContent = 'Edit Contract';
    document.getElementById('submitContract').textContent = 'Update Contract';
}

// Handle delete contract
function handleDeleteContract(contract) {
    if (confirm(`Are you sure you want to delete the contract "${contract.title}"?`)) {
        const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        const updatedContracts = contracts.filter(c => c.id !== contract.id);
        localStorage.setItem('contracts', JSON.stringify(updatedContracts));

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.push({
            type: 'delete',
            description: `Contract "${contract.title}" deleted`,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));

        loadContracts();
        showNotification('Contract deleted successfully');
    }
}

// Print contract
function printContract(contract) {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customer = customers.find(c => c.id === contract.customerId);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Contract - ${contract.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header img { max-width: 200px; }
                        .section { margin: 20px 0; }
                        .signature-section { margin-top: 50px; }
                        .signature-line { border-top: 1px solid #000; margin-top: 50px; }
                        @media print {
                            body { margin: 0; padding: 20px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="../Logos/Webflare_Design_Co.webp" alt="Webflare Design Co Logo">
                        <h1>Contract Agreement</h1>
                    </div>
                    
                    <div class="section">
                        <h2>Contract Details</h2>
                        <p><strong>Contract Title:</strong> ${contract.title}</p>
                        <p><strong>Customer:</strong> ${customer ? customer.name : 'Unknown'}</p>
                        <p><strong>Start Date:</strong> ${new Date(contract.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> ${new Date(contract.endDate).toLocaleDateString()}</p>
                        <p><strong>Contract Value:</strong> $${contract.value.toFixed(2)}</p>
                        <p><strong>Status:</strong> ${contract.status}</p>
                    </div>

                    <div class="section">
                        <h2>Terms and Conditions</h2>
                        <p>${contract.terms}</p>
                    </div>

                    <div class="signature-section">
                        <div class="signature-line">
                            <p>Customer Signature</p>
                        </div>
                        <div class="signature-line">
                            <p>Webflare Design Co. Representative</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize page on load
initializeContracts(); 