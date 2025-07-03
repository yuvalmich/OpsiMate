# Test Documentation

This document describes the testing setup and how to run tests for the Service Peek Dashboard server.

## Test Structure

The project uses integration tests written in JavaScript to test the API endpoints and verify database state. The tests follow a simple pattern of making HTTP requests to the running server and verifying both the API responses and the database state.

## Available Tests

### 1. Tag Controller Tests (`test-tags.js`)

A comprehensive test that covers all tags API endpoints and verifies database state:

**API Endpoints Tested:**
- **GET /api/v1/tags** - Get all tags
- **GET /api/v1/tags/:id** - Get tag by ID
- **POST /api/v1/tags** - Create new tag
- **PUT /api/v1/tags/:id** - Update tag
- **DELETE /api/v1/tags/:id** - Delete tag
- **POST /api/v1/tags/service** - Add tag to service
- **DELETE /api/v1/tags/service** - Remove tag from service
- **GET /api/v1/tags/service/:serviceId** - Get tags for a service

**Database Verification:**
- ✅ Verifies tags are created in database
- ✅ Verifies tags are updated in database
- ✅ Verifies tags are deleted from database
- ✅ Verifies service-tag associations are stored
- ✅ Verifies service-tag associations are removed
- ✅ Verifies database state after each operation

**Test Coverage:**
- ✅ All CRUD operations for tags
- ✅ Service-tag associations
- ✅ Validation error handling (400 errors)
- ✅ Not found error handling (404 errors)
- ✅ Database state verification
- ✅ Data integrity checks

### 2. Integration Tests (`test-integration.js`)

Tests the overall system integration including providers and services.

## Running Tests

### Prerequisites

1. Make sure the server is running:
   ```bash
   npm run dev
   ```

2. The server should be accessible at `http://localhost:3001`

### Running Individual Tests

```bash
# Test tag controller endpoints and database state
npm run test:tags

# Test integration (providers, services)
npm run test:integration
```

### Running All Tests

```bash
npm run test:all
```

## Test Output

Tests provide detailed console output showing:

- ✅ Success indicators for each test step
- ❌ Failure indicators with error details
- 📊 Test data and responses
- 🗄️ Database state verification
- 🧹 Cleanup operations

## Example Test Output

```
Testing Tags Controller...

1. Getting all tags (initial state)...
Initial tags: { success: true, data: [] }
✅ Initial tags retrieved successfully - database is empty

2. Creating a new tag...
Tag created: { success: true, data: { id: 1, name: 'Production', color: '#EF4444', createdAt: '2025-07-03 06:16:29' }, message: 'Tag created successfully' }
✅ Tag created successfully

2a. Verifying tag exists in database...
✅ Tag verified in database

3. Getting all tags (after creation)...
Tags after creation: { success: true, data: [{ id: 1, name: 'Production', color: '#EF4444', createdAt: '2025-07-03 06:16:29' }] }
✅ Tags retrieved successfully after creation - database contains 1 tag

...

✅ All tags controller tests completed successfully!
```

## Test Data

The tests create and clean up their own data:

- **Tags**: Created with test names and colors
- **Services**: Created for association testing (if providers exist)
- **Cleanup**: All test data is removed after tests complete
- **Verification**: Database state is verified after each operation

## Error Handling

Tests verify proper error handling:

- **Validation errors** (400) - Invalid input data (missing name, invalid color)
- **Not found errors** (404) - Non-existent resources
- **Server errors** (500) - Internal server issues
- **Database constraints** - Unique name violations

## Database State Verification

The test includes comprehensive database state verification:

1. **After Creation**: Verifies tag exists in database
2. **After Update**: Verifies tag data is updated in database
3. **After Association**: Verifies service-tag relationship is stored
4. **After Removal**: Verifies service-tag relationship is removed
5. **After Deletion**: Verifies tag no longer exists in database
6. **Final State**: Verifies database is clean after tests

## Adding New Tests

To add new tests:

1. Create a new JavaScript file following the existing pattern
2. Use axios for HTTP requests
3. Include database state verification after each operation
4. Include proper error handling
5. Add cleanup operations
6. Add the test script to package.json
7. Update this documentation

## Troubleshooting

### Common Issues

1. **Server not running**: Make sure `npm run dev` is running
2. **Database locked**: Close any other processes using the database
3. **Port conflicts**: Ensure port 3001 is available
4. **Missing dependencies**: Run `npm install` if needed

### Debug Mode

To run tests with more verbose output, you can modify the test files to include additional logging or use Node.js debug flags:

```bash
node --inspect test-tags.js
```

## Test Coverage

The current test suite covers:

- ✅ All CRUD operations
- ✅ Input validation
- ✅ Error scenarios
- ✅ Data relationships
- ✅ API response formats
- ✅ Database state verification
- ✅ Data integrity checks

## Future Improvements

Consider adding:

- Unit tests with Jest/Vitest
- Test database isolation
- Automated test runs
- Coverage reporting
- Performance testing
- Load testing for concurrent operations 