// SQL Minifier for llinqu
// This script provides SQL code minification functionality

(function () {
    'use strict';

    // Remove comments from SQL content
    function removeComments(code) {
        // Remove single-line comments -- to end of line
        let result = code.replace(/--.*?(\r?\n|$)/g, '');
        // Remove block comments /* ... */
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        return result;
    }

    // Main minification function
    function minifySQL(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }
        // Remove comments
        let result = removeComments(code);

        // Remove tabs, carriage returns, newlines
        result = result.replace(/[\r\n\t]/g, ' ');

        // Collapse multiple spaces to one
        result = result.replace(/\s{2,}/g, ' ');

        // Remove spaces around = , ( ) ; and similar tokens
        result = result.replace(/\s*([=,();<>])\s*/g, '$1');

        // Remove leading and trailing whitespace
        result = result.trim();

        return result;
    }

    // Pretty print SQL (simple approach: add newlines after ; and before SELECT/UPDATE/INSERT/DELETE/CREATE/DROP)
    function prettifySQL(code) {
        if (!code || typeof code !== 'string') return '';
        let result = code
            .replace(/;/g, ';\n')
            .replace(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY)\b/gi, '\n$1');
        // Remove excess blank lines
        return result.replace(/\n{2,}/g, '\n').trim();
    }

    // Validate (checks balanced single/double quotes and parentheses/brackets/braces: rudimentary)
    function validateSQL(code) {
        let valid = true;
        let error = null;
        // Quotes
        let singleQuotes = (code.match(/'/g) || []).length;
        let doubleQuotes = (code.match(/"/g) || []).length;
        // Parentheses/brackets
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
        return { valid, error };
    }

    // Analyze SQL (counts statements and size)
    function analyzeSQL(code) {
        let statements = (code.match(/;/g) || []).length;
        return {
            statements,
            characters: code.length,
            bytes: new Blob([code]).size
        };
    }

    // Expose functions globally
    window.minify = minifySQL;
    window.removeSQLComments = removeComments;
    window.prettifySQL = prettifySQL;
    window.validateSQL = validateSQL;
    window.analyzeSQL = analyzeSQL;
})();
