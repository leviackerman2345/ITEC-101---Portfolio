
/* -------------------------------------------------------------------------- */
/*                               Playground Logic                             */
/* -------------------------------------------------------------------------- */

// Tool Switching Logic
function switchTool(toolId) {
    // Update Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (btn.dataset.tool === toolId) {
            // Active State
            btn.classList.add('active', 'text-brand-blue', 'bg-brand-blue/10');
            btn.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
        } else {
            // Inactive State
            btn.classList.remove('active', 'text-brand-blue', 'bg-brand-blue/10');
            btn.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
        }
    });

    // Update Content
    document.querySelectorAll('.tool-content').forEach(content => {
        if (content.id === `tool-${toolId}`) {
            content.classList.remove('hidden');
            // Trigger a refresh for specific tools if needed
            if (toolId === 'compiler') runCode();
        } else {
            content.classList.add('hidden');
        }
    });
}

// Compiler Logic
const templates = {
    web: `<div class="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-4">
  <div class="p-8 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 shadow-2xl transform hover:scale-105 transition-transform">
    <h1 class="text-3xl font-bold mb-2">Hello World!</h1>
    <p class="text-white/80">Edit this code to see changes live.</p>
    <button class="mt-4 px-4 py-2 bg-white text-purple-600 rounded-lg font-bold" onclick="alert('It works!')">Click Me</button>
  </div>
</div>`,
    csharp: `using System;

namespace Playground
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Enter your name: ");
            string name = Console.ReadLine();
            Console.WriteLine($"Hello, {name}!");
        }
    }
}`
};

// Autocomplete / Predictive Text Logic
const keywords = {
    web: [
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input', 'form', 'img', 'a', 'ul', 'li', 'section', 'nav', 'footer', 'header', 'br', 'hr',
        'class', 'id', 'style', 'script', 'onclick', 'src', 'href', 'type', 'placeholder', 'value',
        'flex', 'grid', 'text-white', 'bg-slate-900', 'rounded', 'p-4', 'm-4'
    ],
    csharp: ['Console', 'WriteLine', 'ReadLine', 'string', 'int', 'var', 'if', 'else', 'for', 'foreach', 'return', 'class', 'void', 'static', 'public', 'private', 'namespace', 'using']
};

function initAutocomplete() {
    const editor = document.getElementById('code-input');
    const strip = document.getElementById('suggestion-strip');
    
    // Input Event for showing suggestions
    editor.addEventListener('input', (e) => {
        const lang = document.getElementById('compiler-lang').value;
        const text = editor.value;
        const cursorPos = editor.selectionStart;
        
        // Get current word being typed
        const left = text.slice(0, cursorPos);
        const wordMatch = left.match(/([a-zA-Z0-9_-]+)$/);
        
        if (wordMatch) {
            const currentWord = wordMatch[1];
            const suggestions = keywords[lang].filter(k => k.toLowerCase().startsWith(currentWord.toLowerCase()) && k !== currentWord);
            
            if (suggestions.length > 0) {
                showSuggestions(suggestions, currentWord);
            } else {
                strip.classList.add('hidden');
            }
        } else {
            strip.classList.add('hidden');
        }
    });

    // Keydown Event for Enter Key Completion
    editor.addEventListener('keydown', (e) => {
        if (!strip.classList.contains('hidden') && strip.children.length > 0) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent newline
                // Select the first suggestion (or currently highlighted one if we added navigation)
                const firstSuggestion = strip.children[0].textContent;
                
                // We need to find the current word again to replace it
                const text = editor.value;
                const cursorPos = editor.selectionStart;
                const left = text.slice(0, cursorPos);
                const wordMatch = left.match(/([a-zA-Z0-9_-]+)$/);
                
                if (wordMatch) {
                    insertSuggestion(firstSuggestion, wordMatch[1]);
                }
            }
        }
    });
}

function showSuggestions(suggestions, currentWord) {
    const strip = document.getElementById('suggestion-strip');
    strip.innerHTML = '';
    strip.classList.remove('hidden');
    
    suggestions.forEach((s, index) => {
        const btn = document.createElement('div');
        // VS Code style suggestion item
        btn.className = `px-3 py-1 text-xs font-mono cursor-pointer flex items-center gap-2 ${index === 0 ? 'bg-[#094771] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`;
        
        // Icon based on type (simplified)
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-cube text-xs opacity-70';
        
        const text = document.createElement('span');
        text.textContent = s;
        
        btn.appendChild(icon);
        btn.appendChild(text);
        
        btn.onclick = () => insertSuggestion(s, currentWord);
        strip.appendChild(btn);
    });
}

