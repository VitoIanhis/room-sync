#!/usr/bin/env bash
# =============================================================================
# setup-project.sh - RoomSync | Criação automatizada do Board no GitHub
# =============================================================================
#
# ENTREGÁVEIS (plano de execução):
#   E1. Validação do ambiente (gh, jq, autenticação)
#   E2. Obtenção dinâmica de owner/repo e ownerId (GraphQL)
#   E3. Criação do Project v2 "RoomSync - Planejamento TCC"
#   E4. Criação do campo SINGLE_SELECT "Status" e opções AC1, AC2, AC3, Final
#   E5. Criação das 20 issues (gh issue create) e captura de IDs
#   E6. Associação de cada issue ao Project (addProjectV2ItemById)
#   E7. Definição do campo Status por issue (updateProjectV2ItemFieldValue)
#
# Requisitos: gh (GitHub CLI), jq | Git Bash ou WSL
# Uso: chmod +x setup-project.sh && ./setup-project.sh
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Windows (Git Bash): PATH do sistema nem sempre inclui onde winget instala
# gh e jq. Incluir aqui para o script funcionar sem reiniciar o terminal.
# -----------------------------------------------------------------------------
if [ -n "$MSYSTEM" ] || [ "${OSTYPE#*msys}" != "$OSTYPE" ]; then
  for dir in \
    "/c/Program Files/GitHub CLI" \
    "/c/Program Files (x86)/GitHub CLI" \
    "/c/Program Files/jq" \
    "/c/Program Files (x86)/jq"; do
    [ -d "$dir" ] && export PATH="$dir:$PATH"
  done
  if [ -n "$USERNAME" ]; then
    WINGET_LINKS="/c/Users/$USERNAME/AppData/Local/Microsoft/WinGet/Links"
    [ -d "$WINGET_LINKS" ] && export PATH="$WINGET_LINKS:$PATH"
  fi
  # jq (jqlang.jq) pelo winget pode estar em WindowsApps ou WinGet/Packages
  for base in "/c/Program Files/WindowsApps" "/c/Users/$USERNAME/AppData/Local/Microsoft/WinGet/Packages"; do
    [ ! -d "$base" ] && continue
    for dir in "$base"/jqlang.jq*; do
      [ -d "$dir" ] && [ -x "$dir/jq.exe" ] && export PATH="$dir:$PATH" && break 2
    done
  done
  # Última tentativa: usar o PATH do Windows (cmd) onde o winget já colocou jq
  if ! command -v jq >/dev/null 2>&1; then
    JQ_WIN=$(cmd.exe //c "where jq" 2>/dev/null | head -1 | tr -d '\r')
    if [ -n "$JQ_WIN" ]; then
      JQ_UNIX=$(echo "$JQ_WIN" | sed 's|\\|/|g')
      JQ_DIR="${JQ_UNIX%/*}"
      [ "${#JQ_DIR}" -ge 2 ] && JQ_DIR="/${JQ_DIR:0:1,,}${JQ_DIR:2}"
      [ -d "$JQ_DIR" ] && export PATH="$JQ_DIR:$PATH"
    fi
  fi
fi

# -----------------------------------------------------------------------------
# Constantes (nomes/títulos apenas; IDs são obtidos dinamicamente)
# -----------------------------------------------------------------------------
PROJECT_TITLE="RoomSync - Planejamento TCC"
FIELD_NAME="Status"
FIELD_OPTIONS=("AC1" "AC2" "AC3" "Final")

# -----------------------------------------------------------------------------
# 1. Validação do ambiente
# -----------------------------------------------------------------------------
echo "[1/7] Verificando dependências (gh, jq)..."

command -v gh >/dev/null 2>&1 || { echo "Erro: 'gh' (GitHub CLI) não encontrado. Instale e faça 'gh auth login --scopes project'."; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "Erro: 'jq' não encontrado. Instale jq para parsear JSON."; exit 1; }

if ! gh auth status >/dev/null 2>&1; then
  echo "Erro: Não autenticado no GitHub. Execute: gh auth login --scopes project"
  exit 1
fi

# -----------------------------------------------------------------------------
# 2. Obter owner e nome do repositório atual
# -----------------------------------------------------------------------------
echo "[2/7] Obtendo repositório atual..."

NAME_WITH_OWNER=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null) || {
  echo "Erro: Não foi possível obter o repositório. Execute este script de dentro de um repo com 'gh' configurado."
  exit 1
}

