// CSS Minifier for llinqu
// This script provides CSS code minification functionality

(function() {
    'use strict';

    // Main minification function
    function minifyCSS(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        let result = code;
        
        // Step 1: Remove comments
        result = removeComments(result);
        
        // Step 2: Remove unnecessary whitespace
        result = removeExcessiveWhitespace(result);
        
        // Step 3: Remove empty rules
        result = removeEmptyRules(result);
        
        // Step 4: Optimize values
        result = optimizeValues(result);
        
        // Step 5: Remove trailing semicolons
        result = removeTrailingSemicolons(result);
        
        // Step 6: Final cleanup
        result = finalCleanup(result);
        
        return result.trim();
    }

    // Remove CSS comments
    function removeComments(code) {
        let result = '';
        let i = 0;
        let inString = false;
        let stringChar = '';
        let inComment = false;
        
        while (i < code.length) {
            const char = code[i];
            const nextChar = code[i + 1];
            const prevChar = code[i - 1];
            
            // Handle string literals
            if ((char === '"' || char === "'") && prevChar !== '\\' && !inComment) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
                result += char;
            }
            // Handle start of comment
            else if (char === '/' && nextChar === '*' && !inString) {
                inComment = true;
                i++; // Skip the *
            }
            // Handle end of comment
            else if (char === '*' && nextChar === '/' && inComment) {
                inComment = false;
                i++; // Skip the /
            }
            // Add character if not in comment
            else if (!inComment) {
                result += char;
            }
            
            i++;
        }
        
        return result;
    }

    // Remove excessive whitespace
    function removeExcessiveWhitespace(code) {
        let result = '';
        let i = 0;
        let inString = false;
        let stringChar = '';
        
        while (i < code.length) {
            const char = code[i];
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
                // Only add single space if the last character isn't already whitespace
                if (!/\s/.test(result[result.length - 1])) {
                    result += ' ';
                }
            } else {
                result += char;
            }
            
            i++;
        }
        
        return result;
    }

    // Remove empty CSS rules
    function removeEmptyRules(code) {
        // Remove rules with empty bodies
        return code.replace(/[^{}]*\{\s*\}/g, '');
    }

    // Optimize CSS values
    function optimizeValues(code) {
        let result = code;
        
        // Optimize colors
        result = optimizeColors(result);
        
        // Optimize zero values
        result = optimizeZeros(result);
        
        // Remove unnecessary quotes from URLs and font names
        result = removeUnnecessaryQuotes(result);
        
        // Optimize shorthand properties
        result = optimizeShorthand(result);
        
        return result;
    }

    // Optimize color values
    function optimizeColors(code) {
        let result = code;
        
        // Convert rgb(255,255,255) to #fff
        result = result.replace(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, (match, r, g, b) => {
            const hex = '#' + 
                parseInt(r).toString(16).padStart(2, '0') + 
                parseInt(g).toString(16).padStart(2, '0') + 
                parseInt(b).toString(16).padStart(2, '0');
            return hex;
        });
        
        // Convert 6-digit hex to 3-digit when possible
        result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
        
        // Named colors to shorter hex equivalents
        const colorMap = {
            'white': '#fff',
            'black': '#000',
            'red': '#f00',
            'green': '#008000',
            'blue': '#00f',
            'yellow': '#ff0',
            'cyan': '#0ff',
            'magenta': '#f0f',
            'silver': '#c0c0c0',
            'gray': '#808080',
            'maroon': '#800000',
            'olive': '#808000',
            'lime': '#0f0',
            'aqua': '#0ff',
            'teal': '#008080',
            'navy': '#000080',
            'fuchsia': '#f0f',
            'purple': '#800080'
        };
        
        Object.keys(colorMap).forEach(color => {
            const regex = new RegExp(`\\b${color}\\b`, 'gi');
            result = result.replace(regex, colorMap[color]);
        });
        
        return result;
    }

    // Optimize zero values
    function optimizeZeros(code) {
        let result = code;
        
        // Remove units from zero values
        result = result.replace(/\b0(?:px|em|ex|%|in|cm|mm|pt|pc|vh|vw|vmin|vmax|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)\b/gi, '0');
        
        // Optimize decimal values
        result = result.replace(/\b0+\.(\d+)/g, '.$1');
        result = result.replace(/\b(\d+)\.0+\b/g, '$1');
        
        // Optimize margin/padding shorthand with zeros
        result = result.replace(/\b0 0 0 0\b/g, '0');
        result = result.replace(/\b0 0 0\b/g, '0');
        result = result.replace(/\b0 0\b/g, '0');
        
        return result;
    }

    // Remove unnecessary quotes
    function removeUnnecessaryQuotes(code) {
        let result = code;
        
        // Remove quotes from URLs when not needed
        result = result.replace(/url\s*\(\s*["']([^"'()]*?)["']\s*\)/gi, (match, url) => {
            // Keep quotes if URL contains spaces or special characters
            if (/[\s()]/.test(url)) {
                return match;
            }
            return `url(${url})`;
        });
        
        // Remove quotes from font names when not needed (single word fonts)
        result = result.replace(/font-family\s*:\s*["']([^"',]+)["']/gi, (match, font) => {
            // Keep quotes if font name contains spaces
            if (/\s/.test(font)) {
                return match;
            }
            return `font-family:${font}`;
        });
        
        return result;
    }

    // Optimize shorthand properties
    function optimizeShorthand(code) {
        let result = code;
        
        // Optimize margin/padding shorthand
        result = result.replace(/\b(margin|padding)\s*:\s*(\S+)\s+\2\s+\2\s+\2\b/gi, '$1:$2');
        result = result.replace(/\b(margin|padding)\s*:\s*(\S+)\s+(\S+)\s+\2\s+\3\b/gi, '$1:$2 $3');
        result = result.replace(/\b(margin|padding)\s*:\s*(\S+)\s+(\S+)\s+(\S+)\s+\3\b/gi, '$1:$2 $3 $4');
        
        // Optimize border shorthand
        result = result.replace(/border\s*:\s*(\S+)\s+(\S+)\s+(\S+)\s*;/gi, 'border:$1 $2 $3;');
        
        return result;
    }

    // Remove trailing semicolons
    function removeTrailingSemicolons(code) {
        // Remove semicolon before closing brace
        return code.replace(/;\s*}/g, '}');
    }

    // Final cleanup
    function finalCleanup(code) {
        let result = code;
        
        // Remove spaces around specific characters
        result = result.replace(/\s*([{}:;,>+~])\s*/g, '$1');
        
        // Add space after comma in selectors and function arguments (for readability)
        result = result.replace(/,(?!\s)/g, ', ');
        
        // Remove spaces around parentheses in functions
        result = result.replace(/\(\s+/g, '(');
        result = result.replace(/\s+\)/g, ')');
        
        // Remove multiple consecutive whitespace
        result = result.replace(/\s+/g, ' ');
        
        // Remove leading/trailing whitespace from lines
        result = result.replace(/^\s+|\s+$/gm, '');
        
        // Remove empty lines
        result = result.replace(/\n\s*\n/g, '\n');
        
        // Optimize selector spacing
        result = result.replace(/\s*{\s*/g, '{');
        result = result.replace(/\s*}\s*/g, '}');
        result = result.replace(/;\s*/g, ';');
        result = result.replace(/:\s*/g, ':');
        
        // Fix space after comma in selectors
        result = result.replace(/,\s*/g, ',');
        
        return result;
    }

    // Expose the minify function globally
    window.minify = minifyCSS;

})();
