// Universal Minifier for llinqu
// Removes comments and unnecessary whitespace for many languages

(function () {
    'use strict';

    function minifyUniversal(code) {
        if (!code || typeof code !== 'string') return '';
        
        // Remove single line comments: //, #, --
        let result = code.replace(/\/\/.*?$|#.*?$|--.*?$/gm, '');
        
        // Remove block comments /* ... */
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove HTML/XML comments <!-- ... -->
        result = result.replace(/<!--[\s\S]*?-->/g, '');
        
        // Collapse all whitespace (spaces, tabs, newlines) to a single space
        result = result.replace(/\s+/g, ' ');
        
        // Trim leading and trailing whitespace
        return result.trim();
    }

    // Expose the minify function globally
    window.minify = minifyUniversal;
})();