function insertSuggestion(suggestion, currentWord) {
    const editor = document.getElementById('code-input');
    const cursorPos = editor.selectionStart;
    const text = editor.value;
    const lang = document.getElementById('compiler-lang').value;
    
    const before = text.slice(0, cursorPos - currentWord.length);
    const after = text.slice(cursorPos);
    
    // Check if user typed '<' before the word
    const isTagStart = before.trim().endsWith('<');
    
    let insertion = suggestion;
    let cursorOffset = suggestion.length;

    if (lang === 'web') {
        const htmlTags = ['div', 'span', 'button', 'form', 'script', 'style', 'p', 'h1', 'h2', 'h3', 'a', 'ul', 'li', 'section', 'nav', 'footer', 'header'];
        const selfClosingTags = ['input', 'img', 'br', 'hr', 'link', 'meta'];
        const attributes = ['class', 'id', 'style', 'onclick', 'src', 'href', 'type', 'placeholder', 'value'];

        if (htmlTags.includes(suggestion)) {
            if (isTagStart) {
                // Context: <di| -> <div>|</div>
                insertion = `${suggestion}></${suggestion}>`;
                cursorOffset = suggestion.length + 1; 
            } else {
                // Context: di| -> <div>|</div>
                insertion = `<${suggestion}></${suggestion}>`;
                cursorOffset = suggestion.length + 2;
            }
        } else if (selfClosingTags.includes(suggestion)) {
            if (isTagStart) {
                // Context: <in| -> <input |/>
                insertion = `${suggestion} />`;
                cursorOffset = suggestion.length + 1;
            } else {
                // Context: in| -> <input |/>
                insertion = `<${suggestion} />`;
                cursorOffset = suggestion.length + 2;
            }
        } else if (attributes.includes(suggestion)) {
            insertion = `${suggestion}=""`;
            cursorOffset = suggestion.length + 2; // class="|"
        }
    } else if (lang === 'csharp') {
        if (['WriteLine', 'ReadLine', 'Write'].includes(suggestion)) {
            insertion = `${suggestion}()`;
            cursorOffset = suggestion.length + 1; // WriteLine(|)
        }
    }
    
    editor.value = before + insertion + after;
    
    // Restore cursor and hide strip
    const newCursorPos = before.length + cursorOffset;
    editor.setSelectionRange(newCursorPos, newCursorPos);
    editor.focus();
    document.getElementById('suggestion-strip').classList.add('hidden');
    
    // Trigger run for web
    if(document.getElementById('compiler-lang').value === 'web') runCode();
}

function switchCompilerLang() {
    const lang = document.getElementById('compiler-lang').value;
    const editor = document.getElementById('code-input');
    const filename = document.getElementById('editor-filename');
    
    if (lang === 'web') {
        editor.value = templates.web;
        filename.textContent = 'index.html';
    } else {
        editor.value = templates.csharp;
        filename.textContent = 'Program.cs';
    }
    runCode();
}

// C# Execution State
let csharpState = {
    lines: [],
    currentLineIndex: 0,
    variables: {},
    output: [],
    waitingForInput: false
};

// Input History to remember user inputs between runs
const inputHistory = {};

