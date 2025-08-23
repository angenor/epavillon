#!/bin/bash

# Script pour corriger les fichiers admin avec la nouvelle logique async

FILES=(
  "src/views/admin/events/EventCreate.vue"
  "src/views/admin/events/EventDetail.vue"
  "src/views/admin/content/ContentModeration.vue"
  "src/views/admin/communications/Communications.vue"
  "src/views/admin/activities/ActivityDetail.vue"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # 1. Ajouter l'import useI18n si pas présent
    if ! grep -q "useI18n" "$file"; then
      sed -i '' "s/import { ref/import { ref\nimport { useI18n } from 'vue-i18n'/g" "$file"
    fi
    
    # 2. Modifier la ligne hasAdminRole
    sed -i '' "s/const { hasAdminRole/const { t } = useI18n()\nconst { hasAdminRole, isLoadingRoles, loadUserRoles/g" "$file"
    
    # 3. Remplacer la vérification synchrone
    sed -i '' "/if (!hasAdminRole\.value) {/,/}/ c\\
// Vérification des permissions (attendre le chargement des rôles)\\
const checkAccess = async () => {\\
  await loadUserRoles()\\
  \\
  if (!hasAdminRole.value) {\\
    throw new Error('Accès non autorisé')\\
  }\\
}" "$file"
    
    echo "✓ $file processed"
  else
    echo "✗ File not found: $file"
  fi
done

echo "All admin files processed!"