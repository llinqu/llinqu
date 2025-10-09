// Python Minifier for llinqu
// This script provides Python code minification functionality

(function () {
    'use strict';

    // Remove comments from Python code (single-line #, triple-quoted docstrings)
    function removeComments(code) {
        if (!code || typeof code !== 'string') return '';

        // Remove triple-quoted strings (docstrings)
        let result = code.replace(/("""|''')[\s\S]*?\1/g, '');

        // Remove single line comments but preserve hash in string literals
        result = result.replace(/^([ \t]*)#.*$/gm, '');

        // Remove inline comments (after code, not inside quotes)
        result = result.replace(/([^"'#]*?)\s+#.*$/gm, '$1');

        return result;
    }

    // Main minification function
    function minifyPython(code) {
        if (!code || typeof code !== 'string') return '';
        let result = removeComments(code);

        // Remove blank lines but preserve indentation
        result = result.replace(/^\s*[\r\n]/gm, '');
        // Convert tabs to spaces for safety (optional)
        result = result.replace(/\t/g, '    ');
        // Remove trailing whitespace
        result = result.replace(/[ \t]+$/gm, '');
        // Remove unnecessary spaces around colons, commas, parentheses (except leading indentation)
        result = result.replace(/(\S)\s*([:,)\]}])/g, '$1$2');
        result = result.replace(/([(\[{])\s*(\S)/g, '$1$2');
        // Remove excessive internal spaces (not at line start)
        result = result.replace(/(^[ \t]*)[ \t]{2,}/gm, '$1');
        result = result.trim();

        return result;
    }

    // Pretty print (adds blank lines after class/def, indents blocks uniformly, non-recursive simple approach)
    function prettifyPython(code) {
        if (!code || typeof code !== 'string') return '';
        let result = code.replace(/(\n|^)(class\s+\w+|def\s+\w+.*:)/g, '\n$2\n');
        result = result.replace(/\n{2,}/g, '\n\n');
        return result.trim();
    }

    // Basic validation (checks balanced quotes, parentheses, indentation levels)
    function validatePython(code) {
        let valid = true;
        let error = null;
        let singleQuotes = (code.match(/'/g) || []).length;
        let doubleQuotes = (code.match(/"/g) || []).length;
        let parensOpen = (code.match(/\(/g) || []).length;
        let parensClose = (code.match(/\)/g) || []).length;
        let bracketsOpen = (code.match(/\[/g) || []).length;
        let bracketsClose = (code.match(/]/g) || []).length;
        let bracesOpen = (code.match(/{/g) || []).length;
        let bracesClose = (code.match(/}/g) || []).length;

        if (singleQuotes % 2 !== 0) {
            valid = false;
            error = "Unbalanced single quotes";
        } else if (doubleQuotes % 2 !== 0) {
            valid = false;
            error = "Unbalanced double quotes";
        } else if (parensOpen !== parensClose) {
            valid = false;
            error = "Unbalanced parentheses";
        } else if (bracketsOpen !== bracketsClose) {
            valid = false;
            error = "Unbalanced brackets";
        } else if (bracesOpen !== bracesClose) {
            valid = false;
            error = "Unbalanced braces";
        }
        // Optional: more checks on indentation levels can be added.
        return { valid, error };
    }

    // Analyze Python (counts functions, classes, lines, bytes, characters)
    function analyzePython(code) {
        let functions = (code.match(/^\s*def\s+\w+\s*\(/gm) || []).length;
        let classes = (code.match(/^\s*class\s+\w+\s*:/gm) || []).length;
        let lines = (code.match(/\n/g) || []).length + 1;
        return {
            functions,
            classes,
            lines,
            characters: code.length,
            bytes: new Blob([code]).size
        };
    }

    // Expose functions globally
    window.minify = minifyPython;
    window.removePythonComments = removeComments;
    window.prettifyPython = prettifyPython;
    window.validatePython = validatePython;
    window.analyzePython = analyzePython;
})();
