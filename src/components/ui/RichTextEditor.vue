<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="toolbar border border-gray-300 dark:border-gray-600 rounded-t-xl bg-gray-50 dark:bg-gray-700 p-3 flex flex-wrap gap-2">
      <!-- Bold -->
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="toolbar-button"
        type="button"
        title="Gras"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>

      <!-- Italic -->
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="toolbar-button"
        type="button"
        title="Italique"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4l4 16M6 10l2-2 2 2M6 14l2 2 2-2"></path>
        </svg>
      </button>

      <!-- Highlight -->
      <button
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ 'is-active': editor.isActive('highlight') }"
        class="toolbar-button"
        type="button"
        title="Surligner"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l3 3L21 5l-3-3-9 9zM3 21l3-3 9-9"/>
          <rect x="2" y="18" width="20" height="3" rx="1" fill="currentColor" opacity="0.3"/>
        </svg>
      </button>

      <!-- Divider -->
      <div class="border-l border-gray-300 dark:border-gray-600 mx-1"></div>

      <!-- Bullet List -->
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="toolbar-button"
        type="button"
        title="Liste à puces"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      </button>

      <!-- Ordered List -->
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="toolbar-button"
        type="button"
        title="Liste numérotée"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18"></path>
        </svg>
      </button>

      <!-- Divider -->
      <div class="border-l border-gray-300 dark:border-gray-600 mx-1"></div>

      <!-- Text Align Left -->
      <button
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        class="toolbar-button"
        type="button"
        title="Aligner à gauche"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h12M3 18h18"></path>
        </svg>
      </button>

      <!-- Text Align Center -->
      <button
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        class="toolbar-button"
        type="button"
        title="Centrer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M7 12h10M3 18h18"></path>
        </svg>
      </button>

      <!-- Text Align Right -->
      <button
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        class="toolbar-button"
        type="button"
        title="Aligner à droite"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 12h12M3 18h18"></path>
        </svg>
      </button>

      <!-- Divider -->
      <div class="border-l border-gray-300 dark:border-gray-600 mx-1"></div>

      <!-- Add/Edit Link -->
      <button
        @click="openLinkDialog"
        :class="{ 'is-active': editor.isActive('link') }"
        class="toolbar-button"
        type="button"
        title="Ajouter/Modifier un lien"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </button>

      <!-- Remove Link -->
      <button
        @click="unsetLink"
        :disabled="!editor.isActive('link')"
        class="toolbar-button"
        :class="{ 'opacity-50 cursor-not-allowed': !editor.isActive('link') }"
        type="button"
        title="Supprimer le lien"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6"></path>
        </svg>
      </button>

      <!-- Divider -->
      <div class="border-l border-gray-300 dark:border-gray-600 mx-1"></div>

      <!-- Clear Format -->
      <button
        @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
        class="toolbar-button"
        type="button"
        title="Effacer le formatage"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Editor Content -->
    <EditorContent 
      :editor="editor" 
      class="editor-content rounded-b-xl bg-white dark:bg-gray-800 min-h-[150px] transition-all duration-200"
      :class="{
        'border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-green-500 dark:focus-within:ring-green-400 focus-within:border-transparent': !isLimitExceeded,
        'border border-red-300 dark:border-red-600 focus-within:ring-2 focus-within:ring-red-500 dark:focus-within:ring-red-400 focus-within:border-transparent': isLimitExceeded
      }"
    />

    <!-- Character Count and Progress -->
    <div v-if="showCharacterCount" class="mt-2">
      <!-- Progress Bar -->
      <div v-if="maxLength" class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
        <div 
          class="h-1.5 rounded-full transition-all duration-300"
          :class="{
            'bg-green-500': characterCount < maxLength * 0.8,
            'bg-orange-500': characterCount >= maxLength * 0.8 && characterCount < maxLength,
            'bg-red-500': characterCount >= maxLength
          }"
          :style="{ width: Math.min((characterCount / maxLength) * 100, 100) + '%' }"
        ></div>
      </div>
      
      <!-- Character Count Text -->
      <div class="text-right">
        <span 
          class="text-xs transition-colors duration-200"
          :class="{
            'text-gray-500 dark:text-gray-400': !isLimitExceeded && remainingCharacters > 100,
            'text-orange-600 dark:text-orange-400': remainingCharacters <= 100 && remainingCharacters > 0,
            'text-red-600 dark:text-red-400': isLimitExceeded
          }"
        >
          {{ characterCount }} 
          <span v-if="maxLength">/ {{ maxLength }}</span>
          caractères
          <span v-if="remainingCharacters !== null && remainingCharacters >= 0" class="ml-1">
            ({{ remainingCharacters }} restants)
          </span>
          <span v-else-if="isLimitExceeded" class="ml-1 font-medium">
            ({{ Math.abs(remainingCharacters) }} en trop)
          </span>
        </span>
      </div>
    </div>

    <!-- Link Dialog -->
    <div v-if="showLinkDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ editor?.isActive('link') ? 'Modifier le lien' : 'Ajouter un lien' }}
        </h3>
        
        <div class="mb-4">
          <label for="link-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL du lien
          </label>
          <input
            id="link-url"
            v-model="linkUrl"
            type="url"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="https://exemple.com"
            @keydown.enter="setLink"
            @keydown.escape="showLinkDialog = false"
          />
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showLinkDialog = false"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            @click="setLink"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
          >
            {{ editor?.isActive('link') ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import { watch, computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Commencez à écrire...'
  },
  showCharacterCount: {
    type: Boolean,
    default: true
  },
  maxLength: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['update:modelValue'])

// État pour la gestion des liens
const showLinkDialog = ref(false)
const linkUrl = ref('')

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      },
      link: false, // Désactiver le link du StarterKit pour éviter la duplication
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer',
      },
    }),
    Highlight.configure({
      multicolor: true,
    }),
    CharacterCount.configure({
      limit: props.maxLength,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none px-4 py-3 text-gray-900 dark:text-white min-h-[120px] font-sans',
      style: 'font-family: inherit;'
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

const characterCount = computed(() => {
  if (!editor.value) return 0
  return editor.value.storage.characterCount?.characters() || 0
})

const isLimitExceeded = computed(() => {
  return props.maxLength && characterCount.value > props.maxLength
})

const remainingCharacters = computed(() => {
  return props.maxLength ? props.maxLength - characterCount.value : null
})

// Fonctions de gestion des liens
const setLink = () => {
  const url = linkUrl.value
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
  showLinkDialog.value = false
  linkUrl.value = ''
}

const unsetLink = () => {
  editor.value.chain().focus().unsetLink().run()
}

const openLinkDialog = () => {
  const previousUrl = editor.value.getAttributes('link').href
  linkUrl.value = previousUrl || ''
  showLinkDialog.value = true
  // Focus sur le champ URL après l'ouverture de la dialog
  setTimeout(() => {
    const urlInput = document.getElementById('link-url')
    if (urlInput) {
      urlInput.focus()
      urlInput.select()
    }
  }, 100)
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

// Cleanup
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.toolbar-button {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  color: #374151;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-button:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.dark .toolbar-button {
  color: #d1d5db;
}

.dark .toolbar-button:hover {
  background-color: #4b5563;
  border-color: #4b5563;
}

.toolbar-button.is-active {
  background-color: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
}

.dark .toolbar-button.is-active {
  background-color: rgba(20, 83, 45, 0.3);
  color: #4ade80;
  border-color: #15803d;
}

:deep(.ProseMirror) {
  outline: none;
  font-family: inherit;
}

:deep(.ProseMirror p) {
  margin: 0.5rem 0;
}

:deep(.ProseMirror p:first-child) {
  margin-top: 0;
}

:deep(.ProseMirror p:last-child) {
  margin-bottom: 0;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.ProseMirror li) {
  margin: 0.25rem 0;
}

:deep(.ProseMirror strong) {
  font-weight: 600;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror a) {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

:deep(.ProseMirror a:hover) {
  color: #1d4ed8;
}

.dark :deep(.ProseMirror a) {
  color: #60a5fa;
}

.dark :deep(.ProseMirror a:hover) {
  color: #93c5fd;
}

:deep(.ProseMirror mark) {
  background-color: #fef08a;
  color: #854d0e;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.dark :deep(.ProseMirror mark) {
  background-color: #fbbf24;
  color: #451a03;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.dark :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #6b7280;
}
</style>