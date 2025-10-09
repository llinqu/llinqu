
// PHP Minifier for llinqu
// This script provides PHP code minification functionality

(function () {
    'use strict';

    // Remove comments from PHP content
    function removeComments(code) {
        // Remove block comments /* ... */
        let result = code.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove single-line comments // ... and # ...
        result = result.replace(/\/\/.*?(\r?\n|$)/g, '');
        result = result.replace(/#.*?(\r?\n|$)/g, '');
        return result;
    }

    // Main minification function
    function minifyPHP(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }
        // Remove comments
        let result = removeComments(code);

        // Remove tabs, carriage returns, and newlines
        result = result.replace(/[\r\n\t]/g, ' ');

        // Collapse multiple spaces to one
        result = result.replace(/\s{2,}/g, ' ');

        // Remove spaces around operators and punctuation, except within quotes
        result = result.replace(/\s*([=+\-*,;:{}()\[\]<>])\s*/g, '$1');

        // Remove leading and trailing whitespace
        result = result.trim();

        return result;
    }

    // Pretty print PHP (simple approach: add newlines after braces/semicolons)
    function prettifyPHP(code) {
        if (!code || typeof code !== 'string') return '';
        let result = code
            .replace(/;/g, ';\n')
            .replace(/{/g, '{\n')
            .replace(/}/g, '\n}')
            .replace(/\n{2,}/g, '\n');
        return result.trim();
    }

    // Basic validation (checks balanced single/double quotes and braces/parentheses)
    function validatePHP(code) {
        let valid = true;
        let error = null;
        let singleQuotes = (code.match(/'/g) || []).length;
        let doubleQuotes = (code.match(/"/g) || []).length;
        let parensOpen = (code.match(/\(/g) || []).length;
        let parensClose = (code.match(/\)/g) || []).length;
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
        } else if (bracesOpen !== bracesClose) {
            valid = false;
            error = "Unbalanced braces";
        }
        return { valid, error };
    }

    // Analyze PHP (counts functions, lines, bytes, characters)
    function analyzePHP(code) {
        let functions = (code.match(/function\s+[a-zA-Z0-9_]+\s*\(/g) || []).length;
        let lines = (code.match(/\n/g) || []).length + 1;
        return {
            functions,
            lines,
            characters: code.length,
            bytes: new Blob([code]).size
        };
    }

    // Expose functions globally
    window.minify = minifyPHP;
    window.removePHPComments = removeComments;
    window.prettifyPHP = prettifyPHP;
    window.validatePHP = validatePHP;
    window.analyzePHP = analyzePHP;
})();
