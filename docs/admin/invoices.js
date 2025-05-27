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

// Initialize invoices page
function initializeInvoices() {
    loadInvoices();
    loadCustomers();
    loadContracts();
    setupEventListeners();
}

// Load invoices from localStorage
function loadInvoices() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoicesList = document.getElementById('invoicesList');
    
    if (invoices.length === 0) {
        invoicesList.innerHTML = '<div class="empty-state">No invoices found</div>';
        return;
    }

    invoicesList.innerHTML = invoices.map(invoice => `
        <div class="invoice-item" data-id="${invoice.id}">
            <div class="invoice-info">
                <div class="invoice-header">
                    <h3>Invoice #${invoice.id.slice(-6)}</h3>
                    <span class="status-badge ${invoice.status}">${invoice.status}</span>
                </div>
                <div class="invoice-details">
                    <p><strong>Customer:</strong> ${invoice.customerName}</p>
                    <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                    <p><strong>Amount:</strong> $${invoice.amount.toFixed(2)}</p>
                </div>
            </div>
            <div class="invoice-actions">
                <button class="btn btn-secondary edit-invoice" title="Edit Invoice">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary print-invoice" title="Print Invoice">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-danger delete-invoice" title="Delete Invoice">
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

// Load contracts for the form
function loadContracts() {
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const contractSelect = document.getElementById('contractId');
    
    contractSelect.innerHTML = '<option value="">Select Contract</option>' +
        contracts.map(contract => `
            <option value="${contract.id}">${contract.title}</option>
        `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add invoice form submission
    document.getElementById('addInvoiceForm').addEventListener('submit', handleAddInvoice);
    
    // Invoice list event delegation
    document.getElementById('invoicesList').addEventListener('click', handleInvoiceActions);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Handle invoice form submission
function handleAddInvoice(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const invoiceData = {
        id: 'INV' + Date.now(),
        customerId: formData.get('customerId'),
        customerName: document.getElementById('customerId').selectedOptions[0].text,
        contractId: formData.get('contractId'),
        date: formData.get('date'),
        dueDate: formData.get('dueDate'),
        amount: parseFloat(formData.get('amount')),
        status: formData.get('status'),
        description: formData.get('description'),
        createdAt: new Date().toISOString()
    };

    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(invoiceData);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    // Add activity
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({
        type: 'add',
        description: `New invoice #${invoiceData.id.slice(-6)} created for ${invoiceData.customerName}`,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));

    e.target.reset();
    loadInvoices();
    showNotification('Invoice added successfully');
}

// Handle invoice actions (edit, print, delete)
function handleInvoiceActions(e) {
    const invoiceItem = e.target.closest('.invoice-item');
    if (!invoiceItem) return;

    const invoiceId = invoiceItem.dataset.id;
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoice = invoices.find(i => i.id === invoiceId);

    if (e.target.closest('.edit-invoice')) {
        handleEditInvoice(invoice);
    } else if (e.target.closest('.print-invoice')) {
        printInvoice(invoice);
    } else if (e.target.closest('.delete-invoice')) {
        handleDeleteInvoice(invoice);
    }
}

// Handle edit invoice
function handleEditInvoice(invoice) {
    const form = document.getElementById('addInvoiceForm');
    form.customerId.value = invoice.customerId;
    form.contractId.value = invoice.contractId;
    form.date.value = invoice.date;
    form.dueDate.value = invoice.dueDate;
    form.amount.value = invoice.amount;
    form.status.value = invoice.status;
    form.description.value = invoice.description;

    form.dataset.editId = invoice.id;
    document.querySelector('.form-header h2').textContent = 'Edit Invoice';
    document.getElementById('submitInvoice').textContent = 'Update Invoice';
}

// Handle delete invoice
function handleDeleteInvoice(invoice) {
    if (confirm(`Are you sure you want to delete invoice #${invoice.id.slice(-6)}?`)) {
        const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        const updatedInvoices = invoices.filter(i => i.id !== invoice.id);
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));

        // Add activity
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.push({
            type: 'delete',
            description: `Invoice #${invoice.id.slice(-6)} deleted`,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));

        loadInvoices();
        showNotification('Invoice deleted successfully');
    }
}

// Print invoice
function printInvoice(invoice) {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const customer = customers.find(c => c.id === invoice.customerId);
    const contract = contracts.find(c => c.id === invoice.contractId);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${invoice.id.slice(-6)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header img { max-width: 200px; }
                        .section { margin: 20px 0; }
                        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .table th, .table td { padding: 8px; border: 1px solid #ddd; }
                        .table th { background-color: #f5f5f5; }
                        .total { text-align: right; margin-top: 20px; }
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
                        <h1>Invoice</h1>
                        <h2>#${invoice.id.slice(-6)}</h2>
                    </div>
                    
                    <div class="section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${customer ? customer.name : 'Unknown'}</p>
                        <p><strong>Email:</strong> ${customer ? customer.email : 'N/A'}</p>
                        <p><strong>Phone:</strong> ${customer ? customer.phone : 'N/A'}</p>
                        <p><strong>Address:</strong> ${customer ? customer.address : 'N/A'}</p>
                    </div>

                    <div class="section">
                        <h3>Invoice Details</h3>
                        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${invoice.status}</p>
                        ${contract ? `<p><strong>Related Contract:</strong> ${contract.title}</p>` : ''}
                    </div>

                    <div class="section">
                        <h3>Services Rendered</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${invoice.description}</td>
                                    <td>$${invoice.amount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="total">
                            <h3>Total Amount: $${invoice.amount.toFixed(2)}</h3>
                        </div>
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
initializeInvoices(); 