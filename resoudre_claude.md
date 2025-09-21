# Supprimer le package existant
sudo rm -rf /usr/local/lib/node_modules/@anthropic-ai/claude-code
sudo rm -rf /usr/local/lib/node_modules/@anthropic-ai/.claude-code-*

# Réinstaller Claude Code
sudo npm install -g @anthropic-ai/claude-code
