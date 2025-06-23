# 📋 Hướng dẫn Kiểm thử Hệ thống Quản lý Thư viện

## 🎯 Tổng quan

Hệ thống kiểm thử bao gồm 2 loại test chính:
1. **Integration Tests** (test-cases.html) - Kiểm thử tích hợp với giao diện web
2. **Unit Tests** (unit-tests.js) - Kiểm thử đơn vị cho từng module

## 🚀 Cách chạy kiểm thử

### 1. Integration Tests (Kiểm thử tích hợp)

```bash
# Mở file test-cases.html trong trình duyệt
open test-cases.html
```

**Hoặc:**
1. Mở file `test-cases.html` trong trình duyệt web
2. Nhấn nút "🚀 Chạy tất cả kiểm thử"
3. Xem kết quả chi tiết theo từng module

### 2. Unit Tests (Kiểm thử đơn vị)

**Cách 1: Chạy từ Console**
```javascript
// Mở Developer Console trong trình duyệt
// Tải file unit-tests.js và chạy:
runUnitTests();
```

**Cách 2: Include trong HTML**
```html
<script src="unit-tests.js"></script>
<script>
    // Chạy tests
    const testSuite = new UnitTestSuite();
    testSuite.runAllTests().then(results => {
        console.log('Test Results:', results);
    });
</script>
```

## 📊 Các loại Test Case

### 1. DataStore Tests
- ✅ Khởi tạo DataStore
- ✅ Tạo ID tự động
- ✅ Lưu trữ và truy xuất dữ liệu

### 2. Book Management Tests
- ✅ Thêm sách mới
- ✅ Cập nhật thông tin sách
- ✅ Xóa sách
- ✅ Validation dữ liệu sách

### 3. Reader Management Tests
- ✅ Thêm độc giả mới
- ✅ Cập nhật thông tin độc giả
- ✅ Xóa độc giả

### 4. Author Management Tests
- ✅ Thêm tác giả mới
- ✅ Cập nhật thông tin tác giả
- ✅ Xóa tác giả

### 5. Publisher Management Tests
- ✅ Thêm nhà xuất bản mới
- ✅ Cập nhật thông tin nhà xuất bản
- ✅ Xóa nhà xuất bản

### 6. Loan Management Tests
- ✅ Tạo phiếu mượn sách
- ✅ Trả sách
- ✅ Kiểm tra sách quá hạn
- ✅ Validation phiếu mượn

### 7. Statistics Tests
- ✅ Thống kê sách
- ✅ Top sách được mượn nhiều nhất
- ✅ Top độc giả tích cực nhất

### 8. UI Component Tests
- ✅ Kiểm tra module UI tồn tại
- ✅ Kiểm tra hàm tạo bảng
- ✅ Kiểm tra hàm tạo form

### 9. Integration Tests
- ✅ Quy trình mượn sách hoàn chỉnh
- ✅ Kiểm tra tính toàn vẹn dữ liệu
- ✅ Workflow từ đầu đến cuối

### 10. Performance Tests
- ✅ Kiểm tra hiệu suất với dữ liệu lớn
- ✅ Thời gian phản hồi
- ✅ Memory usage

## 🔧 Test Scenarios Chi tiết

### Scenario 1: Quy trình mượn sách hoàn chỉnh
```
1. Tạo tác giả mới
2. Tạo nhà xuất bản mới
3. Tạo sách mới (liên kết với tác giả và NXB)
4. Tạo độc giả mới
5. Tạo phiếu mượn
6. Kiểm tra thống kê
7. Trả sách
8. Kiểm tra thống kê sau khi trả
9. Validate tính toàn vẹn dữ liệu
```

### Scenario 2: Kiểm tra validation
```
1. Thêm dữ liệu hợp lệ
2. Thêm dữ liệu không hợp lệ
3. Update với ID không tồn tại
4. Kiểm tra error handling
```

### Scenario 3: Kiểm tra performance
```
1. Tạo 100 sách
2. Tạo 50 độc giả
3. Tạo 200 phiếu mượn
4. Đo thời gian thực hiện
5. Kiểm tra memory usage
```

