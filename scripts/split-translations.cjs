#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration des groupes de modules
const moduleGroups = {
  'common': ['common', 'nav', 'user', 'sidebar', 'hero', 'footer', 'error'],
  'auth': ['auth'],
  'admin': ['admin'],
  'profile': ['profile', 'messaging', 'notifications'],
  'events': ['events', 'programmations', 'trainings', 'formations'],
  'activities': ['activities', 'activity'],
  'community': ['community', 'organizations', 'organizationDetail', 'organization'],
  'negotiations': ['negotiations'],
  'directory': ['directory'],
  'appointments': ['appointments']
};

function splitTranslationFile(inputFile, outputDir, lang) {
  console.log(`Processing ${inputFile}...`);
  
  // Lire le fichier JSON
  const content = fs.readFileSync(inputFile, 'utf8');
  const data = JSON.parse(content);
  
  // Créer le répertoire de sortie
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Créer les modules
  const modules = {};
  
  // Initialiser les modules
  Object.keys(moduleGroups).forEach(moduleName => {
    modules[moduleName] = {};
  });
  
  // Distribuer les sections dans les modules
  Object.keys(data).forEach(sectionKey => {
    let assigned = false;
    
    // Trouver dans quel module cette section appartient
    Object.entries(moduleGroups).forEach(([moduleName, sections]) => {
      if (sections.includes(sectionKey)) {
        modules[moduleName][sectionKey] = data[sectionKey];
        assigned = true;
      }
    });
    
    // Si non assigné, mettre dans common
    if (!assigned) {
      modules['common'][sectionKey] = data[sectionKey];
      console.log(`Warning: Section '${sectionKey}' assigned to common module`);
    }
  });
  
  // Sauvegarder les modules
  Object.entries(modules).forEach(([moduleName, moduleData]) => {
    if (Object.keys(moduleData).length > 0) {
      const outputFile = path.join(outputDir, `${moduleName}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(moduleData, null, 2), 'utf8');
      console.log(`Created ${outputFile} with ${Object.keys(moduleData).length} sections`);
    }
  });
  
  // Créer un fichier index pour référencer tous les modules
  const indexFile = path.join(outputDir, 'index.js');
  const indexContent = `// Auto-generated translation index for ${lang}
${Object.keys(modules).filter(name => Object.keys(modules[name]).length > 0).map(name => 
  `import ${name} from './${name}.json';`
).join('\n')}

export default {
${Object.keys(modules).filter(name => Object.keys(modules[name]).length > 0).map(name => 
  `  ...${name},`
).join('\n')}
};
`;
  
  fs.writeFileSync(indexFile, indexContent, 'utf8');
  console.log(`Created ${indexFile}`);
}

// Traitement des fichiers
const localesDir = path.join(__dirname, '..', 'src', 'locales');

// Français
splitTranslationFile(
  path.join(localesDir, 'fr.json'),
  path.join(localesDir, 'fr'),
  'fr'
);

// Anglais
splitTranslationFile(
  path.join(localesDir, 'en.json'),
  path.join(localesDir, 'en'),
  'en'
);

console.log('Translation files split successfully!');