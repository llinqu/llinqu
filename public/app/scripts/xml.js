// XML Minifier for llinqu
// This script provides XML code minification functionality

(function () {
    'use strict';

    // Main minification function
    function minifyXML(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        // Step 1: Remove comments
        let result = code.replace(/<!--[\s\S]*?-->/g, '');

        // Step 2: Remove carriage returns, tabs, and excessive whitespace/newlines between tags
        // Collapse all whitespace between tags to a single space
        result = result.replace(/>\s+</g, '><');

        // Remove leading/trailing whitespace
        result = result.trim();

        // Remove excess spaces within tags (optional, careful not to break attribute values)
        result = result.replace(/\s{2,}/g, ' ');

        return result;
    }

    // Pretty print XML (opposite of minify)
    function prettifyXML(code) {
        if (!code || typeof code !== 'string') return '';
        // Basic pretty-print: add newlines before each tag
        let result = code.replace(/>\s*</g, '>\n<');
        // Indentation with 2 spaces (simple non-recursive)
        let pad = 0, formatted = '';
        result.split('\n').forEach(line => {
            if (/<\/.+>/.test(line)) pad -= 2;
            formatted += ' '.repeat(pad) + line + '\n';
            if (/<[^\/!][^>]*[^\/]>/.test(line)) pad += 2;
        });
        return formatted.trim();
    }

    // Validate XML structure (basic, uses DOMParser)
    function validateXML(code) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(code, "application/xml");
        let error = doc.getElementsByTagName("parsererror");
        return {
            valid: error.length === 0,
            error: error.length ? error[0].textContent : null
        };
    }

    // Analyze XML structure (counts elements, attributes, size)
    function analyzeXML(code) {
        let analysis = {
            valid: true,
            error: null,
            elements: 0,
            attributes: 0,
            characters: code.length,
            bytes: new Blob([code]).size
        };
        try {
            let parser = new DOMParser();
            let doc = parser.parseFromString(code, "application/xml");
            let error = doc.getElementsByTagName("parsererror");
            if (error.length) {
                analysis.valid = false;
                analysis.error = error[0].textContent;
                return analysis;
            }
            // Traverse nodes to count
            function traverse(node) {
                if (node.nodeType === 1) { // Element
                    analysis.elements++;
                    analysis.attributes += node.attributes.length;
                    for (let child of node.childNodes) {
                        traverse(child);
                    }
                }
            }
            traverse(doc.documentElement);
        } catch (e) {
            analysis.valid = false;
            analysis.error = e.message;
        }
        return analysis;
    }

    // Expose functions globally
    window.minify = minifyXML;
    window.prettifyXML = prettifyXML;
    window.validateXML = validateXML;
    window.analyzeXML = analyzeXML;
})();
