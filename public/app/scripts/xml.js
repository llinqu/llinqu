// XML Minifier for linqu
// This script provides XML code minification functionality

(function() {
    'use strict';

    // Main minification function
    function minifyXML(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        try {
            // Basic XML minification
            let result = basicMinification(code);
            
            // Apply additional optimizations
            result = additionalOptimizations(result);
            
            return result;
        } catch (error) {
            // If processing fails, try manual minification
            return manualMinification(code);
        }
    }

    // Basic XML minification
    function basicMinification(xml) {
        let result = xml;
        
        // Remove XML comments
        result = result.replace(/<!--[\s\S]*?-->/g, '');
        
        // Remove processing instructions (except XML declaration)
        result = result.replace(/<\?(?!xml\s)[\s\S]*?\?>/g, '');
        
        // Remove unnecessary whitespace between tags
        result = result.replace(/>\s+</g, '><');
        
        // Remove leading and trailing whitespace
        result = result.trim();
        
        // Remove whitespace around attributes
        result = result.replace(/\s*=\s*/g, '=');
        
        // Remove extra spaces in tag declarations
        result = result.replace(/<([^>]+)\s+>/g, (match, content) => {
            return '<' + content.replace(/\s+/g, ' ').trim() + '>';
        });
        
        return result;
    }

    // Additional optimizations after basic minification
    function additionalOptimizations(xml) {
        let result = xml;
        
        // Remove empty lines
        result = result.replace(/^\s*[\r\n]/gm, '');
        
        // Normalize attribute quotes (use double quotes consistently)
        result = result.replace(/(\w+)='([^']*)'/g, '$1="$2"');
        
        // Remove unnecessary spaces around self-closing tags
        result = result.replace(/\s+\/>/g, '/>');
        
        return result;
    }

    // Manual minification for complex cases
    function manualMinification(code) {
        let result = '';
        let i = 0;
        let inTag = false;
        let inComment = false;
        let inCDATA = false;
        let inString = false;
        let stringChar = '';
        let depth = 0;
        
        while (i < code.length) {
            const char = code[i];
            const nextChars = code.substring(i, i + 4);
            const prev = code[i - 1];
            
            // Handle CDATA sections
            if (nextChars === '<![C' && code.substring(i, i + 9) === '<![CDATA[') {
                inCDATA = true;
                result += code.substring(i, i + 9);
                i += 9;
                continue;
            }
            
            if (inCDATA) {
                result += char;
                if (char === ']' && code.substring(i, i + 3) === ']]>') {
                    result += ']>';
                    i += 3;
                    inCDATA = false;
                    continue;
                }
                i++;
                continue;
            }
            
            // Handle comments
            if (nextChars === '<!--') {
                inComment = true;
                i += 4;
                continue;
            }
            
            if (inComment) {
                if (char === '-' && code.substring(i, i + 3) === '-->') {
                    inComment = false;
                    i += 3;
                }
                else {
                    i++;
                }
                continue;
            }
            
            // Handle string literals within attributes
            if (inTag && (char === '"' || char === "'")) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar && prev !== '\\') {
                    inString = false;
                    stringChar = '';
                }
                result += char;
            }
            // Handle tag boundaries
            else if (char === '<' && !inString) {
                inTag = true;
                result += char;
            }
            else if (char === '>' && !inString) {
                inTag = false;
                result += char;
            }
            // Handle content inside strings
            else if (inString) {
                result += char;
            }
            // Handle whitespace
            else if (/\s/.test(char)) {
                // Inside tags, preserve single spaces between attributes
                if (inTag && prev && !/\s/.test(prev) && i < code.length - 1 && !/[>=]/.test(code[i + 1])) {
                    result += ' ';
                }
                // Outside tags, only preserve significant whitespace
                else if (!inTag) {
                    // Skip whitespace between tags
                    if (prev === '>' && code.substring(i).search(/\S/) !== -1) {
                        const nextNonSpace = code.substring(i).search(/\S/);
                        if (nextNonSpace !== -1 && code[i + nextNonSpace] === '<') {
                            // Skip whitespace between tags
                        } else {
                            // Preserve content whitespace as single space
                            if (!/\s/.test(prev)) {
                                result += ' ';
                            }
                        }
                    }
                }
            }
            // Handle other characters
            else {
                result += char;
            }
            
            i++;
        }
        
        return result.trim();
    }

    // Validate XML structure
    function validateXML(xmlString) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlString, 'text/xml');
            
            // Check for parsing errors
            const parseError = doc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                return { 
                    valid: false, 
                    error: parseError[0].textContent || 'XML parsing error' 
                };
            }
            
            return { valid: true, error: null };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Pretty print XML (opposite of minify)
    function prettifyXML(code, indent = 2) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(code, 'text/xml');
            
            // Check for parsing errors
            const parseError = doc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                return code; // Return original if parsing fails
            }
            
            return formatXMLNode(doc, indent);
        } catch (error) {
            return code; // Return original if parsing fails
        }
    }

    // Format XML node recursively
    function formatXMLNode(node, indent = 2, level = 0) {
        const indentStr = ' '.repeat(indent * level);
        let result = '';
        
        if (node.nodeType === Node.DOCUMENT_NODE) {
            // Handle document node
            for (let child of node.childNodes) {
                result += formatXMLNode(child, indent, level);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Handle element node
            result += indentStr + '<' + node.nodeName;
            
            // Add attributes
            if (node.attributes && node.attributes.length > 0) {
                for (let attr of node.attributes) {
                    result += ' ' + attr.name + '="' + attr.value + '"';
                }
            }
            
            if (node.childNodes.length === 0) {
                result += '/>\n';
            } else {
                result += '>\n';
                
                // Process children
                for (let child of node.childNodes) {
                    result += formatXMLNode(child, indent, level + 1);
                }
                
                result += indentStr + '</' + node.nodeName + '>\n';
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            // Handle text node
            const text = node.textContent.trim();
            if (text) {
                result += indentStr + text + '\n';
            }
        } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
            // Handle CDATA
            result += indentStr + '<![CDATA[' + node.textContent + ']]>\n';
        } else if (node.nodeType === Node.COMMENT_NODE) {
            // Handle comments
            result += indentStr + '<!--' + node.textContent + '-->\n';
        }
        
        return result;
    }

    // Remove comments from XML
    function removeComments(code) {
        return code.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove processing instructions (except XML declaration)
    function removeProcessingInstructions(code) {
        return code.replace(/<\?(?!xml\s)[\s\S]*?\?>/g, '');
    }

    // Comprehensive XML minification with comment removal
    function minifyXMLWithComments(code) {
        if (!code || typeof code !== 'string') {
            return '';
        }

        // Remove comments and processing instructions
        let result = removeComments(code);
        result = removeProcessingInstructions(result);
        
        // Apply standard XML minification
        return minifyXML(result);
    }

    // Analyze XML structure
    function analyzeXML(code) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(code, 'text/xml');
            
            // Check for parsing errors
            const parseError = doc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                return {
                    valid: false,
                    error: parseError[0].textContent || 'XML parsing error',
                    size: {
                        characters: code.length,
                        bytes: new Blob([code]).size
                    }
                };
            }
            
            const analysis = {
                valid: true,
                rootElement: doc.documentElement ? doc.documentElement.nodeName : null,
                elements: doc.getElementsByTagName('*').length,
                size: {
                    characters: code.length,
                    bytes: new Blob([code]).size
                }
            };
            
            // Count attributes
            let attributeCount = 0;
            const elements = doc.getElementsByTagName('*');
            for (let element of elements) {
                attributeCount += element.attributes.length;
            }
            analysis.attributes = attributeCount;
            
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
    function minifyXMLAdvanced(code, options = {}) {
        const {
            removeComments: shouldRemoveComments = true,
            removeProcessingInstructions: shouldRemovePI = false,
            removeEmptyElements = false,
            sortAttributes = false,
            preserveWhitespace = false
        } = options;

        if (!code || typeof code !== 'string') {
            return '';
        }

        let result = code;

        // Remove comments if requested
        if (shouldRemoveComments) {
            result = removeComments(result);
        }

        // Remove processing instructions if requested
        if (shouldRemovePI) {
            result = removeProcessingInstructions(result);
        }

        // Apply basic minification
        if (!preserveWhitespace) {
            result = basicMinification(result);
        }

        // Additional processing if DOM manipulation is needed
        if (removeEmptyElements || sortAttributes) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(result, 'text/xml');
                
                if (removeEmptyElements) {
                    removeEmptyElementsFromDOM(doc);
                }
                
                if (sortAttributes) {
                    sortAttributesInDOM(doc);
                }
                
                result = new XMLSerializer().serializeToString(doc);
                
                // Clean up serializer output
                result = result.replace(/>\s+</g, '><');
            } catch (error) {
                // If DOM processing fails, return the basic minified version
            }
        }

        return result;
    }

    // Remove empty elements from DOM
    function removeEmptyElementsFromDOM(doc) {
        const elements = doc.getElementsByTagName('*');
        const toRemove = [];
        
        for (let element of elements) {
            if (!element.hasChildNodes() && element.attributes.length === 0) {
                toRemove.push(element);
            }
        }
        
        toRemove.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }

    // Sort attributes in DOM elements
    function sortAttributesInDOM(doc) {
        const elements = doc.getElementsByTagName('*');
        
        for (let element of elements) {
            if (element.attributes.length > 1) {
                const attrs = [];
                for (let attr of element.attributes) {
                    attrs.push({ name: attr.name, value: attr.value });
                }
                
                // Sort attributes by name
                attrs.sort((a, b) => a.name.localeCompare(b.name));
                
                // Remove all attributes
                while (element.attributes.length > 0) {
                    element.removeAttribute(element.attributes[0].name);
                }
                
                // Add sorted attributes back
                attrs.forEach(attr => {
                    element.setAttribute(attr.name, attr.value);
                });
            }
        }
    }

    // Expose the main minify function globally
    window.minifyXML = minifyXML;
    
    // Expose additional utility functions
    window.minifyXMLWithComments = minifyXMLWithComments;
    window.minifyXMLAdvanced = minifyXMLAdvanced;
    window.prettifyXML = prettifyXML;
    window.validateXML = validateXML;
    window.analyzeXML = analyzeXML;
    window.removeXMLComments = removeComments;

})();
