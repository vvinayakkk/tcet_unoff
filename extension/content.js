document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
      chrome.runtime.sendMessage({
          action: 'textSelected',
          text: selectedText
      });
  }
});

const LANGUAGES = {
  "English": "en",
  "Hindi": "hi",
  "Bengali": "bn",
  "Tamil": "ta",
  "Telugu": "te",
  "Marathi": "mr",
  "Gujarati": "gu",
  "Kannada": "kn",
  "Malayalam": "ml",
  "Punjabi": "pa",
  "Urdu": "ur"
};

// Create and append the widget and dialog elements
const widget = document.createElement('div');
widget.className = 'translation-widget';
widget.innerHTML = `
  <div class="translation-widget-icon">
      <img src="${chrome.runtime.getURL('icons/icon16.png')}" width="20" height="20" alt="Translate">
  </div>
`;

const dialog = document.createElement('div');
dialog.className = 'translation-dialog';
dialog.innerHTML = `
  <h3>Translate Text</h3>
  <div>
      <label>From:</label>
      <select id="sourceLanguage">
          ${Object.keys(LANGUAGES).map(lang => 
              `<option value="${lang}">${lang}</option>`
          ).join('')}
      </select>
  </div>
  <div>
      <label>To:</label>
      <select id="targetLanguage">
          ${Object.keys(LANGUAGES).map(lang => 
              `<option value="${lang}">${lang}</option>`
          ).join('')}
      </select>
  </div>
  <div>
      <button id="translateBtn">Translate</button>
      <button id="cancelBtn">Cancel</button>
  </div>
`;

document.body.appendChild(widget);
document.body.appendChild(dialog);

let selectedText = '';

// Show widget when text is selected
document.addEventListener('mouseup', (e) => {
  selectedText = window.getSelection().toString().trim();
  if (selectedText) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      widget.style.display = 'block';
      widget.style.left = `${rect.right + window.scrollX}px`;
      widget.style.top = `${rect.top + window.scrollY}px`;
  } else {
      widget.style.display = 'none';
  }
});

// Hide widget when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (!widget.contains(e.target) && !dialog.contains(e.target)) {
      widget.style.display = 'none';
  }
});

// Show dialog when clicking widget
widget.addEventListener('click', () => {
  dialog.style.display = 'block';
  widget.style.display = 'none';
});

// Handle dialog buttons
document.getElementById('cancelBtn').addEventListener('click', () => {
  dialog.style.display = 'none';
});

document.getElementById('translateBtn').addEventListener('click', () => {
  const sourceLang = document.getElementById('sourceLanguage').value;
  const targetLang = document.getElementById('targetLanguage').value;
  
  // Send translation request to background script
  chrome.runtime.sendMessage({
      action: 'translate',
      text: selectedText,
      sourceLang: LANGUAGES[sourceLang], // Convert language name to code
      targetLang: LANGUAGES[targetLang]  // Convert language name to code
  });
  
  dialog.style.display = 'none';
});