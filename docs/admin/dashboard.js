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

// Initialize dashboard data
function initializeDashboard() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const activities = JSON.parse(localStorage.getItem('activities')) || [];

    // Update statistics
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('activeContracts').textContent = contracts.filter(c => c.status === 'active').length;
    document.getElementById('pendingInvoices').textContent = invoices.filter(i => i.status === 'pending').length;
    
    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = invoices
        .filter(i => new Date(i.date).getMonth() === currentMonth && i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0);
    document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toFixed(2)}`;

    // Update activity list
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities
        .slice(-5)
        .map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-text">${activity.description}</div>
                    <div class="activity-time">${formatDate(activity.timestamp)}</div>
                </div>
            </div>
        `)
        .join('');

    // Update user info
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin')) || { name: 'Admin' };
    document.getElementById('userName').textContent = currentAdmin.name;
    document.getElementById('userAvatar').textContent = currentAdmin.name.charAt(0);
}

function getActivityIcon(type) {
    switch(type) {
        case 'add': return 'fa-plus';
        case 'edit': return 'fa-edit';
        case 'delete': return 'fa-trash';
        default: return 'fa-info-circle';
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    }
});

// Print Sales Report functionality
document.getElementById('printSalesBtn').addEventListener('click', () => {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    // Filter invoices for current month and week
    const monthlyInvoices = invoices.filter(i => {
        const invoiceDate = new Date(i.date);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
    });

    const weeklyInvoices = invoices.filter(i => {
        const invoiceDate = new Date(i.date);
        return invoiceDate >= weekStart && invoiceDate <= weekEnd;
    });

    // Calculate totals
    const monthlyTotal = monthlyInvoices.reduce((sum, i) => sum + i.amount, 0);
    const weeklyTotal = weeklyInvoices.reduce((sum, i) => sum + i.amount, 0);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Sales Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header img { max-width: 200px; }
                        .section { margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 8px; border: 1px solid #ddd; }
                        th { background-color: #f5f5f5; }
                        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
                        @media print {
                            body { margin: 0; padding: 20px; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="../Logos/Webflare_Design_Co.webp" alt="Webflare Design Co Logo">
                        <h1>Sales Report</h1>
                        <h2>${new Date().toLocaleDateString()}</h2>
                    </div>
                    
                    <div class="section">
                        <div class="summary">
                            <h3>Monthly Summary (${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear})</h3>
                            <p>Total Sales: $${monthlyTotal.toFixed(2)}</p>
                            <p>Number of Invoices: ${monthlyInvoices.length}</p>
                        </div>
                    </div>

                    <div class="section">
                        <div class="summary">
                            <h3>Weekly Summary (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})</h3>
                            <p>Total Sales: $${weeklyTotal.toFixed(2)}</p>
                            <p>Number of Invoices: ${weeklyInvoices.length}</p>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Monthly Invoice Details</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${monthlyInvoices.map(invoice => {
                                    const customer = customers.find(c => c.id === invoice.customerId) || { name: 'Unknown Customer' };
                                    return `
                                        <tr>
                                            <td>${invoice.id.slice(-6)}</td>
                                            <td>${customer.name}</td>
                                            <td>${new Date(invoice.date).toLocaleDateString()}</td>
                                            <td>$${invoice.amount.toFixed(2)}</td>
                                            <td>${invoice.status}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
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
});

// Initialize dashboard on load
initializeDashboard(); 