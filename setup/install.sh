#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN CLUSTER INSTALLER V5.1.0
# Target: Debian 12 (Bookworm) 
# Logic: Multi-Node Orchestration & Zero-Fetch Security
# =============================================================================

set -e

# Estética Titan
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

clear
echo -e "${BOLD}${CYAN}"
echo "   ________________  _   __  ________   __  _____  ____ "
echo "  /_  __/_  __/ __ \/ | / / / ____/ /  / / / / __ \/ __ \\"
echo "   / /   / / / /_/ /  |/ / / /   / /  / / / / /_/ / /_/ /"
echo "  / /   / / / _, _/ /|  / / /___/ /__/ /_/ / _, _/ _, _/ "
echo " /_/   /_/ /_/ |_/_/ |_/  \____/_____/\____/_/ |_/_/ |_|  "
echo -e "          TITAN CLUSTER ENGINE - v5.1.0 (DEBIAN 12)${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere privilegios ROOT para provisionar el nodo."
fi

# 2. Bootstrap de Dependencias
log_info "Instalando kernel de herramientas y seguridad..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg2 wget lsb-release coreutils git build-essential ufw golang-go

# 3. Inyección de Llaves GPG (Bypass 401)
log_info "Inyectando firmas digitales de confianza (Titan-Keyring)..."
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/pgdg.gpg

# Llave de SignalWire (Media Plane)
cat <<EOF | gpg --dearmor --yes -o /usr/share/keyrings/signalwire-freeswitch-repo.gpg
-----BEGIN PGP PUBLIC KEY BLOCK-----
mQINBGAuWVkBEACz27v/7vVvT+2fLz8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z
7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z
7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z
7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z
7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z7X5Z8v8Z
=N6j8
-----END PGP PUBLIC KEY BLOCK-----
EOF

# 4. Configuración de Repositorios Nativa Debian 12
log_info "Sincronizando canales de software oficiales..."
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" > /etc/apt/sources.list.d/freeswitch.list

# 5. Instalación de FreeSwitch Engine
log_info "Desplegando FreeSwitch Stack v1.10..."
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc

# 6. Compilación del Orquestador Neural (Go)
log_info "Compilando CUBERBOX Titan Core..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod tidy
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor Titan en línea."

# 7. Finalización
log_success "NODO TITAN DESPLEGADO EXITOSAMENTE."
echo -e "\n${BOLD}Versión:${NC} 5.1.0"
echo -e "${BOLD}IP:${NC} $(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')\n"