function runCode() {
    const lang = document.getElementById('compiler-lang').value;
    const code = document.getElementById('code-input').value;
    const preview = document.getElementById('code-preview');
    const doc = preview.contentDocument || preview.contentWindow.document;
    
    doc.open();
    
    if (lang === 'web') {
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { margin: 0; padding: 0; font-family: sans-serif; }
                    ::-webkit-scrollbar { width: 8px; }
                    ::-webkit-scrollbar-track { background: #f1f1f1; }
                    ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #555; }
                </style>
            </head>
            <body>
                ${code}
            </body>
            </html>
        `);
        doc.close();
    } else {
        // Initialize C# Execution
        csharpState = {
            lines: code.split('\n'),
            currentLineIndex: 0,
            variables: {},
            output: [],
            waitingForInput: false
        };
        
        // Start execution loop
        executeCSharpStep(doc);
    }
}


// Expose to window for iframe access
window.handleTerminalInput = function(value) {
    const varName = csharpState.currentVarName;
    
    // Save to history
    inputHistory[varName] = value;
    
    csharpState.variables[varName] = value;
    
    // Replace the input field in the output array with the static text
    // The last item in output is the one with the input
    csharpState.output.pop(); 
    csharpState.output.push(`<span class="terminal-text" style="color: #ce9178">${value}</span><br>`);
    
    csharpState.waitingForInput = false;
    
    // Resume
    const preview = document.getElementById('code-preview');
    const doc = preview.contentDocument || preview.contentWindow.document;
    executeCSharpStep(doc);
};

function executeCSharpStep(doc) {
    if (csharpState.waitingForInput) return;

    while (csharpState.currentLineIndex < csharpState.lines.length) {
        let line = csharpState.lines[csharpState.currentLineIndex].trim();
        csharpState.currentLineIndex++;

        if (!line) continue;

        // Handle ReadLine Assignment: string x = Console.ReadLine();
        // Regex updated to be more flexible with spaces
        const readLineMatch = line.match(/(?:string|var)\s+(\w+)\s*=\s*Console\s*\.\s*ReadLine\s*\(\s*\)\s*;?/i);
        
        if (readLineMatch) {
            const varName = readLineMatch[1];
            csharpState.waitingForInput = true;
            csharpState.currentVarName = varName;
            
            // Add inline input
            const inputHtml = `
                <input type="text" class="terminal-input" 
                    value="${inputHistory[varName] || ''}"
                    autofocus
                    onkeydown="if(event.key==='Enter') window.parent.handleTerminalInput(this.value)"
                />`;
            csharpState.output.push(inputHtml);
            
            renderCSharpOutput(doc);
            
            // Focus the input inside the iframe
            setTimeout(() => {
                const input = doc.querySelector('.terminal-input');
                if(input) {
                    input.focus();
                    // Move cursor to end if there is a value
                    const val = input.value;
                    input.value = '';
                    input.value = val;
                }
            }, 50);
            
            return; // Pause execution
        }

        // Handle Write (No newline)
        const writeMatch = line.match(/Console\s*\.\s*Write\s*\((.*)\)\s*;?/i);
        if (writeMatch && !line.match(/Console\s*\.\s*WriteLine/i)) {
             let content = writeMatch[1];
             let result = processCSharpString(content);
             csharpState.output.push(`<span class="terminal-text">${result}</span>`);
             continue; 
        }

        // Handle WriteLine
        const writeLineMatch = line.match(/Console\s*\.\s*WriteLine\s*\((.*)\)\s*;?/i);
        if (writeLineMatch) {
             let content = writeLineMatch[1];
             let result = processCSharpString(content);
             csharpState.output.push(`<div class="terminal-line">${result}</div>`);
             continue;
        }
    }

    // Execution Finished
    if (csharpState.output.length === 0) csharpState.output.push("<div style='color: #6a9955'>// Program executed. No output.</div>");
    renderCSharpOutput(doc, true);
}

function processCSharpString(content) {
    let result = "";
    // Interpolation $"... {var} ..."
    if (content.startsWith('$')) {
        content = content.substring(2, content.length - 1);
        result = content.replace(/\{(\w+)\}/g, (m, v) => csharpState.variables[v] !== undefined ? csharpState.variables[v] : m);
    }
    // Concatenation "..." + var
    else if (content.includes('+')) {
        const parts = content.split('+');
        parts.forEach(part => {
            part = part.trim();
            if (part.startsWith('"') && part.endsWith('"')) {
                result += part.substring(1, part.length - 1);
            } else {
                result += csharpState.variables[part] !== undefined ? csharpState.variables[part] : "";
            }
        });
    }
    // Variable
    else if (csharpState.variables[content] !== undefined) {
        result = csharpState.variables[content];
    }
    // String Literal
    else if (content.startsWith('"') && content.endsWith('"')) {
        result = content.substring(1, content.length - 1);
    }
    return result;
}

function renderCSharpOutput(doc, finished = false) {
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { background: #1e1e1e; color: #d4d4d4; font-family: 'Consolas', monospace; padding: 20px; margin: 0; }
                .terminal-input {
                    background: transparent;
                    border: none;
                    color: #ce9178;
                    font-family: 'Consolas', monospace;
                    font-size: inherit;
                    outline: none;
                    width: 50%;
                }
                .terminal-line { min-height: 1.2em; }
            </style>
        </head>
        <body>
            <div style="color: #4ec9b0; margin-bottom: 10px;">> dotnet run</div>
            ${csharpState.output.join('')}
            ${finished ? '<br><div style="color: #808080; margin-top: 20px;">Process finished with exit code 0.</div>' : ''}
        </body>
        </html>
    `);
    doc.close();
}

// Border Radius Logic
function updateBorderRadius() {
    const tl = document.getElementById('input-tl').value;
    const tr = document.getElementById('input-tr').value;
    const br = document.getElementById('input-br').value;
    const bl = document.getElementById('input-bl').value;

    const value = `${tl}% ${tr}% ${br}% ${bl}%`;
    
    document.getElementById('preview-border-radius').style.borderRadius = value;
    document.getElementById('code-border-radius').textContent = `border-radius: ${value};`;
    
    document.getElementById('val-tl').textContent = `${tl}%`;
    document.getElementById('val-tr').textContent = `${tr}%`;
    document.getElementById('val-br').textContent = `${br}%`;
    document.getElementById('val-bl').textContent = `${bl}%`;
}

// Glassmorphism Logic
let glassColor = '255, 255, 255';

function setGlassColor(r, g, b) {
    glassColor = `${r}, ${g}, ${b}`;
    updateGlass();
}

function updateGlass() {
    const blur = document.getElementById('input-blur').value;
    const alpha = document.getElementById('input-alpha').value / 100;
    
    const preview = document.getElementById('preview-glass');
    
    const bg = `rgba(${glassColor}, ${alpha})`;
    const border = `1px solid rgba(255, 255, 255, ${Math.min(alpha + 0.1, 1)})`;
    const backdrop = blur > 0 ? `blur(${blur}px)` : 'none';

    preview.style.background = bg;
    preview.style.backdropFilter = backdrop;
    preview.style.webkitBackdropFilter = backdrop;
    preview.style.border = border;

    // Contrast Fix: If glass is white, use black text. If black, use white text.
    if (glassColor === '255, 255, 255') {
        preview.classList.remove('text-white');
        preview.classList.add('text-black');
        // Ensure icon is also dark
        const icon = preview.querySelector('i');
        if(icon) icon.classList.add('text-black');
    } else {
        preview.classList.add('text-white');
        preview.classList.remove('text-black');
        const icon = preview.querySelector('i');
        if(icon) icon.classList.remove('text-black');
    }

    document.getElementById('code-glass').innerHTML = `
background: ${bg};<br>
backdrop-filter: ${backdrop};<br>
-webkit-backdrop-filter: ${backdrop};<br>
border: ${border};
    `;

    document.getElementById('val-blur').textContent = `${blur}px`;
    document.getElementById('val-alpha').textContent = alpha;
}

// Gradient Logic
function updateGradient() {
    const c1 = document.getElementById('input-color1').value;
    const c2 = document.getElementById('input-color2').value;
    const angle = document.getElementById('input-angle').value;

    const value = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    
    document.getElementById('preview-gradient').style.background = value;
    document.getElementById('code-gradient').textContent = `background: ${value};`;
    
    document.getElementById('val-angle').textContent = `${angle}deg`;
}

// Transform Logic
function updateTransform() {
    const rx = document.getElementById('input-rotx').value;
    const ry = document.getElementById('input-roty').value;
    const rz = document.getElementById('input-rotz').value;
    const s = document.getElementById('input-scale').value;

    const value = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
    
    document.getElementById('preview-transform').style.transform = value;
    document.getElementById('code-transform').textContent = `transform: ${value};`;
    
    document.getElementById('val-rotx').textContent = `${rx}deg`;
    document.getElementById('val-roty').textContent = `${ry}deg`;
    document.getElementById('val-rotz').textContent = `${rz}deg`;
    document.getElementById('val-scale').textContent = s;
}

// Copy to Clipboard
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText; // innerText preserves newlines
    navigator.clipboard.writeText(text).then(() => {
        // Optional: Show feedback
        const btn = document.querySelector(`button[onclick="copyToClipboard('${elementId}')"]`);
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 2000);
    });
}

// Initialize Playground
document.addEventListener('DOMContentLoaded', () => {
    // Only init if playground exists
    if(document.getElementById('playground')) {
        initAutocomplete();
        runCode();
        updateBorderRadius();
        updateGlass();
        updateGradient();
        updateTransform();


    }
});
