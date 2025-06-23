/**
 * Unit Tests cho Hệ thống Quản lý Thư viện
 * Tệp này chứa các test case chi tiết cho từng module
 */

class UnitTestSuite {
    constructor() {
        this.testResults = [];
        this.setupCount = 0;
        this.teardownCount = 0;
    }

    // Helper methods
    setup() {
        this.setupCount++;
        // Backup current data
        this.backupData = {
            books: localStorage.getItem('library_books'),
            readers: localStorage.getItem('library_readers'),
            authors: localStorage.getItem('library_authors'),
            publishers: localStorage.getItem('library_publishers'),
            loans: localStorage.getItem('library_loans'),
            counters: localStorage.getItem('library_counters')
        };

        // Clear and reinitialize
        localStorage.clear();
        DataStore.init();
    }

    teardown() {
        this.teardownCount++;
        // Restore backup data
        if (this.backupData) {
            Object.keys(this.backupData).forEach(key => {
                if (this.backupData[key]) {
                    localStorage.setItem(`library_${key}`, this.backupData[key]);
                }
            });
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}: Expected ${expected}, got ${actual}`);
        }
    }

    assertNotEqual(actual, unexpected, message) {
        if (actual === unexpected) {
            throw new Error(`${message}: Expected not to be ${unexpected}, but got ${actual}`);
        }
    }

    assertArrayEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}: Arrays are not equal`);
        }
    }

    assertContains(array, item, message) {
        if (!array.includes(item)) {
            throw new Error(`${message}: Array does not contain ${item}`);
        }
    }

    async runTest(testName, testFunction) {
        try {
            this.setup();
            await testFunction();
            this.testResults.push({ name: testName, status: 'PASS', error: null });
            console.log(`✅ ${testName}: PASS`);
        } catch (error) {
            this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
            console.error(`❌ ${testName}: FAIL - ${error.message}`);
        } finally {
            this.teardown();
        }
    }

    // DataStore Tests
    async testDataStoreInitialization() {
        await this.runTest('DataStore Initialization', () => {
            DataStore.init();

            // Kiểm tra các collection được khởi tạo
            this.assert(Array.isArray(DataStore.getAll('books')), 'Books collection should be array');
            this.assert(Array.isArray(DataStore.getAll('readers')), 'Readers collection should be array');
            this.assert(Array.isArray(DataStore.getAll('authors')), 'Authors collection should be array');
            this.assert(Array.isArray(DataStore.getAll('publishers')), 'Publishers collection should be array');
            this.assert(Array.isArray(DataStore.getAll('loans')), 'Loans collection should be array');

            // Kiểm tra categories
            const categories = DataStore.getCategories();
            this.assert(Array.isArray(categories), 'Categories should be array');
            this.assert(categories.length > 0, 'Categories should not be empty');

            // Kiểm tra counters
            const counters = JSON.parse(localStorage.getItem('library_counters'));
            this.assert(counters !== null, 'Counters should be initialized');
            this.assert(typeof counters.books === 'number', 'Book counter should be number');
        });
    }

    async testIdGeneration() {
        await this.runTest('ID Generation', () => {
            // Test tạo ID cho books
            const bookId1 = DataStore.getNextId('books');
            const bookId2 = DataStore.getNextId('books');

            this.assert(bookId1.startsWith('B'), 'Book ID should start with B');
            this.assert(bookId1.length === 5, 'Book ID should be 5 characters');
            this.assertNotEqual(bookId1, bookId2, 'Sequential IDs should be different');

            // Test tạo ID cho readers
            const readerId = DataStore.getNextId('readers');
            this.assert(readerId.startsWith('R'), 'Reader ID should start with R');

            // Test tạo ID cho authors
            const authorId = DataStore.getNextId('authors');
            this.assert(authorId.startsWith('A'), 'Author ID should start with A');

            // Test tạo ID cho publishers
            const publisherId = DataStore.getNextId('publishers');
            this.assert(publisherId.startsWith('P'), 'Publisher ID should start with P');

            // Test tạo ID cho loans
            const loanId = DataStore.getNextId('loans');
            this.assert(loanId.startsWith('L'), 'Loan ID should start with L');
        });
    }

    // Book Management Tests
    async testBookCRUD() {
        await this.runTest('Book CRUD Operations', () => {
            // Create
            const bookData = {
                title: 'Test Book',
                authorId: 'A0001',
                category: 'Khoa học',
                publisherId: 'P0001',
                quantity: 5,
                location: 'Kệ A1'
            };

            const createdBook = DataStore.addBook(bookData);
            this.assert(createdBook.id, 'Created book should have ID');
            this.assertEqual(createdBook.title, bookData.title, 'Book title should match');
            this.assertEqual(createdBook.status, 'available', 'New book should be available');
            this.assert(createdBook.createdAt, 'Book should have creation timestamp');

            // Read
            const books = DataStore.getAll('books');
            this.assertEqual(books.length, 1, 'Should have one book');
            this.assertEqual(books[0].id, createdBook.id, 'Retrieved book should match created book');

            // Update
            const updateData = { title: 'Updated Book Title', quantity: 10 };
            const updateResult = DataStore.updateBook(createdBook.id, updateData);
            this.assert(updateResult, 'Update should return true');

            const updatedBooks = DataStore.getAll('books');
            const updatedBook = updatedBooks.find(b => b.id === createdBook.id);
            this.assertEqual(updatedBook.title, updateData.title, 'Book title should be updated');
            this.assertEqual(updatedBook.quantity, updateData.quantity, 'Book quantity should be updated');

            // Delete
            DataStore.deleteBook(createdBook.id);
            const booksAfterDelete = DataStore.getAll('books');
            this.assertEqual(booksAfterDelete.length, 0, 'Should have no books after deletion');
        });
    }

    async testBookValidation() {
        await this.runTest('Book Validation', () => {
            // Test với dữ liệu hợp lệ
            const validBook = {
                title: 'Valid Book',
                authorId: 'A0001',
                category: 'Khoa học',
                publisherId: 'P0001',
                quantity: 5,
                location: 'Kệ A1'
            };

            const book = DataStore.addBook(validBook);
            this.assert(book.id, 'Valid book should be created');

            // Test update với ID không tồn tại
            const invalidUpdateResult = DataStore.updateBook('INVALID_ID', { title: 'New Title' });
            this.assertEqual(invalidUpdateResult, false, 'Update with invalid ID should return false');
        });
    }

    // Reader Management Tests
    async testReaderCRUD() {
        await this.runTest('Reader CRUD Operations', () => {
            // Create
            const readerData = {
                name: 'Test Reader',
                email: 'test@example.com',
                phone: '0123456789',
                address: 'Test Address'
            };

            const createdReader = DataStore.addReader(readerData);
            this.assert(createdReader.id, 'Created reader should have ID');
            this.assertEqual(createdReader.name, readerData.name, 'Reader name should match');
            this.assert(createdReader.createdAt, 'Reader should have creation timestamp');

            // Read
            const readers = DataStore.getAll('readers');
            this.assertEqual(readers.length, 1, 'Should have one reader');

            // Update
            const updateData = { name: 'Updated Reader Name', phone: '0987654321' };
            const updateResult = DataStore.updateReader(createdReader.id, updateData);
            this.assert(updateResult, 'Update should return true');

            const updatedReaders = DataStore.getAll('readers');
            const updatedReader = updatedReaders.find(r => r.id === createdReader.id);
            this.assertEqual(updatedReader.name, updateData.name, 'Reader name should be updated');
            this.assertEqual(updatedReader.phone, updateData.phone, 'Reader phone should be updated');

            // Delete
            DataStore.deleteReader(createdReader.id);
            const readersAfterDelete = DataStore.getAll('readers');
            this.assertEqual(readersAfterDelete.length, 0, 'Should have no readers after deletion');
        });
    }

    // Author Management Tests
    async testAuthorCRUD() {
        await this.runTest('Author CRUD Operations', () => {
            // Create
            const authorData = {
                name: 'Test Author',
                bio: 'Test biography'
            };

            const createdAuthor = DataStore.addAuthor(authorData);
            this.assert(createdAuthor.id, 'Created author should have ID');
            this.assertEqual(createdAuthor.name, authorData.name, 'Author name should match');

            // Read
            const authors = DataStore.getAll('authors');
            this.assertEqual(authors.length, 1, 'Should have one author');

            // Update
            const updateData = { name: 'Updated Author Name', bio: 'Updated biography' };
            const updateResult = DataStore.updateAuthor(createdAuthor.id, updateData);
            this.assert(updateResult, 'Update should return true');

            // Delete
            DataStore.deleteAuthor(createdAuthor.id);
            const authorsAfterDelete = DataStore.getAll('authors');
            this.assertEqual(authorsAfterDelete.length, 0, 'Should have no authors after deletion');
        });
    }

    // Publisher Management Tests
    async testPublisherCRUD() {
        await this.runTest('Publisher CRUD Operations', () => {
            // Create
            const publisherData = {
                name: 'Test Publisher',
                phone: '0123456789',
                email: 'publisher@example.com',
                address: 'Publisher Address'
            };

            const createdPublisher = DataStore.addPublisher(publisherData);
            this.assert(createdPublisher.id, 'Created publisher should have ID');
            this.assertEqual(createdPublisher.name, publisherData.name, 'Publisher name should match');

            // Read
            const publishers = DataStore.getAll('publishers');
            this.assertEqual(publishers.length, 1, 'Should have one publisher');

            // Update
            const updateData = { name: 'Updated Publisher Name' };
            const updateResult = DataStore.updatePublisher(createdPublisher.id, updateData);
            this.assert(updateResult, 'Update should return true');

            // Delete
            DataStore.deletePublisher(createdPublisher.id);
            const publishersAfterDelete = DataStore.getAll('publishers');
            this.assertEqual(publishersAfterDelete.length, 0, 'Should have no publishers after deletion');
        });
    }

    // Loan Management Tests
    async testLoanManagement() {
        await this.runTest('Loan Management', () => {
            // Tạo dữ liệu cần thiết
            const author = DataStore.addAuthor({ name: 'Test Author', bio: 'Bio' });
            const publisher = DataStore.addPublisher({
                name: 'Test Publisher',
                phone: '123',
                email: 'pub@test.com',
                address: 'Address'
            });
            const book = DataStore.addBook({
                title: 'Test Book',
                authorId: author.id,
                category: 'Khoa học',
                publisherId: publisher.id,
                quantity: 5,
                location: 'Kệ A1'
            });
            const reader = DataStore.addReader({
                name: 'Test Reader',
                email: 'reader@test.com',
                phone: '123',
                address: 'Address'
            });

            // Create loan
            const loanData = {
                bookId: book.id,
                readerId: reader.id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            };

            const createdLoan = DataStore.addLoan(loanData);
            this.assert(createdLoan.id, 'Created loan should have ID');
            this.assertEqual(createdLoan.status, 'active', 'New loan should be active');
            this.assert(createdLoan.loanDate, 'Loan should have loan date');

            // Return book
            const returnResult = DataStore.returnBook(createdLoan.id);
            this.assert(returnResult, 'Return should be successful');

            const loans = DataStore.getAll('loans');
            const returnedLoan = loans.find(l => l.id === createdLoan.id);
            this.assertEqual(returnedLoan.status, 'returned', 'Loan should be marked as returned');
            this.assert(returnedLoan.returnDate, 'Returned loan should have return date');
        });
    }

    async testOverdueLoans() {
        await this.runTest('Overdue Loans Detection', () => {
            // Tạo dữ liệu cần thiết
            const author = DataStore.addAuthor({ name: 'Test Author', bio: 'Bio' });
            const publisher = DataStore.addPublisher({
                name: 'Test Publisher',
                phone: '123',
                email: 'pub@test.com',
                address: 'Address'
            });
            const book = DataStore.addBook({
                title: 'Test Book',
                authorId: author.id,
                category: 'Khoa học',
                publisherId: publisher.id,
                quantity: 5,
                location: 'Kệ A1'
            });
            const reader = DataStore.addReader({
                name: 'Test Reader',
                email: 'reader@test.com',
                phone: '123',
                address: 'Address'
            });

            // Tạo loan quá hạn
            const overdueLoan = {
                bookId: book.id,
                readerId: reader.id,
                dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 ngày trước
            };

            DataStore.addLoan(overdueLoan);

            // Tạo loan chưa quá hạn
            const normalLoan = {
                bookId: book.id,
                readerId: reader.id,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 ngày sau
            };

            DataStore.addLoan(normalLoan);

            const overdueLoans = DataStore.getOverdueLoans();
            this.assertEqual(overdueLoans.length, 1, 'Should have one overdue loan');
            this.assertEqual(overdueLoans[0].status, 'active', 'Overdue loan should be active');
        });
    }

    // Statistics Tests
    async testBookStatistics() {
        await this.runTest('Book Statistics', () => {
            // Tạo dữ liệu test
            const author = DataStore.addAuthor({ name: 'Test Author', bio: 'Bio' });
            const publisher = DataStore.addPublisher({
                name: 'Test Publisher',
                phone: '123',
                email: 'pub@test.com',
                address: 'Address'
            });

            // Tạo 2 sách
            const book1 = DataStore.addBook({
                title: 'Book 1',
                authorId: author.id,
                category: 'Khoa học',
                publisherId: publisher.id,
                quantity: 5,
                location: 'Kệ A1'
            });

            const book2 = DataStore.addBook({
                title: 'Book 2',
                authorId: author.id,
                category: 'Lịch sử',
                publisherId: publisher.id,
                quantity: 3,
                location: 'Kệ B1'
            });

            const reader = DataStore.addReader({
                name: 'Test Reader',
                email: 'reader@test.com',
                phone: '123',
                address: 'Address'
            });

            // Tạo 1 loan
            DataStore.addLoan({
                bookId: book1.id,
                readerId: reader.id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            });

            const stats = DataStore.getBookStats();
            this.assertEqual(stats.totalBooks, 8, 'Total books should be 8 (5+3)');
            this.assertEqual(stats.availableBooks, 7, 'Available books should be 7 (8-1 borrowed)');
            this.assertEqual(stats.totalTitles, 2, 'Total titles should be 2');
        });
    }

    async testMostBorrowedBooks() {
        await this.runTest('Most Borrowed Books', () => {
            // Tạo dữ liệu test
            const author = DataStore.addAuthor({ name: 'Test Author', bio: 'Bio' });
            const publisher = DataStore.addPublisher({
                name: 'Test Publisher',
                phone: '123',
                email: 'pub@test.com',
                address: 'Address'
            });

            const book1 = DataStore.addBook({
                title: 'Popular Book',
                authorId: author.id,
                category: 'Khoa học',
                publisherId: publisher.id,
                quantity: 5,
                location: 'Kệ A1'
            });

            const book2 = DataStore.addBook({
                title: 'Less Popular Book',
                authorId: author.id,
                category: 'Lịch sử',
                publisherId: publisher.id,
                quantity: 3,
                location: 'Kệ B1'
            });

            const reader = DataStore.addReader({
                name: 'Test Reader',
                email: 'reader@test.com',
                phone: '123',
                address: 'Address'
            });

            // Tạo nhiều loan cho book1
            for (let i = 0; i < 3; i++) {
                DataStore.addLoan({
                    bookId: book1.id,
                    readerId: reader.id,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                });
            }

            // Tạo 1 loan cho book2
            DataStore.addLoan({
                bookId: book2.id,
                readerId: reader.id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            });

            const mostBorrowed = DataStore.getMostBorrowedBooks(5);
            this.assert(Array.isArray(mostBorrowed), 'Result should be array');
            this.assertEqual(mostBorrowed.length, 2, 'Should have 2 books');
            this.assertEqual(mostBorrowed[0].id, book1.id, 'Most borrowed should be book1');
            this.assertEqual(mostBorrowed[0].loanCount, 3, 'Book1 should have 3 loans');
            this.assertEqual(mostBorrowed[1].loanCount, 1, 'Book2 should have 1 loan');
        });
    }

    async testTopReaders() {
        await this.runTest('Top Readers', () => {
            // Tạo dữ liệu test
            const author = DataStore.addAuthor({ name: 'Test Author', bio: 'Bio' });
            const publisher = DataStore.addPublisher({
                name: 'Test Publisher',
                phone: '123',
                email: 'pub@test.com',
                address: 'Address'
            });
            const book = DataStore.addBook({
                title: 'Test Book',
                authorId: author.id,
                category: 'Khoa học',
                publisherId: publisher.id,
                quantity: 10,
                location: 'Kệ A1'
            });

            const reader1 = DataStore.addReader({
                name: 'Active Reader',
                email: 'active@test.com',
                phone: '123',
                address: 'Address'
            });

            const reader2 = DataStore.addReader({
                name: 'Less Active Reader',
                email: 'less@test.com',
                phone: '456',
                address: 'Address'
            });

            // Tạo nhiều loan cho reader1
            for (let i = 0; i < 5; i++) {
                DataStore.addLoan({
                    bookId: book.id,
                    readerId: reader1.id,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                });
            }

            // Tạo ít loan cho reader2
            for (let i = 0; i < 2; i++) {
                DataStore.addLoan({
                    bookId: book.id,
                    readerId: reader2.id,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                });
            }

            const topReaders = DataStore.getTopReaders(5);
            this.assert(Array.isArray(topReaders), 'Result should be array');
            this.assertEqual(topReaders.length, 2, 'Should have 2 readers');
            this.assertEqual(topReaders[0].id, reader1.id, 'Top reader should be reader1');
            this.assertEqual(topReaders[0].loanCount, 5, 'Reader1 should have 5 loans');
            this.assertEqual(topReaders[1].loanCount, 2, 'Reader2 should have 2 loans');
        });
    }

    // Integration Tests
    async testCompleteWorkflow() {
        await this.runTest('Complete Library Workflow', () => {
            // 1. Tạo tác giả
            const author = DataStore.addAuthor({
                name: 'Nguyễn Văn A',
                bio: 'Tác giả nổi tiếng'
            });

            // 2. Tạo nhà xuất bản
            const publisher = DataStore.addPublisher({
                name: 'NXB Test',
                phone: '0123456789',
                email: 'nxb@test.com',
                address: 'Hà Nội'
            });

            // 3. Tạo sách
            const book = DataStore.addBook({
                title: 'Sách hay',
                authorId: author.id,
                category: 'Văn học',
                publisherId: publisher.id,
                quantity: 10,
                location: 'Kệ A1'
            });

            // 4. Tạo độc giả
            const reader = DataStore.addReader({
                name: 'Trần Thị B',
                email: 'reader@test.com',
                phone: '0987654321',
                address: 'TP.HCM'
            });

            // 5. Tạo phiếu mượn
            const loan = DataStore.addLoan({
                bookId: book.id,
                readerId: reader.id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            });

            // 6. Kiểm tra thống kê
            const stats = DataStore.getBookStats();
            this.assertEqual(stats.totalBooks, 10, 'Should have 10 total books');
            this.assertEqual(stats.availableBooks, 9, 'Should have 9 available books');

            // 7. Trả sách
            const returnResult = DataStore.returnBook(loan.id);
            this.assert(returnResult, 'Book return should be successful');

            // 8. Kiểm tra thống kê sau khi trả
            const statsAfterReturn = DataStore.getBookStats();
            this.assertEqual(statsAfterReturn.availableBooks, 10, 'Should have 10 available books after return');

            // 9. Kiểm tra tính toàn vẹn dữ liệu
            const allBooks = DataStore.getAll('books');
            const allAuthors = DataStore.getAll('authors');
            const allPublishers = DataStore.getAll('publishers');
            const allReaders = DataStore.getAll('readers');
            const allLoans = DataStore.getAll('loans');

            this.assertEqual(allBooks.length, 1, 'Should have 1 book');
            this.assertEqual(allAuthors.length, 1, 'Should have 1 author');
            this.assertEqual(allPublishers.length, 1, 'Should have 1 publisher');
            this.assertEqual(allReaders.length, 1, 'Should have 1 reader');
            this.assertEqual(allLoans.length, 1, 'Should have 1 loan');

            // Kiểm tra liên kết dữ liệu
            this.assertEqual(allBooks[0].authorId, author.id, 'Book should link to correct author');
            this.assertEqual(allBooks[0].publisherId, publisher.id, 'Book should link to correct publisher');
            this.assertEqual(allLoans[0].bookId, book.id, 'Loan should link to correct book');
            this.assertEqual(allLoans[0].readerId, reader.id, 'Loan should link to correct reader');
        });
    }

    // Performance Tests
    async testPerformance() {
        await this.runTest('Performance Test', () => {
            const startTime = performance.now();

            // Tạo nhiều dữ liệu
            const author = DataStore.addAuthor({ name: 'Test Author', bio: 'Bio' });
            const publisher = DataStore.addPublisher({
                name: 'Test Publisher',
                phone: '123',
                email: 'pub@test.com',
                address: 'Address'
            });

            // Tạo 100 sách
            for (let i = 0; i < 100; i++) {
                DataStore.addBook({
                    title: `Book ${i}`,
                    authorId: author.id,
                    category: 'Khoa học',
                    publisherId: publisher.id,
                    quantity: 5,
                    location: `Kệ ${i}`
                });
            }

            // Tạo 50 độc giả
            for (let i = 0; i < 50; i++) {
                DataStore.addReader({
                    name: `Reader ${i}`,
                    email: `reader${i}@test.com`,
                    phone: `012345678${i}`,
                    address: `Address ${i}`
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`Performance test completed in ${duration.toFixed(2)}ms`);

            // Kiểm tra dữ liệu được tạo đúng
            const books = DataStore.getAll('books');
            const readers = DataStore.getAll('readers');

            this.assertEqual(books.length, 100, 'Should have 100 books');
            this.assertEqual(readers.length, 50, 'Should have 50 readers');

            // Performance should be reasonable (under 1 second for this amount of data)
            this.assert(duration < 1000, `Performance test should complete under 1000ms, took ${duration.toFixed(2)}ms`);
        });
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Unit Tests...\n');

        const startTime = performance.now();

        // DataStore Tests
        await this.testDataStoreInitialization();
        await this.testIdGeneration();

        // CRUD Tests
        await this.testBookCRUD();
        await this.testBookValidation();
        await this.testReaderCRUD();
        await this.testAuthorCRUD();
        await this.testPublisherCRUD();

        // Loan Tests
        await this.testLoanManagement();
        await this.testOverdueLoans();

        // Statistics Tests
        await this.testBookStatistics();
        await this.testMostBorrowedBooks();
        await this.testTopReaders();

        // Integration Tests
        await this.testCompleteWorkflow();

        // Performance Tests
        await this.testPerformance();

        const endTime = performance.now();
        const totalDuration = endTime - startTime;

        // Print summary
        console.log('\n📊 Test Summary:');
        console.log('================');

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        const passRate = ((passed / total) * 100).toFixed(1);

        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Pass Rate: ${passRate}%`);
        console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
        console.log(`Setup/Teardown calls: ${this.setupCount}/${this.teardownCount}`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
                console.log(`  - ${test.name}: ${test.error}`);
            });
        }

        console.log('\n🎉 Unit tests completed!');

        return {
            total,
            passed,
            failed,
            passRate: parseFloat(passRate),
            duration: totalDuration
        };
    }

    // Generate test report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.status === 'PASS').length,
                failed: this.testResults.filter(r => r.status === 'FAIL').length
            },
            tests: this.testResults,
            setupTeardownCalls: {
                setup: this.setupCount,
                teardown: this.teardownCount
            }
        };

        return report;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitTestSuite;
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    window.UnitTestSuite = UnitTestSuite;

    // Add a function to run tests from console
    window.runUnitTests = async function() {
        const testSuite = new UnitTestSuite();
        return await testSuite.runAllTests();
    };

    console.log('Unit Test Suite loaded. Run tests with: runUnitTests()');
}