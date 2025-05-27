// Dashboard Module
const Dashboard = {
    // Initialize dashboard
    init() {
        this.loadStats();
        this.setupCharts();
        this.loadActivity();
        this.setupEventListeners();
    },

    // Load dashboard statistics
    loadStats() {
        // Get data from localStorage
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

        // Calculate total revenue
        const totalRevenue = invoices
            .filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.amount, 0);

        // Calculate revenue change
        const lastMonthRevenue = invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.paidAt);
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return invoice.status === 'paid' && invoiceDate >= lastMonth;
            })
            .reduce((sum, invoice) => sum + invoice.amount, 0);

        const previousMonthRevenue = invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.paidAt);
                const lastMonth = new Date();
                const twoMonthsAgo = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                return invoice.status === 'paid' && invoiceDate >= twoMonthsAgo && invoiceDate < lastMonth;
            })
            .reduce((sum, invoice) => sum + invoice.amount, 0);

        const revenueChange = previousMonthRevenue === 0 ? 100 :
            ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

        // Update revenue stats
        document.getElementById('totalRevenue').textContent = Admin.formatCurrency(totalRevenue);
        document.getElementById('revenueChange').textContent = 
            `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% from last month`;

        // Update customer stats
        const activeCustomers = customers.filter(customer => customer.status === 'active').length;
        const newCustomers = customers.filter(customer => {
            const customerDate = new Date(customer.createdAt);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return customerDate >= lastMonth;
        }).length;

        document.getElementById('activeCustomers').textContent = activeCustomers;
        document.getElementById('customerChange').textContent = 
            `${newCustomers > 0 ? '+' : ''}${newCustomers} this month`;

        // Update project stats
        const activeProjects = contracts.filter(contract => contract.status === 'active').length;
        const completedProjects = contracts.filter(contract => {
            const completionDate = new Date(contract.completedAt);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return contract.status === 'completed' && completionDate >= lastMonth;
        }).length;

        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('projectChange').textContent = 
            `${completedProjects} completed this month`;

        // Update invoice stats
        const pendingAmount = invoices
            .filter(invoice => invoice.status === 'pending')
            .reduce((sum, invoice) => sum + invoice.amount, 0);
        const pendingCount = invoices.filter(invoice => invoice.status === 'pending').length;

        document.getElementById('pendingInvoices').textContent = Admin.formatCurrency(pendingAmount);
        document.getElementById('invoiceChange').textContent = 
            `${pendingCount} invoices pending`;
    },

    // Set up charts
    setupCharts() {
        this.setupRevenueChart();
        this.setupProjectChart();
    },

    // Set up revenue chart
    setupRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        
        // Get last 12 months of data
        const months = [];
        const revenue = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.toLocaleString('default', { month: 'short' });
            months.push(month);
            
            const monthRevenue = invoices
                .filter(invoice => {
                    const invoiceDate = new Date(invoice.paidAt);
                    return invoice.status === 'paid' &&
                           invoiceDate.getMonth() === date.getMonth() &&
                           invoiceDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, invoice) => sum + invoice.amount, 0);
            
            revenue.push(monthRevenue);
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenue,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => Admin.formatCurrency(value)
                        }
                    }
                }
            }
        });
    },

    // Set up project chart
    setupProjectChart() {
        const ctx = document.getElementById('projectChart').getContext('2d');
        const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        
        // Count projects by status
        const statusCounts = contracts.reduce((counts, contract) => {
            counts[contract.status] = (counts[contract.status] || 0) + 1;
            return counts;
        }, {});
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Completed', 'On Hold', 'Cancelled'],
                datasets: [{
                    data: [
                        statusCounts.active || 0,
                        statusCounts.completed || 0,
                        statusCounts.onHold || 0,
                        statusCounts.cancelled || 0
                    ],
                    backgroundColor: [
                        '#2563eb',
                        '#22c55e',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    // Load recent activity
    loadActivity() {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const activityList = document.getElementById('activityList');
        
        if (!activityList) return;
        
        activityList.innerHTML = activities
            .slice(0, 10)
            .map(activity => `
                <div class="activity-item">
                    <div class="activity-icon" style="background-color: ${this.getActivityColor(activity.type)}">
                        <i class="${this.getActivityIcon(activity.type)}" style="color: white;"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.description}</h4>
                        <p>${Admin.getRelativeTime(activity.timestamp)}</p>
                    </div>
                </div>
            `)
            .join('');
    },

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            login: 'fas fa-sign-in-alt',
            customer: 'fas fa-user',
            contract: 'fas fa-file-contract',
            invoice: 'fas fa-file-invoice-dollar',
            payment: 'fas fa-money-bill-wave',
            default: 'fas fa-info-circle'
        };
        return icons[type] || icons.default;
    },

    // Get activity background color
    getActivityColor(type) {
        const colors = {
            login: '#2563eb',
            customer: '#22c55e',
            contract: '#f59e0b',
            invoice: '#ef4444',
            payment: '#8b5cf6',
            default: '#64748b'
        };
        return colors[type] || colors.default;
    },

    // Set up event listeners
    setupEventListeners() {
        // Revenue timeframe change
        const revenueTimeframe = document.getElementById('revenueTimeframe');
        if (revenueTimeframe) {
            revenueTimeframe.addEventListener('change', () => {
                // TODO: Implement timeframe filtering
                Admin.showToast('Timeframe filtering will be implemented soon', 'info');
            });
        }

        // Refresh activity
        const refreshActivity = document.getElementById('refreshActivity');
        if (refreshActivity) {
            refreshActivity.addEventListener('click', () => {
                this.loadActivity();
                Admin.showToast('Activity feed refreshed', 'success');
            });
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => Dashboard.init()); 