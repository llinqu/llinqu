# llinqu - Universal Code Minifier Library

[llinqu](https://github.com/llinqu/llinqu) is a lightweight, zero-dependency JavaScript library that provides minification utilities for several programming and markup languages. It safely removes comments, unnecessary whitespace, and performs basic optimizations to reduce code size.

## Supported Languages

* JavaScript
* CSS
* HTML
* JSON
* PHP
* Python
* SQL
* XML
* Universal (generic comment and whitespace remover)

## Installation

Include the library in your HTML file:

```javascript
<script src="llinqu.js"></script>
```

Or install and import it in Node.js:

```javascript
const llinqu = require('llinqu');
```

## Usage

Minify code for a specific language by calling:

```javascript
const minifiedJs = llinqu.javascript(jsCode);
const minifiedCss = llinqu.css(cssCode);
const minifiedHtml = llinqu.html(htmlCode);
```

## API Overview

Main Minify Functions

All languages are accessible under llinqu namespace as functions:

```javascript
llinqu.javascript(code);
llinqu.css(code);
llinqu.html(code);
llinqu.json(code);
llinqu.php(code);
llinqu.python(code);
llinqu.sql(code);
llinqu.xml(code);
llinqu.universal(code);
```

## Additional Utilities

Selected languages offer helpful utilities:

```javascript
llinqu.json.prettify(jsonCode);
llinqu.json.validate(jsonCode);
llinqu.python.validate(pythonCode);
llinqu.sql.analyze(sqlCode);
llinqu.xml.prettify(xmlCode);
```

**Example**

```javascript
const rawJs = // Example JavaScript function add(a, b) { return a + b; // returns sum };

const minified = llinqu.javascript(rawJs);
console.log(minified);
// Outputs: function add(a,b){return a+b;}
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit pull requests.
