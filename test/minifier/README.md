# Minifier Testing Protocol Usage Guide

This guide explains step-by-step how to use both the browser-based and terminal-based minifier testers.

---

## Browser (HTML/JavaScript) Minifier Tester

1. **Open** the HTML file (e.g. `index.html`) in your web browser.
2. **Paste your minifier function** in the "Minifier Code" editor.
    - Example:
      ```javascript
      function minifier(code) {
          return code.replace(/\s+/g, '');
      }
      ```
3. **Paste the code to minify** in the "Input Code" editor.
4. **Run the minifier** by clicking "Run Minifier" or using Ctrl+Enter / Cmd+Enter.
5. **View minified output and stats** in the "Minified Output" section.
    - Stats include byte sizes, reduction %, execution time, and function used.
6. Use "Copy" or "Clear" buttons as needed.

---

## Terminal (Shell/Node.js) Minifier Tester

1. Ensure you have Node.js installed.
2. In your terminal, run:
    ```sh
    bash minifier-tester.sh
    ```
3. **Paste your JS minifier function**, then type `EOF` on a line by itself.
    ```javascript
    function minifier(code) {
        return code.replace(/\s+/g, '');
    }
    EOF
    ```
4. **Paste code to be minified**, then type `EOF`.
5. The script runs your minifier and displays the minified output and stats in the terminal.
6. If there's an error, a detailed message appears so you can correct the problem.

---

## Tips

- The minifier function must be named `minifier` or a common name like `minify`.
- Your function should accept a string and return a string.
- Use `EOF` lines to signal the end of your pasted input in the shell tester.
- Node.js is required for the shell version; a modern browser is required for the HTML version.

---

## Example

### Minifier Function

```javascript
function minifier(code) {
return code.replace(/\s+/g, '');
}
```


### Typical Input

```javascript
{
"name": "test"
}
```
