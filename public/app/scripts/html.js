// HTML Minifier for llinqu
// This script provides HTML code minification functionality

(function() {
    'use strict';

    // Elements where whitespace should be preserved
    const preserveWhitespaceElements = new Set([
        'pre', 'code', 'textarea', 'script', 'style', 'xmp', 'plaintext', 'listing'
    ]);

    // Inline elements that might need space between them
    const inlineElements = new Set([
        'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 
        'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'q', 
        'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 
        'textarea', 'tt', 'var'
    ]);

    // Boolean attributes
    const booleanAttributes = new Set([
        'autofocus', 'autoplay', 'async', 'checked', 'controls', 'defer', 'disabled',
        'hidden', 'loop', 'multiple', 'muted', 'open', 'readonly', 'required',
        'reversed', 'selected', 'autoplay', 'default', 'formnovalidate', 'itemscope',
        'novalidate', 'pubdate', 'declare', 'nowrap', 'ismap', 'nohref', 'noshade',
        'compact', 'scoped'
    ]);

    // Main minification function
    function minifyHTML(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        let result = code;
        
        // Step 1: Remove HTML comments (preserve conditional comments)
        result = removeComments(result);
        
        // Step 2: Minify inline CSS and JavaScript
        result = minifyInlineContent(result);
        
        // Step 3: Optimize attributes
        result = optimizeAttributes(result);
        
        // Step 4: Remove unnecessary whitespace
        result = removeExcessiveWhitespace(result);
        
        // Step 5: Remove empty attributes
        result = removeEmptyAttributes(result);
        
        // Step 6: Final cleanup
        result = finalCleanup(result);
        
        return result.trim();
    }

    // Remove HTML comments but preserve conditional comments
    function removeComments(code) {
        // Preserve conditional comments (IE comments)
        const conditionalComments = [];
        let conditionalIndex = 0;
        
        // Extract conditional comments
        code = code.replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, (match) => {
            const placeholder = `__CONDITIONAL_COMMENT_${conditionalIndex++}__`;
            conditionalComments.push(match);
            return placeholder;
        });
        
        // Remove regular comments
        code = code.replace(/<!--[\s\S]*?-->/g, '');
        
        // Restore conditional comments
        conditionalComments.forEach((comment, index) => {
            code = code.replace(`__CONDITIONAL_COMMENT_${index}__`, comment);
        });
        
        return code;
    }

    // Minify inline CSS and JavaScript
    function minifyInlineContent(code) {
        let result = code;
        
        // Minify inline CSS in <style> tags
        result = result.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match, attrs, css) => {
            if (css.trim()) {
                const minifiedCSS = minifyInlineCSS(css);
                return `<style${attrs}>${minifiedCSS}</style>`;
            }
            return match;
        });
        
        // Minify inline JavaScript in <script> tags
        result = result.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, js) => {
            // Skip if script has src attribute (external script)
            if (/\bsrc\s*=/i.test(attrs) || !js.trim()) {
                return match;
            }
            const minifiedJS = minifyInlineJS(js);
            return `<script${attrs}>${minifiedJS}</script>`;
        });
        
        return result;
    }

    // Basic CSS minification for inline styles
    function minifyInlineCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}:;,])\s*/g, '$1') // Remove space around punctuation
            .replace(/;\s*}/g, '}') // Remove trailing semicolon
            .trim();
    }

    // Basic JavaScript minification for inline scripts
    function minifyInlineJS(js) {
        return js
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}();,:])\s*/g, '$1') // Remove space around punctuation
            .trim();
    }

    // Optimize HTML attributes
    function optimizeAttributes(code) {
        let result = code;
        
        // Remove quotes from attributes when safe
        result = result.replace(/(\w+)=("[^"]*")/g, (match, attr, value) => {
            const unquoted = value.slice(1, -1); // Remove quotes
            
            // Keep quotes if value contains spaces, special characters, or is empty
            if (!unquoted || /[\s"'`=<>]/.test(unquoted)) {
                return match;
            }
            
            return `${attr}=${unquoted}`;
        });
        
        // Remove quotes from single-quoted attributes when safe
        result = result.replace(/(\w+)=('[^']*')/g, (match, attr, value) => {
            const unquoted = value.slice(1, -1); // Remove quotes
            
            // Keep quotes if value contains spaces, special characters, or is empty
            if (!unquoted || /[\s"'`=<>]/.test(unquoted)) {
                return match;
            }
            
            return `${attr}=${unquoted}`;
        });
        
        // Optimize boolean attributes
        booleanAttributes.forEach(attr => {
            const regex = new RegExp(`\\b${attr}\\s*=\\s*["']?${attr}["']?`, 'gi');
            result = result.replace(regex, attr);
        });
        
        // Remove type="text/javascript" from script tags (default)
        result = result.replace(/(<script[^>]*)\s+type\s*=\s*["']?text\/javascript["']?/gi, '$1');
        
        // Remove type="text/css" from style tags (default)
        result = result.replace(/(<style[^>]*)\s+type\s*=\s*["']?text\/css["']?/gi, '$1');
        
        // Remove method="get" from forms (default)
        result = result.replace(/(<form[^>]*)\s+method\s*=\s*["']?get["']?/gi, '$1');
        
        return result;
    }

    // Remove excessive whitespace
    function removeExcessiveWhitespace(code) {
        let result = '';
        let i = 0;
        let inTag = false;
        let inPreserveElement = false;
        let preserveElementStack = [];
        
        while (i < code.length) {
            const char = code[i];
            const remaining = code.slice(i);
            
            // Check for opening tags
            if (char === '<' && !inTag) {
                const tagMatch = remaining.match(/^<(\/?)\s*(\w+)/i);
                if (tagMatch) {
                    const isClosing = tagMatch[1] === '/';
                    const tagName = tagMatch[2].toLowerCase();
                    
                    if (isClosing) {
                        // Check if this closes a preserve-whitespace element
                        const lastPreserveElement = preserveElementStack[preserveElementStack.length - 1];
                        if (lastPreserveElement === tagName) {
                            preserveElementStack.pop();
                            inPreserveElement = preserveElementStack.length > 0;
                        }
                    } else if (preserveWhitespaceElements.has(tagName)) {
                        preserveElementStack.push(tagName);
                        inPreserveElement = true;
                    }
                }
                inTag = true;
                result += char;
            }
            // Check for closing tags
            else if (char === '>' && inTag) {
                inTag = false;
                result += char;
            }
            // Inside tags - preserve spaces between attributes
            else if (inTag) {
                if (/\s/.test(char)) {
                    // Only add space if the last character isn't already whitespace
                    if (!/\s/.test(result[result.length - 1])) {
                        result += ' ';
                    }
                } else {
                    result += char;
                }
            }
            // Inside preserve-whitespace elements
            else if (inPreserveElement) {
                result += char;
            }
            // Outside tags - handle text content
            else {
                if (/\s/.test(char)) {
                    // Check if we need to preserve space between inline elements
                    const beforeTag = result.match(/<(\w+)[^>]*>$/);
                    const afterMatch = remaining.match(/^\s*<(\w+)/);
                    
                    if (beforeTag && afterMatch) {
                        const beforeElement = beforeTag[1].toLowerCase();
                        const afterElement = afterMatch[1].toLowerCase();
                        
                        // Preserve space between inline elements
                        if (inlineElements.has(beforeElement) && inlineElements.has(afterElement)) {
                            if (!/\s/.test(result[result.length - 1])) {
                                result += ' ';
                            }
                        }
                    } else {
                        // Collapse multiple whitespace to single space
                        if (!/\s/.test(result[result.length - 1])) {
                            result += ' ';
                        }
                    }
                } else {
                    result += char;
                }
            }
            
            i++;
        }
        
        return result;
    }

    // Remove empty attributes
    function removeEmptyAttributes(code) {
        // Remove attributes with empty values (except for boolean attributes)
        const booleanAttrPattern = Array.from(booleanAttributes).join('|');
        const booleanRegex = new RegExp(`\\b(?:${booleanAttrPattern})\\b`, 'i');
        
        return code.replace(/\s+(\w+)=["']?\s*["']?/g, (match, attr) => {
            // Keep boolean attributes even if empty
            if (booleanRegex.test(attr)) {
                return ` ${attr}`;
            }
            // Remove empty non-boolean attributes
            return '';
        });
    }

    // Final cleanup
    function finalCleanup(code) {
        let result = code;
        
        // Remove whitespace around = in attributes
        result = result.replace(/\s*=\s*/g, '=');
        
        // Remove leading and trailing whitespace from tag content
        result = result.replace(/>\s+</g, '><');
        
        // Remove multiple consecutive whitespace (outside preserve elements)
        result = result.replace(/(?<!<(?:pre|code|textarea|script|style)[^>]*>[\s\S]*?)\s{2,}(?![\s\S]*?<\/(?:pre|code|textarea|script|style)>)/g, ' ');
        
        // Remove whitespace at the beginning and end of the document
        result = result.replace(/^\s+|\s+$/g, '');
        
        // Clean up extra spaces in tag declarations
        result = result.replace(/<(\w+)\s+>/g, '<$1>');
        result = result.replace(/\s+>/g, '>');
        
        return result;
    }

    // Expose the minify function globally
    window.minify = minifyHTML;

})();