REPO_OWNER="${NAME_WITH_OWNER%%/*}"
REPO_NAME="${NAME_WITH_OWNER#*/}"
echo "      Repositório: $REPO_OWNER / $REPO_NAME"

# -----------------------------------------------------------------------------
# 3. Obter ownerId (node ID do dono do repo: User ou Organization)
# -----------------------------------------------------------------------------
echo "[3/7] Obtendo ownerId (GraphQL)..."

OWNER_ID=$(gh api graphql -f query='
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      owner { id }
    }
  }
' -f owner="$REPO_OWNER" -f name="$REPO_NAME" | jq -r '.data.repository.owner.id')

if [ -z "$OWNER_ID" ] || [ "$OWNER_ID" = "null" ]; then
  echo "Erro: Não foi possível obter o ownerId do repositório."
  exit 1
fi
echo "      ownerId obtido."

# -----------------------------------------------------------------------------
# 4. Criar Project v2
# -----------------------------------------------------------------------------
echo "[4/7] Criando Project v2: $PROJECT_TITLE..."

PROJECT_RESPONSE=$(gh api graphql -f query='
  mutation($ownerId: ID!, $title: String!) {
    createProjectV2(input: { ownerId: $ownerId, title: $title }) {
      projectV2 { id }
    }
  }
' -f ownerId="$OWNER_ID" -f title="$PROJECT_TITLE")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.createProjectV2.projectV2.id')
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
  echo "Erro: Falha ao criar o project. Resposta: $PROJECT_RESPONSE"
  exit 1
fi
echo "      projectId: $PROJECT_ID"

# -----------------------------------------------------------------------------
# 5. Criar campo SINGLE_SELECT "Status" com opções AC1, AC2, AC3, Final
# -----------------------------------------------------------------------------
echo "[5/7] Criando campo '$FIELD_NAME' com opções: ${FIELD_OPTIONS[*]}..."

# Montar JSON das opções: [ { "name": "AC1" }, ... ] e enviar corpo completo
# (gh -f envia variáveis complexas como string; usar jq + stdin garante array)
OPTIONS_JSON=$(printf '%s\n' "${FIELD_OPTIONS[@]}" | jq -R . | jq -s 'map({ name: . })')
CREATE_FIELD_QUERY='mutation($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]) {
  createProjectV2Field(input: { projectId: $projectId, name: $name, dataType: SINGLE_SELECT, singleSelectOptions: $options }) {
    projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
  }
}'
FIELD_BODY=$(jq -n \
  --arg q "$CREATE_FIELD_QUERY" \
  --arg pid "$PROJECT_ID" \
  --arg n "$FIELD_NAME" \
  --argjson opts "$OPTIONS_JSON" \
  '{query: $q, variables: {projectId: $pid, name: $n, options: $opts}}')
FIELD_RESPONSE=$(echo "$FIELD_BODY" | gh api graphql --input -)

FIELD_ID=$(echo "$FIELD_RESPONSE" | jq -r '.data.createProjectV2Field.projectV2Field.id')
if [ -z "$FIELD_ID" ] || [ "$FIELD_ID" = "null" ]; then
  echo "Erro: Falha ao criar o campo Status. Resposta: $FIELD_RESPONSE"
  exit 1
fi

# Extrair optionId para cada nome de coluna (sem valores hardcoded)
get_option_id() {
  echo "$FIELD_RESPONSE" | jq -r --arg n "$1" '.data.createProjectV2Field.projectV2Field.options[] | select(.name == $n) | .id'
}
OPTION_ID_AC1=$(get_option_id "AC1")
OPTION_ID_AC2=$(get_option_id "AC2")
OPTION_ID_AC3=$(get_option_id "AC3")
OPTION_ID_FINAL=$(get_option_id "Final")

echo "      fieldId obtido. Opções: AC1=$OPTION_ID_AC1, AC2=$OPTION_ID_AC2, AC3=$OPTION_ID_AC3, Final=$OPTION_ID_FINAL"

