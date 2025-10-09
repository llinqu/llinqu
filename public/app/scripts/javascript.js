// JavaScript Minifier for llinqu
// This script provides JavaScript code minification functionality

(function() {
    'use strict';

    // Main minification function
    function minifyJavaScript(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        let result = code;
        
        // Step 1: Remove single-line comments (but preserve URLs and regex)
        result = removeComments(result);
        
        // Step 2: Remove unnecessary whitespace
        result = removeExcessiveWhitespace(result);
        
        // Step 3: Remove empty lines
        result = removeEmptyLines(result);
        
        // Step 4: Basic optimization
        result = basicOptimizations(result);
        
        return result.trim();
    }

    // Remove comments while preserving strings and regex
    function removeComments(code) {
        let result = '';
        let i = 0;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inRegex = false;
        let inComment = false;
        let inMultiComment = false;
        
        while (i < code.length) {
            const char = code[i];
            const nextChar = code[i + 1];
            const prevChar = code[i - 1];
            
            // Handle string literals
            if (char === '"' && !inSingleQuote && !inRegex && !inComment && !inMultiComment && prevChar !== '\\') {
                inDoubleQuote = !inDoubleQuote;
                result += char;
            } else if (char === "'" && !inDoubleQuote && !inRegex && !inComment && !inMultiComment && prevChar !== '\\') {
                inSingleQuote = !inSingleQuote;
                result += char;
            }
            // Handle regex literals (basic detection)
            else if (char === '/' && !inSingleQuote && !inDoubleQuote && !inComment && !inMultiComment) {
                if (nextChar === '/' && !inRegex) {
                    // Single-line comment
                    inComment = true;
                    i++; // Skip the second /
                } else if (nextChar === '*' && !inRegex) {
                    // Multi-line comment
                    inMultiComment = true;
                    i++; // Skip the *
                } else if (isRegexContext(result)) {
                    // Likely start of regex
                    inRegex = true;
                    result += char;
                } else {
                    result += char;
                }
            } else if (char === '/' && inRegex && prevChar !== '\\') {
                // End of regex
                inRegex = false;
                result += char;
            }
            // Handle end of single-line comment
            else if (char === '\n' && inComment) {
                inComment = false;
                result += char;
            }
            // Handle end of multi-line comment
            else if (char === '*' && nextChar === '/' && inMultiComment) {
                inMultiComment = false;
                i++; // Skip the /
            }
            // Add character if not in comment
            else if (!inComment && !inMultiComment) {
                result += char;
            }
            
            i++;
        }
        
        return result;
    }

    // Check if we're in a regex context
    function isRegexContext(precedingCode) {
        const trimmed = precedingCode.trim();
        const regexContexts = [
            '=', '(', '[', '{', ',', ';', ':', '!', '&', '|', '?', '+', '-', '*', '/', '%', 
            'return', 'throw', 'case', 'in', 'of', 'delete', 'void', 'typeof', 'new', 'instanceof'
        ];
        
        return regexContexts.some(context => 
            trimmed.endsWith(context) || 
            new RegExp(`\\b${context}\\s*$`).test(trimmed)
        );
    }

    // Remove excessive whitespace
    function removeExcessiveWhitespace(code) {
        let result = '';
        let i = 0;
        let inString = false;
        let stringChar = '';
        
        while (i < code.length) {
            const char = code[i];
            const nextChar = code[i + 1];
            const prevChar = code[i - 1];
            
            // Handle string literals
            if ((char === '"' || char === "'") && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
                result += char;
            }
            // Preserve whitespace in strings
            else if (inString) {
                result += char;
            }
            // Handle whitespace outside strings
            else if (/\s/.test(char)) {
                // Check if whitespace is necessary
                if (needsWhitespace(prevChar, nextChar)) {
                    // Replace multiple whitespace with single space
                    if (!/\s/.test(result[result.length - 1])) {
                        result += ' ';
                    }
                }
                // Skip unnecessary whitespace
            } else {
                result += char;
            }
            
            i++;
        }
        
        return result;
    }

    // Check if whitespace is needed between two characters
    function needsWhitespace(prev, next) {
        if (!prev || !next) return false;
        
        const alphanumeric = /[a-zA-Z0-9_$]/;
        const keywords = /[a-zA-Z]/;
        
        // Preserve space between alphanumeric characters
        if (alphanumeric.test(prev) && alphanumeric.test(next)) {
            return true;
        }
        
        // Preserve space between keywords and alphanumeric
        if (keywords.test(prev) && alphanumeric.test(next)) {
            return true;
        }
        
        if (alphanumeric.test(prev) && keywords.test(next)) {
            return true;
        }
        
        // Preserve space around certain operators
        const operatorPairs = [
            ['>', '='], ['<', '='], ['!', '='], ['=', '='],
            ['&', '&'], ['|', '|'], ['+', '+'], ['-', '-']
        ];
        
        return operatorPairs.some(([first, second]) => 
            prev === first && next === second
        );
    }

    // Remove empty lines
    function removeEmptyLines(code) {
        return code
            .split('\n')
            .filter(line => line.trim().length > 0)
            .join('\n');
    }

    // Basic optimizations
    function basicOptimizations(code) {
        let result = code;
        
        // Remove semicolons before closing braces (when safe)
        result = result.replace(/;\s*}/g, '}');
        
        // Remove unnecessary semicolons at end of lines before newlines
        result = result.replace(/;\s*\n/g, '\n');
        
        // Simplify boolean literals in simple cases
        result = result.replace(/\btrue\b/g, '!0');
        result = result.replace(/\bfalse\b/g, '!1');
        
        // Simplify undefined
        result = result.replace(/\bundefined\b/g, 'void 0');
        
        // Remove spaces around certain operators and punctuation
        result = result.replace(/\s*([{}();,:])\s*/g, '$1');
        result = result.replace(/\s*([=!<>+\-*/%&|^])\s*/g, '$1');
        
        // Add back necessary spaces for operators that need them
        result = result.replace(/([a-zA-Z0-9_$])([=!<>+\-*/%&|^])([a-zA-Z0-9_$])/g, '$1 $2 $3');
        
        // Fix specific operator combinations
        result = result.replace(/([=!<>])=/g, '$1=');
        result = result.replace(/([&|])([&|])/g, '$1$2');
        result = result.replace(/([+\-])([+\-])/g, '$1$2');
        
        return result;
    }

    // Expose the minify function globally
    window.minify = minifyJavaScript;

})();
