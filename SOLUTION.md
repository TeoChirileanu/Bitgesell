# Solution Documentation

## Project Overview

This project involved refactoring, optimizing, and fixing issues in a full-stack web application built with Node.js (backend) and React (frontend). The application displays a list of items with details, statistics, and allows for searching and pagination.

## Approach and Implementation

### Backend (Node.js)

#### 1. Refactoring Blocking I/O

**Approach:**
- Replaced synchronous file operations with asynchronous alternatives
- Implemented proper error handling for async operations

**Implementation Details:**
- Changed `fs.readFileSync` to `fs.promises.readFile` in items.js
- Used async/await pattern for cleaner code and better error handling
- Created a reusable `readData()` utility function

**Reasoning:**
- Synchronous file operations block the event loop, reducing server throughput
- Async operations allow the server to handle other requests while waiting for I/O
- Better scalability for higher traffic loads

**Tradeoffs:**
- Slightly more complex code with promises/async-await
- Had to ensure proper error handling throughout the promise chain

#### 2. Performance Optimization for Stats

**Approach:**
- Implemented an in-memory cache for stats
- Added file modification time checking to invalidate cache when data changes

**Implementation Details:**
- Created module-level variables to store cache and last modified timestamp
- Added a utility function to get file modification time
- Only recalculated stats when cache is empty or file has changed

**Reasoning:**
- Stats calculation involves reading the entire data file and performing calculations
- Caching avoids redundant calculations for frequent requests
- File modification time checking ensures data consistency

**Tradeoffs:**
- Memory usage increases slightly due to caching
- Potential for stale data if multiple processes modify the file
- Simple approach that works well for single-instance deployments

#### 3. Testing

**Approach:**
- Added comprehensive unit tests for items routes
- Included tests for both happy paths and error cases
- Created specific tests for pagination and search functionality

**Implementation Details:**
- Used Jest and Supertest for API testing
- Mocked the fs module to avoid actual file operations during tests
- Tested various scenarios including error handling

**Reasoning:**
- Tests ensure code reliability and prevent regressions
- Mocking external dependencies makes tests faster and more reliable
- Comprehensive test coverage helps identify edge cases

**Tradeoffs:**
- Increased development time for writing tests
- Mocks may not catch all real-world issues
- Focused on unit tests rather than integration tests for simplicity

### Frontend (React)

#### 1. Memory Leak Fix

**Approach:**
- Added cleanup function to useEffect hooks
- Used a flag to prevent state updates after component unmount

**Implementation Details:**
- Created an `active` flag in the useEffect hook
- Set flag to false in the cleanup function
- Only updated state if the component is still mounted

**Reasoning:**
- React warns about memory leaks when state updates occur after unmount
- The flag approach is simple and effective
- Prevents potential crashes and improves application stability

**Tradeoffs:**
- Slightly more code in each useEffect hook
- Alternative approaches like AbortController would work but add complexity

#### 2. Pagination & Search

**Approach:**
- Implemented client-side UI for pagination and search
- Connected to server-side pagination and search API
- Added debouncing for search input

**Implementation Details:**
- Created pagination controls with first, previous, next, and last buttons
- Added search input with debouncing (500ms timeout)
- Used URL parameters to communicate with the backend
- Displayed pagination information (showing X to Y of Z items)

**Reasoning:**
- Server-side pagination reduces data transfer and improves performance
- Debouncing prevents excessive API calls during typing
- Clear UI helps users understand the current state

**Tradeoffs:**
- More complex state management
- Additional API parameters to handle
- Had to ensure synchronization between client and server state

#### 3. Virtualization

**Approach:**
- Integrated react-window for virtualized rendering
- Only rendered visible items in the viewport

**Implementation Details:**
- Used FixedSizeList component from react-window
- Created a memoized ItemRow component for rendering list items
- Set appropriate item size and container dimensions

**Reasoning:**
- Virtualization significantly improves performance for large lists
- Only renders items currently visible in the viewport
- Reduces DOM nodes and memory usage

**Tradeoffs:**
- Added dependency on react-window library
- Fixed item heights required (less flexible layouts)
- Slightly more complex component structure

#### 4. UI/UX Polish

**Approach:**
- Enhanced styling and accessibility
- Added loading/skeleton states
- Improved error handling and display

**Implementation Details:**
- Created skeleton loading components for both list and detail views
- Added proper error messages with styling
- Improved typography, spacing, and visual hierarchy
- Enhanced interactive elements (buttons, links) with hover states

**Reasoning:**
- Loading skeletons provide better user experience during data fetching
- Clear error messages help users understand issues
- Consistent styling improves usability and aesthetics

**Tradeoffs:**
- Increased code size for styling and loading states
- Focused on functional improvements over extensive design work
- Used inline styles for simplicity rather than a CSS-in-JS library