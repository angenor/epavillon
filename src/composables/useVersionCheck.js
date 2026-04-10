import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const CHECK_INTERVAL = 2 * 60 * 1000 // Vérifier toutes les 2 minutes
const VERSION_URL = '/version.json'

// État partagé (singleton)
const showUpdateModal = ref(false)
const dismissed = ref(false)
const pendingUpdate = ref(false) // Mise à jour en attente (utilisateur a cliqué "Plus tard")

/**
 * Vérifie périodiquement si une nouvelle version de l'app est déployée.
 * Affiche un modal non-bloquant pour proposer le rechargement.
 * Si l'utilisateur refuse, recharge automatiquement au prochain changement de page.
 */
export function useVersionCheck() {
  let timer = null
  let currentVersion = null
  const router = useRouter()

  async function checkVersion() {
    if (showUpdateModal.value) return

    try {
      const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) return

      const data = await res.json()
      if (!data?.version) return

      if (currentVersion === null) {
        currentVersion = data.version
      } else if (data.version !== currentVersion) {
        showUpdateModal.value = true
      }
    } catch {
      // Silencieux
    }
  }

  function acceptUpdate() {
    window.location.reload()
  }

  function dismissUpdate() {
    showUpdateModal.value = false
    dismissed.value = true
    pendingUpdate.value = true
    // Re-proposer le modal dans 10 minutes si toujours sur la même page
    setTimeout(() => { dismissed.value = false }, 10 * 60 * 1000)
  }

  // Recharger automatiquement au changement de page si mise à jour en attente
  watch(() => router.currentRoute.value.path, () => {
    if (pendingUpdate.value) {
      window.location.reload()
    }
  })

  onMounted(() => {
    checkVersion()
    timer = setInterval(() => {
      if (!dismissed.value) checkVersion()
    }, CHECK_INTERVAL)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { showUpdateModal, acceptUpdate, dismissUpdate }
}