## 📈 Kết quả mong đợi

### Pass Rate Target: ≥ 95%
- **Excellent**: 98-100%
- **Good**: 90-97%
- **Needs Improvement**: < 90%

### Performance Benchmarks
- **DataStore Operations**: < 10ms per operation
- **UI Rendering**: < 100ms
- **Large Dataset (100+ items)**: < 1000ms

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **LocalStorage không khả dụng**
   ```javascript
   // Kiểm tra localStorage
   if (typeof Storage !== "undefined") {
       // LocalStorage available
   } else {
       // No web storage support
   }
   ```

2. **Module không tồn tại**
   ```javascript
   // Kiểm tra module đã load
   if (typeof DataStore === 'undefined') {
       console.error('DataStore module not loaded');
   }
   ```

3. **Test timeout**
   ```javascript
   // Tăng timeout cho async tests
   setTimeout(() => {
       // Test code here
   }, 5000);
   ```

## 📝 Viết Test Case mới

### Template cho Unit Test:
```javascript
async testNewFeature() {
    await this.runTest('New Feature Test', () => {
        // Setup
        const testData = { /* test data */ };
        
        // Execute
        const result = SomeModule.newFeature(testData);
        
        // Assert
        this.assert(result, 'Feature should work');
        this.assertEqual(result.status, 'success', 'Should return success');
    });
}
```

### Template cho Integration Test:
```javascript
testFramework.addTest(
    "New Integration Test",
    "Description of what this test does",
    () => {
        // Test implementation
        const result = performIntegrationTest();
        return result === expectedValue;
    },
    'integration'
);
```

## 🔍 Code Coverage

### Modules được test:
- ✅ DataStore (100%)
- ✅ BookModule (95%)
- ✅ ReaderModule (95%)
- ✅ AuthorModule (95%)
- ✅ PublisherModule (95%)
- ✅ LoanModule (90%)
- ✅ UI Components (85%)
- ✅ ReportModule (80%)

### Chưa được test:
- ⚠️ Error handling edge cases
- ⚠️ Browser compatibility
- ⚠️ Mobile responsive

## 📊 Test Reports

### Tự động tạo báo cáo:
```javascript
// Chạy tests và tạo báo cáo
const testSuite = new UnitTestSuite();
const results = await testSuite.runAllTests();
const report = testSuite.generateReport();

// Xuất báo cáo
console.log(JSON.stringify(report, null, 2));
```

### Báo cáo bao gồm:
- Tổng số test cases
- Số test pass/fail
- Thời gian thực hiện
- Chi tiết lỗi
- Performance metrics

## 🎯 Best Practices

### 1. Viết test trước khi code (TDD)
```javascript
// 1. Viết test
test('should add book', () => {
    const book = addBook(bookData);
    expect(book.id).toBeDefined();
});

// 2. Implement feature
function addBook(data) {
    // Implementation
}
```

### 2. Test isolation
```javascript
// Mỗi test phải độc lập
beforeEach(() => {
    // Setup clean state
    clearAllData();
});
```

### 3. Meaningful test names
```javascript
// ❌ Bad
test('test1', () => {});

// ✅ Good
test('should create book with valid data', () => {});
```

### 4. Test edge cases
```javascript
// Test với dữ liệu biên
test('should handle empty string', () => {});
test('should handle null values', () => {});
test('should handle large datasets', () => {});
```

## 🚀 Continuous Integration

### Tự động chạy tests:
```bash
# Script để chạy tất cả tests
npm run test

# Hoặc với custom script
node run-tests.js
```

### Integration với CI/CD:
```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: npm test
```

## 📞 Hỗ trợ

Nếu gặp vấn đề với việc chạy tests:
1. Kiểm tra console log để xem lỗi chi tiết
2. Đảm bảo tất cả file dependencies đã được load
3. Kiểm tra browser compatibility
4. Clear localStorage nếu cần thiết

---

**Lưu ý**: Luôn chạy tests trước khi deploy production để đảm bảo chất lượng code!
