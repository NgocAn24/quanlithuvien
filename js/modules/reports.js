const ReportModule = {
        showReports() {
            const content = document.getElementById('content');
            const tabs = [{
                    title: 'Overview',
                    content: this.createOverviewSection()
                },
                {
                    title: 'Popular Books',
                    content: this.createPopularBooksSection()
                },
                {
                    title: 'Active Readers',
                    content: this.createActiveReadersSection()
                },
                {
                    title: 'Monthly Statistics',
                    content: this.createMonthlyStatsSection()
                }
            ];

            content.innerHTML = `
            <h2>Reports & Statistics</h2>
            ${UI.createTabs(tabs)}
        `;
        },

        createOverviewSection() {
            const stats = this.calculateOverallStats();

            return `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Books</h3>
                    <div class="stat-number">${stats.totalBooks}</div>
                    <p>Across ${stats.uniqueTitles} unique titles</p>
                </div>
                <div class="stat-card">
                    <h3>Available Books</h3>
                    <div class="stat-number">${stats.availableBooks}</div>
                    <p>${stats.borrowedBooks} currently borrowed</p>
                </div>
                <div class="stat-card">
                    <h3>Active Readers</h3>
                    <div class="stat-number">${stats.activeReaders}</div>
                    <p>Out of ${stats.totalReaders} total readers</p>
                </div>
                <div class="stat-card">
                    <h3>Overdue Books</h3>
                    <div class="stat-number">${stats.overdueBooks}</div>
                    <p>Needs attention</p>
                </div>
            </div>
            <div class="category-distribution">
                <h3>Book Distribution by Category</h3>
                ${this.createCategoryChart()}
            </div>
        `;
        },

        createPopularBooksSection() {
            const popularBooks = this.getPopularBooks();
            const headers = ['Title', 'Author', 'Category', 'Times Borrowed', 'Available Copies'];
            const rows = popularBooks.map(book => ({
                id: book.id,
                data: [
                    book.title,
                    this.getAuthorName(book.authorId),
                    book.category,
                    book.loanCount,
                    this.getAvailableCopies(book)
                ]
            }));

            return `
            <h3>Most Borrowed Books</h3>
            ${UI.createTable(headers, rows)}
        `;
        },

        createActiveReadersSection() {
            const activeReaders = this.getActiveReaders();
            const headers = ['Reader Name', 'Books Borrowed', 'Current Loans', 'Last Activity'];
            const rows = activeReaders.map(reader => ({
                id: reader.id,
                data: [
                    reader.name,
                    reader.totalLoans,
                    reader.currentLoans,
                    UI.formatDate(reader.lastActivity)
                ]
            }));

            return `
            <h3>Most Active Readers</h3>
            ${UI.createTable(headers, rows)}
        `;
        },

        createMonthlyStatsSection() {
            const monthlyStats = this.calculateMonthlyStats();

            return `
            <div class="monthly-stats">
                <h3>Activity in ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>New Loans</h3>
                        <div class="stat-number">${monthlyStats.newLoans}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Returns</h3>
                        <div class="stat-number">${monthlyStats.returns}</div>
                    </div>
                    <div class="stat-card">
                        <h3>New Readers</h3>
                        <div class="stat-number">${monthlyStats.newReaders}</div>
                    </div>
                    <div class="stat-card">
                        <h3>New Books</h3>
                        <div class="stat-number">${monthlyStats.newBooks}</div>
                    </div>
                </div>
                ${this.createMonthlyChart()}
            </div>
        `;
        },

        calculateOverallStats() {
            const books = DataStore.getAll('books');
            const loans = DataStore.getAll('loans');
            const readers = DataStore.getAll('readers');
            const activeLoans = loans.filter(loan => loan.status === 'active');
            const overdueLoans = this.getOverdueLoans();

            return {
                totalBooks: books.reduce((sum, book) => sum + book.quantity, 0),
                uniqueTitles: books.length,
                availableBooks: books.reduce((sum, book) => {
                    const borrowed = activeLoans.filter(loan => loan.bookId === book.id).length;
                    return sum + (book.quantity - borrowed);
                }, 0),
                borrowedBooks: activeLoans.length,
                totalReaders: readers.length,
                activeReaders: new Set(activeLoans.map(loan => loan.readerId)).size,
                overdueBooks: overdueLoans.length
            };
        },

        getPopularBooks(limit = 10) {
            const books = DataStore.getAll('books');
            const loans = DataStore.getAll('loans');

            const bookStats = books.map(book => ({
                ...book,
                loanCount: loans.filter(loan => loan.bookId === book.id).length
            }));

            return bookStats.sort((a, b) => b.loanCount - a.loanCount).slice(0, limit);
        },

        getActiveReaders(limit = 10) {
            const readers = DataStore.getAll('readers');
            const loans = DataStore.getAll('loans');

            const readerStats = readers.map(reader => {
                const readerLoans = loans.filter(loan => loan.readerId === reader.id);
                const currentLoans = readerLoans.filter(loan => loan.status === 'active').length;
                const lastLoan = readerLoans.sort((a, b) =>
                    new Date(b.loanDate) - new Date(a.loanDate)
                )[0];

                return {
                    ...reader,
                    totalLoans: readerLoans.length,
                    currentLoans,
                    lastActivity: lastLoan ? lastLoan.loanDate : null
                };
            });

            return readerStats
                .filter(reader => reader.totalLoans > 0)
                .sort((a, b) => b.totalLoans - a.totalLoans)
                .slice(0, limit);
        },

        calculateMonthlyStats() {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const loans = DataStore.getAll('loans');
            const readers = DataStore.getAll('readers');
            const books = DataStore.getAll('books');

            return {
                newLoans: loans.filter(loan => new Date(loan.loanDate) >= monthStart).length,
                returns: loans.filter(loan =>
                    loan.returnDate && new Date(loan.returnDate) >= monthStart
                ).length,
                newReaders: readers.filter(reader =>
                    new Date(reader.id) >= monthStart
                ).length,
                newBooks: books.filter(book =>
                    new Date(book.id) >= monthStart
                ).length
            };
        },

        createCategoryChart() {
            const books = DataStore.getAll('books');
            const categories = {};

            books.forEach(book => {
                categories[book.category] = (categories[book.category] || 0) + book.quantity;
            });

            const total = Object.values(categories).reduce((sum, count) => sum + count, 0);

            return `
            <div class="chart">
                ${Object.entries(categories).map(([category, count]) => `
                    <div class="chart-bar">
                        <div class="chart-label">${category}</div>
                        <div class="chart-value" style="width: ${(count/total * 100)}%">
                            ${count} books (${Math.round(count/total * 100)}%)
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    createMonthlyChart() {
        const loans = DataStore.getAll('loans');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlyData = Array(12).fill(0);

        loans.forEach(loan => {
            const date = new Date(loan.loanDate);
            if (date.getFullYear() === currentYear) {
                monthlyData[date.getMonth()]++;
            }
        });

        const maxLoans = Math.max(...monthlyData);

        return `
            <div class="chart monthly-chart">
                ${monthlyData.map((count, index) => `
                    <div class="chart-bar">
                        <div class="chart-label">${monthNames[index]}</div>
                        <div class="chart-value" style="height: ${(count/maxLoans * 100)}%">
                            ${count}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getAuthorName(authorId) {
        const author = DataStore.getAll('authors').find(a => a.id === authorId);
        return author ? author.name : 'Unknown Author';
    },

    getAvailableCopies(book) {
        const activeLoans = DataStore.getAll('loans').filter(loan => 
            loan.bookId === book.id && loan.status === 'active'
        ).length;
        return book.quantity - activeLoans;
    },

    getOverdueLoans() {
        const loans = DataStore.getAll('loans');
        const today = new Date();
        return loans.filter(loan => {
            if (loan.status !== 'active') return false;
            const dueDate = new Date(loan.dueDate);
            return dueDate < today;
        });
    }
};