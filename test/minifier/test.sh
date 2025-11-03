#!/bin/bash

# Minifier Testing Protocol in Shell

echo "========================================"
echo "         Minifier Testing Protocol       "
echo "========================================"
echo ""
echo "Step 1: Paste your minifier function JavaScript code."
echo "It should export a function named 'minifier'."
echo "Example: function minifier(code) { return code.trim(); }"
echo "End your input with a line containing only 'EOF'."
echo ""

MINIFIER_CODE=""
while IFS= read -r line; do
    [[ "$line" == "EOF" ]] && break
    MINIFIER_CODE+="$line"$'\n'
done

echo ""
echo "Step 2: Paste the code you want to minify."
echo "End your input with a line containing only 'EOF'."
INPUT_CODE=""
while IFS= read -r line; do
    [[ "$line" == "EOF" ]] && break
    INPUT_CODE+="$line"$'\n'
done

# Write minifier JS code to temp file
MINIFIER_JS="$(mktemp --suffix=.js)"
echo "$MINIFIER_CODE" > "$MINIFIER_JS"

# Append test execution code
cat <<'EOF' >> "$MINIFIER_JS"
// Terminal Minifier Tester
const fs = require('fs');

const inputRaw = process.env.MINIFIER_INPUT || '';
let minified = '';
let functionUsed = '';
let start = Date.now();

try {
    // Find minifier function
    let fn = null;
    if (typeof minifier === 'function') fn = minifier, functionUsed = 'minifier';
    // Try common names
    else if (typeof minify === 'function') fn = minify, functionUsed = 'minify';
    else if (typeof llinquMinifyJSON === 'function') fn = llinquMinifyJSON, functionUsed = 'llinquMinifyJSON';
    else if (typeof minifyJSON === 'function') fn = minifyJSON, functionUsed = 'minifyJSON';
    else if (typeof minifyCode === 'function') fn = minifyCode, functionUsed = 'minifyCode';

    if (!fn) throw new Error('No function found named minifier/minify/minifyJSON/etc.');

    start = Date.now();
    minified = fn(inputRaw);
    let end = Date.now();

    if (typeof minified !== 'string') throw new Error('Minifier must return a string.');

    let origSize = Buffer.byteLength(inputRaw, 'utf8');
    let minSize = Buffer.byteLength(minified, 'utf8');
    let reduction = origSize > 0 ? ((1 - minSize / origSize) * 100).toFixed(1) : 0;
    let execTime = (end - start);

    console.log("========================================");
    console.log("Minified Output:");
    console.log("----------------------------------------");
    console.log(minified);
    console.log("----------------------------------------");
    console.log(`Original: ${origSize} bytes | Minified: ${minSize} bytes | Reduction: ${reduction}%`);
    console.log(`Execution Time: ${execTime} ms | Used Function: ${functionUsed}`);
    console.log("========================================");
} catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
}
EOF

# Run Node.js with the input code passed in via env.
MINIFIER_INPUT="$INPUT_CODE" node "$MINIFIER_JS"

# Clean up temp file
rm "$MINIFIER_JS"
