/**
 * Composable pour le rendu Markdown
 * Convertit le contenu markdown en HTML sécurisé avec coloration syntaxique
 */

import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

/**
 * Configuration de marked avec highlight.js
 */
const configureMarked = () => {
  // Configuration du renderer personnalisé
  const renderer = new marked.Renderer()

  // Personnalisation du rendu des liens
  renderer.link = ({ href, title, text }) => {
    const titleAttr = title ? ` title="${title}"` : ''
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline">${text}</a>`
  }

  // Personnalisation du rendu des blocs de code
  renderer.code = ({ text, lang }) => {
    const language = lang || 'plaintext'
    let highlighted

    try {
      if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(text, { language: lang }).value
      } else {
        highlighted = hljs.highlightAuto(text).value
      }
    } catch (error) {
      console.error('Error highlighting code:', error)
      highlighted = text
    }

    return `
      <div class="code-block-wrapper my-4">
        <div class="code-block-header">
          <span class="code-block-language">${language}</span>
          <button class="code-block-copy" onclick="navigator.clipboard.writeText(\`${text.replace(/`/g, '\\`')}\`)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copier
          </button>
        </div>
        <pre class="code-block-content"><code class="hljs language-${language}">${highlighted}</code></pre>
      </div>
    `
  }

  // Personnalisation du rendu du code inline
  renderer.codespan = ({ text }) => {
    return `<code class="inline-code">${text}</code>`
  }

  // Personnalisation des tableaux
  renderer.table = ({ header, rows }) => {
    return `
      <div class="table-wrapper">
        <table class="markdown-table">
          <thead>${header}</thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
  }

  // Configuration de marked
  marked.setOptions({
    renderer,
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convertir les sauts de ligne en <br>
    pedantic: false,
    sanitize: false, // On utilise DOMPurify à la place
    smartLists: true,
    smartypants: true
  })
}

// Initialiser marked une seule fois
let isConfigured = false

/**
 * Composable pour le rendu markdown
 */
export function useMarkdown() {
  /**
   * Convertit le contenu markdown en HTML sécurisé
   * @param {string} content - Le contenu markdown à convertir
   * @returns {string} - Le HTML sécurisé
   */
  const renderMarkdown = (content) => {
    if (!content) return ''

    // Configurer marked si ce n'est pas déjà fait
    if (!isConfigured) {
      configureMarked()
      isConfigured = true
    }

    try {
      // Convertir le markdown en HTML
      const rawHtml = marked.parse(content)

      // Sanitiser le HTML pour éviter les injections XSS
      const cleanHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote',
          'a',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span',
          'img',
          'hr',
          'button', 'svg', 'path', 'rect'
        ],
        ALLOWED_ATTR: [
          'href', 'title', 'target', 'rel',
          'class',
          'src', 'alt', 'width', 'height',
          'onclick',
          'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
          'x', 'y', 'rx', 'ry', 'd'
        ],
        ALLOW_DATA_ATTR: false
      })

      return cleanHtml
    } catch (error) {
      console.error('Error rendering markdown:', error)
      return content
    }
  }

  /**
   * Extrait le texte brut d'un contenu markdown (sans balises HTML)
   * @param {string} content - Le contenu markdown
   * @returns {string} - Le texte brut
   */
  const getPlainText = (content) => {
    if (!content) return ''

    try {
      const html = renderMarkdown(content)
      const div = document.createElement('div')
      div.innerHTML = html
      return div.textContent || div.innerText || ''
    } catch (error) {
      console.error('Error extracting plain text:', error)
      return content
    }
  }

  return {
    renderMarkdown,
    getPlainText
  }
}
