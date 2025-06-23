// UI Management
const UI = {
        init() {
            this.bindMenuEvents();
            this.showWelcomeScreen();
        },

        bindMenuEvents() {
            document.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    // Remove active class from all menu items
                    document.querySelectorAll('.menu-item').forEach(menuItem => {
                        menuItem.classList.remove('active');
                    });

                    // Add active class to clicked item
                    e.target.classList.add('active');

                    const page = e.target.dataset.page;
                    this.loadPage(page);
                });
            });
        },

        showWelcomeScreen() {
            const content = document.getElementById('content');
            content.innerHTML = `
            <div class="welcome-screen">
                <h1>Chào mừng đến với Hệ thống Quản lý Thư viện</h1>
                <p>Vui lòng chọn một mục từ menu bên trái để bắt đầu.</p>
                <div class="stats-grid" style="margin-top: 40px;">
                    <div class="stat-card">
                        <h3>Tổng số sách</h3>
                        <div class="stat-number">${DataStore.getBookStats().totalBooks}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Sách có sẵn</h3>
                        <div class="stat-number">${DataStore.getBookStats().availableBooks}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Tổng độc giả</h3>
                        <div class="stat-number">${DataStore.getAll('readers').length}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Đang mượn</h3>
                        <div class="stat-number">${DataStore.getAll('loans').filter(loan => loan.status === 'active').length}</div>
                    </div>
                </div>
            </div>
        `;
        },

        loadPage(page) {
            const content = document.getElementById('content');

            switch (page) {
                case 'books':
                    BookModule.showBookManagement();
                    break;
                case 'readers':
                    ReaderModule.showReaderManagement();
                    break;
                case 'authors':
                    AuthorModule.showAuthorManagement();
                    break;
                case 'publishers':
                    PublisherModule.showPublisherManagement();
                    break;
                case 'loans':
                    LoanModule.showLoanManagement();
                    break;
                case 'reports':
                    ReportModule.showReports();
                    break;
                default:
                    this.showWelcomeScreen();
            }
        },

        showMessage(message, type = 'info') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message message-${type}`;
            messageDiv.textContent = message;
            document.body.appendChild(messageDiv);
            setTimeout(() => messageDiv.remove(), 3000);
        },

        createTable(headers, rows, actions = []) {
            let tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                            ${actions.length > 0 ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.data.map(cell => `<td>${cell}</td>`).join('')}
                                ${actions.length > 0 ? `
                                    <td>
                                        ${actions.map(action => 
                                            `<button class="button ${action.class || ''}" 
                                                     onclick="${action.onclick.replace('{id}', row.id)}">
                                                ${action.text}
                                             </button>`
                                        ).join('')}
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        return tableHTML;
    },

    createForm(fields, submitHandler, cancelHandler = null) {
        let formHTML = `
            <div class="form-container">
                <form onsubmit="${submitHandler}">
                    ${fields.map(field => {
                        switch(field.type) {
                            case 'text':
                            case 'email':
                            case 'tel':
                            case 'number':
                            case 'date':
                                return `
                                    <div class="form-group">
                                        <label for="${field.id}">${field.label}</label>
                                        <input type="${field.type}" id="${field.id}" 
                                               ${field.required ? 'required' : ''}
                                               ${field.value ? `value="${field.value}"` : ''}
                                               ${field.min ? `min="${field.min}"` : ''}
                                               ${field.max ? `max="${field.max}"` : ''}>
                                    </div>
                                `;
                            case 'select':
                                return `
                                    <div class="form-group">
                                        <label for="${field.id}">${field.label}</label>
                                        <select id="${field.id}" ${field.required ? 'required' : ''}>
                                            ${field.options.map(option => 
                                                `<option value="${option.value}" 
                                                         ${option.selected ? 'selected' : ''}>
                                                    ${option.text}
                                                 </option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                `;
                            case 'textarea':
                                return `
                                    <div class="form-group">
                                        <label for="${field.id}">${field.label}</label>
                                        <textarea id="${field.id}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>
                                    </div>
                                `;
                            default:
                                return '';
                        }
                    }).join('')}
                    <div class="form-group">
                        <button type="submit" class="button button-primary">Submit</button>
                        ${cancelHandler ? `<button type="button" class="button" onclick="${cancelHandler}">Cancel</button>` : ''}
                    </div>
                </form>
            </div>
        `;
        return formHTML;
    },

    createTabs(tabs) {
        let tabsHTML = `
            <div class="tabs">
                ${tabs.map((tab, index) => 
                    `<div class="tab ${index === 0 ? 'active' : ''}" onclick="UI.switchTab(${index})">${tab.title}</div>`
                ).join('')}
            </div>
            ${tabs.map((tab, index) => 
                `<div class="tab-content ${index === 0 ? 'active' : ''}" id="tab-${index}">${tab.content}</div>`
            ).join('')}
        `;
        return tabsHTML;
    },

    switchTab(activeIndex) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab').forEach((tab, index) => {
            tab.classList.toggle('active', index === activeIndex);
        });
        document.querySelectorAll('.tab-content').forEach((content, index) => {
            content.classList.toggle('active', index === activeIndex);
        });
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    },

    calculateDaysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});