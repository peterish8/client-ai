```markdown
# client-ai Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance on contributing to the `client-ai` JavaScript codebase. It covers the project's coding conventions, commit message patterns, and testing approaches. By following these patterns, contributors can ensure consistency and maintainability across the repository.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `myComponent.js`, `userProfile.test.js`

### Import Style
- Use **relative imports** for modules within the codebase.
  - Example:
    ```javascript
    import { fetchData } from './apiUtils';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```javascript
    // In apiUtils.js
    export function fetchData() { ... }
    export const API_URL = '...';

    // In another file
    import { fetchData, API_URL } from './apiUtils';
    ```

### Commit Messages
- Follow the **Conventional Commits** specification.
- Common prefixes: `docs`, `feat`, `test`, `style`
- Example:
  ```
  feat: add user authentication flow
  docs: update API usage in README
  style: reformat userProfile.js
  test: add tests for fetchData
  ```

## Workflows

### Making a Change
**Trigger:** When adding a new feature, fixing a bug, or updating documentation  
**Command:** `/make-change`

1. Create a new branch for your change.
2. Implement your code following the coding conventions.
3. Write or update tests as needed.
4. Commit your changes using a conventional commit message.
5. Push your branch and open a pull request.

### Writing Tests
**Trigger:** When adding new functionality or fixing bugs  
**Command:** `/write-test`

1. Create a test file named with the pattern `*.test.js` (e.g., `userProfile.test.js`).
2. Write tests for your code using the project's preferred testing framework (unknown, but follow existing patterns).
3. Run tests to ensure they pass.

### Code Formatting
**Trigger:** Before committing changes  
**Command:** `/format-code`

1. Ensure your code follows the camelCase file naming convention.
2. Use relative imports and named exports.
3. Apply consistent code formatting (refer to existing files for style).

## Testing Patterns

- Test files are named using the pattern `*.test.js` (e.g., `apiUtils.test.js`).
- Place tests alongside the code they test or in a dedicated test directory.
- Use the same import/export conventions in test files.
- The testing framework is not specified; follow the structure of existing tests.

## Commands
| Command        | Purpose                                             |
|----------------|-----------------------------------------------------|
| /make-change   | Start the workflow for making a codebase change     |
| /write-test    | Begin writing tests for new or changed functionality|
| /format-code   | Apply code formatting and naming conventions        |
```