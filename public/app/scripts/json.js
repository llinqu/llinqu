// JSON Minifier for llinqu
// This script provides JSON code minification functionality

(function() {
    'use strict';

    // Main minification function
    function minifyJSON(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        try {
            // First, validate that it's valid JSON by parsing it
            const parsed = JSON.parse(code);
            
            // Use JSON.stringify for basic minification
            let result = JSON.stringify(parsed);
            
            // Apply additional optimizations
            result = additionalOptimizations(result);
            
            return result;
        } catch (error) {
            // If parsing fails, try manual minification (for malformed JSON that might be fixable)
            return manualMinification(code);
        }
    }

    // Additional optimizations after JSON.stringify
    function additionalOptimizations(json) {
        let result = json;
        
        // JSON.stringify already removes unnecessary whitespace,
        // but we can add some final touches
        
        // Remove any remaining unnecessary spaces (though JSON.stringify should handle this)
        result = result.replace(/\s*([{}[\],:])\s*/g, '$1');
        
        return result;
    }

    // Manual minification for potentially malformed JSON
    function manualMinification(code) {
        let result = '';
        let i = 0;
        let inString = false;
        let escapeNext = false;
        
        while (i < code.length) {
            const char = code[i];
            
            // Handle escape sequences
            if (escapeNext) {
                result += char;
                escapeNext = false;
                i++;
                continue;
            }
            
            // Handle escape character
            if (char === '\\' && inString) {
                result += char;
                escapeNext = true;
                i++;
                continue;
            }
            
            // Handle string boundaries
            if (char === '"') {
                inString = !inString;
                result += char;
            }
            // Preserve all content inside strings
            else if (inString) {
                result += char;
            }
            // Handle whitespace outside strings
            else if (/\s/.test(char)) {
                // Skip all whitespace outside of strings
                // JSON doesn't need any whitespace for formatting
            }
            // Handle other characters
            else {
                result += char;
            }
            
            i++;
        }
        
        // Final validation attempt
        try {
            const parsed = JSON.parse(result);
            return JSON.stringify(parsed); // Re-stringify to ensure proper formatting
        } catch (error) {
            // If still invalid, return the manually minified version with error info
            return result;
        }
    }

    // Validate JSON structure
    function validateJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return { valid: true, error: null };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Pretty print JSON (opposite of minify)
    function prettifyJSON(code) {
        try {
            const parsed = JSON.parse(code);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            return code; // Return original if parsing fails
        }
    }

    // Format JSON with custom indentation
    function formatJSON(code, indent = 2) {
        try {
            const parsed = JSON.parse(code);
            return JSON.stringify(parsed, null, indent);
        } catch (error) {
            return code; // Return original if parsing fails
        }
    }

    // Remove comments from JSON-like content (non-standard but sometimes used)
    function removeComments(code) {
        let result = '';
        let i = 0;
        let inString = false;
        let escapeNext = false;
        
        while (i < code.length) {
            const char = code[i];
            const nextChar = code[i + 1];
            
            // Handle escape sequences
            if (escapeNext) {
                result += char;
                escapeNext = false;
                i++;
                continue;
            }
            
            // Handle escape character
            if (char === '\\' && inString) {
                result += char;
                escapeNext = true;
                i++;
                continue;
            }
            
            // Handle string boundaries
            if (char === '"') {
                inString = !inString;
                result += char;
            }
            // Preserve all content inside strings
            else if (inString) {
                result += char;
            }
            // Handle potential comments outside strings
            else if (char === '/' && nextChar === '/' && !inString) {
                // Skip single-line comment
                while (i < code.length && code[i] !== '\n') {
                    i++;
                }
                continue;
            }
            else if (char === '/' && nextChar === '*' && !inString) {
                // Skip multi-line comment
                i += 2; // Skip /*
                while (i < code.length - 1) {
                    if (code[i] === '*' && code[i + 1] === '/') {
                        i += 2; // Skip */
                        break;
                    }
                    i++;
                }
                continue;
            }
            // Handle other characters
            else {
                result += char;
            }
            
            i++;
        }
        
        return result;
    }

    // Comprehensive JSON minification with comment removal
    function minifyJSONWithComments(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        // First remove comments (non-standard JSON extension)
        let result = removeComments(code);
        
        // Then apply standard JSON minification
        return minifyJSON(result);
    }

    // Analyze JSON structure
    function analyzeJSON(code) {
        try {
            const parsed = JSON.parse(code);
            
            const analysis = {
                valid: true,
                type: Array.isArray(parsed) ? 'array' : typeof parsed,
                size: {
                    characters: code.length,
                    bytes: new Blob([code]).size
                }
            };
            
            if (typeof parsed === 'object' && parsed !== null) {
                if (Array.isArray(parsed)) {
                    analysis.length = parsed.length;
                } else {
                    analysis.keys = Object.keys(parsed).length;
                }
            }
            
            return analysis;
        } catch (error) {
            return {
                valid: false,
                error: error.message,
                size: {
                    characters: code.length,
                    bytes: new Blob([code]).size
                }
            };
        }
    }

    // Enhanced minification with options
    function minifyJSONAdvanced(code, options = {}) {
        const {
            removeComments: shouldRemoveComments = false,
            sortKeys = false,
            removeEmpty = false
        } = options;

        if (!code || typeof code !== 'string') {
            return '';
        }

        let result = code;

        // Remove comments if requested
        if (shouldRemoveComments) {
            result = removeComments(result);
        }

        try {
            let parsed = JSON.parse(result);
            
            // Sort keys if requested
            if (sortKeys && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                parsed = sortObjectKeys(parsed);
            }
            
            // Remove empty values if requested
            if (removeEmpty) {
                parsed = removeEmptyValues(parsed);
            }
            
            return JSON.stringify(parsed);
        } catch (error) {
            // Fallback to manual minification
            return manualMinification(result);
        }
    }

    // Sort object keys recursively
    function sortObjectKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys);
        } else if (typeof obj === 'object' && obj !== null) {
            const sorted = {};
            Object.keys(obj).sort().forEach(key => {
                sorted[key] = sortObjectKeys(obj[key]);
            });
            return sorted;
        }
        return obj;
    }

    // Remove empty values recursively
    function removeEmptyValues(obj) {
        if (Array.isArray(obj)) {
            return obj.map(removeEmptyValues).filter(item => 
                item !== null && item !== undefined && item !== '' && 
                !(Array.isArray(item) && item.length === 0) &&
                !(typeof item === 'object' && Object.keys(item).length === 0)
            );
        } else if (typeof obj === 'object' && obj !== null) {
            const filtered = {};
            Object.keys(obj).forEach(key => {
                const value = removeEmptyValues(obj[key]);
                if (value !== null && value !== undefined && value !== '' && 
                    !(Array.isArray(value) && value.length === 0) &&
                    !(typeof value === 'object' && Object.keys(value).length === 0)) {
                    filtered[key] = value;
                }
            });
            return filtered;
        }
        return obj;
    }

    // Expose the main minify function globally
    window.minify = minifyJSON;
    
    // Expose additional utility functions
    window.minifyJSONWithComments = minifyJSONWithComments;
    window.minifyJSONAdvanced = minifyJSONAdvanced;
    window.prettifyJSON = prettifyJSON;
    window.formatJSON = formatJSON;
    window.validateJSON = validateJSON;
    window.analyzeJSON = analyzeJSON;

})();