# -----------------------------------------------------------------------------
# 6. Definir lista de issues: título e coluna (Status) de cada uma
# -----------------------------------------------------------------------------
# Arrays paralelos: um título por issue e o status correspondente
TITLES=(
  "Configurar projeto Node + Express"
  "Criar tabela usuarios"
  "Criar tabela salas"
  "Implementar POST /register"
  "Implementar POST /login"
  "Implementar middleware JWT"
  "Criar página /login"
  "Criar página /register"
  "Criar página /salas"
  "Criar tabela reservas"
  "Implementar POST /reservas"
  "Implementar GET /reservas"
  "Criar página /reservas"
  "Implementar validação de conflito de horário"
  "Criar DELETE /reservas/:id"
  "Implementar botão cancelar reserva"
  "Criar rota GET /dashboard"
  "Criar página /dashboard"
  "Deploy backend"
  "Deploy frontend"
)
STATUSES=(
  "AC1" "AC1" "AC1" "AC1" "AC1" "AC1" "AC1" "AC1" "AC1"
  "AC2" "AC2" "AC2" "AC2"
  "AC3" "AC3" "AC3"
  "Final" "Final" "Final" "Final"
)

# -----------------------------------------------------------------------------
# 7. Criar issues, adicionar ao Project e definir Status
# -----------------------------------------------------------------------------
echo "[6/7] Criando issues e adicionando ao project..."

for i in "${!TITLES[@]}"; do
  TITLE="${TITLES[$i]}"
  STATUS="${STATUSES[$i]}"
  echo "      Issue: $TITLE → $STATUS"

  # Criar issue e obter número (sem IDs hardcoded)
  ISSUE_JSON=$(gh issue create --repo "$NAME_WITH_OWNER" --title "$TITLE" --body "" --json number 2>/dev/null) || {
    echo "      Aviso: falha ao criar issue: $TITLE"
    continue
  }
  ISSUE_NUMBER=$(echo "$ISSUE_JSON" | jq -r '.number')

  # Obter node ID da issue (contentId) via GraphQL
  ISSUE_NODE_ID=$(gh api graphql -f query='
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) { id }
      }
    }
  ' -f owner="$REPO_OWNER" -f name="$REPO_NAME" -F number="$ISSUE_NUMBER" | jq -r '.data.repository.issue.id')

  if [ -z "$ISSUE_NODE_ID" ] || [ "$ISSUE_NODE_ID" = "null" ]; then
    echo "      Aviso: não foi possível obter node ID da issue #$ISSUE_NUMBER"
    continue
  fi

  # Adicionar issue ao Project (addProjectV2ItemById)
  ITEM_RESPONSE=$(gh api graphql -f query='
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }
  ' -f projectId="$PROJECT_ID" -f contentId="$ISSUE_NODE_ID")
  ITEM_ID=$(echo "$ITEM_RESPONSE" | jq -r '.data.addProjectV2ItemById.item.id')

  if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
    echo "      Aviso: issue já pode estar no project ou falha ao adicionar. #$ISSUE_NUMBER"
    continue
  fi

  # Escolher optionId conforme o status da issue
  case "$STATUS" in
    AC1)   OPTION_ID="$OPTION_ID_AC1" ;;
    AC2)   OPTION_ID="$OPTION_ID_AC2" ;;
    AC3)   OPTION_ID="$OPTION_ID_AC3" ;;
    Final) OPTION_ID="$OPTION_ID_FINAL" ;;
    *)     echo "      Aviso: status desconhecido '$STATUS'. Pulando definição de campo."; continue ;;
  esac

  # Definir campo Status no item do project (updateProjectV2ItemFieldValue)
  gh api graphql -f query='
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }
  ' -f projectId="$PROJECT_ID" -f itemId="$ITEM_ID" -f fieldId="$FIELD_ID" -f optionId="$OPTION_ID" >/dev/null 2>&1 || true
done

echo "[7/7] Concluído."
echo ""
echo "Project criado: $PROJECT_TITLE"
echo "Campo '$FIELD_NAME' com colunas: ${FIELD_OPTIONS[*]}"
echo "Issues criadas e associadas ao project com Status definido."
echo ""
echo "Acesse o board em: https://github.com/$NAME_WITH_OWNER (aba Projects ou link do project)."
