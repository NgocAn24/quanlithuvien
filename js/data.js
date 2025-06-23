// Data Models and Storage Management
const DataStore = {
    // Initialize storage with default data if empty
    init() {
        // Initialize counters for auto-incrementing IDs
        if (!localStorage.getItem('library_counters')) {
            localStorage.setItem('library_counters', JSON.stringify({
                books: 1,
                readers: 1,
                authors: 1,
                publishers: 1,
                loans: 1
            }));
        }

        if (!localStorage.getItem('library_books')) {
            localStorage.setItem('library_books', JSON.stringify([]));
        }
        if (!localStorage.getItem('library_readers')) {
            localStorage.setItem('library_readers', JSON.stringify([]));
        }
        if (!localStorage.getItem('library_authors')) {
            localStorage.setItem('library_authors', JSON.stringify([]));
        }
        if (!localStorage.getItem('library_publishers')) {
            localStorage.setItem('library_publishers', JSON.stringify([]));
        }
        if (!localStorage.getItem('library_loans')) {
            localStorage.setItem('library_loans', JSON.stringify([]));
        }
        if (!localStorage.getItem('library_categories')) {
            localStorage.setItem('library_categories', JSON.stringify([
                'Khoa học', 'Lịch sử', 'Công nghệ', 'Tiểu thuyết', 'Văn học'
            ]));
        }
    },

    getNextId(entity) {
        const counters = JSON.parse(localStorage.getItem('library_counters'));
        const currentId = counters[entity];
        counters[entity] = currentId + 1;
        localStorage.setItem('library_counters', JSON.stringify(counters));
        return `${entity[0].toUpperCase()}${currentId.toString().padStart(4, '0')}`;
    },

    // Generic CRUD operations
    getAll(entity) {
        return JSON.parse(localStorage.getItem(`library_${entity}`)) || [];
    },

    save(entity, data) {
        localStorage.setItem(`library_${entity}`, JSON.stringify(data));
    },

    getCategories() {
        return JSON.parse(localStorage.getItem('library_categories')) || [
            'Khoa học', 'Lịch sử', 'Công nghệ', 'Tiểu thuyết', 'Văn học'
        ];
    },

    // Book operations
    addBook(book) {
        const books = this.getAll('books');
        book.id = this.getNextId('books');
        book.status = 'available';
        book.createdAt = new Date().toISOString();
        books.push(book);
        this.save('books', books);
        return book;
    },

    updateBook(bookId, updatedBook) {
        const books = this.getAll('books');
        const index = books.findIndex(book => book.id === bookId);
        if (index !== -1) {
            books[index] = {...books[index], ...updatedBook };
            this.save('books', books);
            return true;
        }
        return false;
    },

    deleteBook(bookId) {
        const books = this.getAll('books').filter(book => book.id !== bookId);
        this.save('books', books);
    },

    // Reader operations
    addReader(reader) {
        const readers = this.getAll('readers');
        reader.id = this.getNextId('readers');
        reader.createdAt = new Date().toISOString();
        readers.push(reader);
        this.save('readers', readers);
        return reader;
    },

    updateReader(readerId, updatedReader) {
        const readers = this.getAll('readers');
        const index = readers.findIndex(reader => reader.id === readerId);
        if (index !== -1) {
            readers[index] = {...readers[index], ...updatedReader };
            this.save('readers', readers);
            return true;
        }
        return false;
    },

    deleteReader(readerId) {
        const readers = this.getAll('readers').filter(reader => reader.id !== readerId);
        this.save('readers', readers);
    },

    // Author operations
    addAuthor(author) {
        const authors = this.getAll('authors');
        author.id = this.getNextId('authors');
        author.createdAt = new Date().toISOString();
        authors.push(author);
        this.save('authors', authors);
        return author;
    },

    updateAuthor(authorId, updatedAuthor) {
        const authors = this.getAll('authors');
        const index = authors.findIndex(author => author.id === authorId);
        if (index !== -1) {
            authors[index] = {...authors[index], ...updatedAuthor };
            this.save('authors', authors);
            return true;
        }
        return false;
    },

    deleteAuthor(authorId) {
        const authors = this.getAll('authors').filter(author => author.id !== authorId);
        this.save('authors', authors);
    },

    // Publisher operations
    addPublisher(publisher) {
        const publishers = this.getAll('publishers');
        publisher.id = this.getNextId('publishers');
        publisher.createdAt = new Date().toISOString();
        publishers.push(publisher);
        this.save('publishers', publishers);
        return publisher;
    },

    updatePublisher(publisherId, updatedPublisher) {
        const publishers = this.getAll('publishers');
        const index = publishers.findIndex(publisher => publisher.id === publisherId);
        if (index !== -1) {
            publishers[index] = {...publishers[index], ...updatedPublisher };
            this.save('publishers', publishers);
            return true;
        }
        return false;
    },

    deletePublisher(publisherId) {
        const publishers = this.getAll('publishers').filter(publisher => publisher.id !== publisherId);
        this.save('publishers', publishers);
    },

    // Loan operations
    addLoan(loan) {
        const loans = this.getAll('loans');
        loan.id = this.getNextId('loans');
        loan.status = 'active';
        loan.loanDate = new Date().toISOString();
        loan.createdAt = new Date().toISOString();
        loans.push(loan);
        this.save('loans', loans);
        return loan;
    },

    returnBook(loanId) {
        const loans = this.getAll('loans');
        const index = loans.findIndex(loan => loan.id === loanId);
        if (index !== -1) {
            loans[index].status = 'returned';
            loans[index].returnDate = new Date().toISOString();
            this.save('loans', loans);
            return true;
        }
        return false;
    },

    getOverdueLoans() {
        const loans = this.getAll('loans');
        const today = new Date();
        return loans.filter(loan => {
            if (loan.status !== 'active') return false;
            const dueDate = new Date(loan.dueDate);
            return dueDate < today;
        });
    },

    // Statistics
    getBookStats() {
        const books = this.getAll('books');
        const loans = this.getAll('loans');
        const activeLoans = loans.filter(loan => loan.status === 'active');

        return {
            totalBooks: books.reduce((sum, book) => sum + book.quantity, 0),
            availableBooks: books.reduce((sum, book) => {
                const borrowed = activeLoans.filter(loan => loan.bookId === book.id).length;
                return sum + (book.quantity - borrowed);
            }, 0),
            totalTitles: books.length
        };
    },

    getMostBorrowedBooks(limit = 5) {
        const books = this.getAll('books');
        const loans = this.getAll('loans');

        const loanCounts = books.map(book => ({
            ...book,
            loanCount: loans.filter(loan => loan.bookId === book.id).length
        }));

        return loanCounts.sort((a, b) => b.loanCount - a.loanCount).slice(0, limit);
    },

    getTopReaders(limit = 5) {
        const readers = this.getAll('readers');
        const loans = this.getAll('loans');

        const readerStats = readers.map(reader => ({
            ...reader,
            loanCount: loans.filter(loan => loan.readerId === reader.id).length
        }));

        return readerStats.sort((a, b) => b.loanCount - a.loanCount).slice(0, limit);
    }
};

// Initialize data store when the script loads
DataStore.init();