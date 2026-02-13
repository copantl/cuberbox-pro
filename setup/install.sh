#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN CLUSTER INSTALLER V5.1.7 (DEBIAN NATIVE)
# Target: Debian 12 (Bookworm) 
# Policy: Official Repositories Only (Main, Contrib, Non-Free)
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
echo -e "          TITAN CLUSTER ENGINE - v5.1.7 (DEBIAN 12)${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere privilegios ROOT para provisionar el nodo."
fi

# 2. Habilitar componentes Contrib y Non-Free de Debian 12
log_info "Optimizando sources.list para Debian 12..."
sed -i 's/main$/main contrib non-free non-free-firmware/g' /etc/apt/sources.list || true

# 3. Limpieza de Keyrings anteriores (Fix GPG Errors)
log_info "Purgando firmas digitales obsoletas..."
rm -f /usr/share/keyrings/pgdg.gpg
rm -f /usr/share/keyrings/signalwire-freeswitch-repo.gpg
rm -f /etc/apt/sources.list.d/pgdg.list
rm -f /etc/apt/sources.list.d/freeswitch.list

# 4. Actualización de Base
log_info "Sincronizando con espejos oficiales de Debian..."
apt-get update -y

# 5. Instalación de Dependencias del Sistema
log_info "Instalando herramientas de núcleo..."
apt-get install -y ca-certificates curl wget lsb-release coreutils git build-essential ufw golang-go postgresql-15

# 6. Instalación de FreeSwitch (Desde repositorios Debian)
log_info "Desplegando FreeSwitch Stack (Debian Native)..."
# Nota: Si freeswitch no está en el repo base, se instalan las dependencias de compilación
apt-get install -y freeswitch || {
    log_info "Freeswitch no encontrado en repo principal. Instalando via backports o dependencias manuales..."
    apt-get install -y libfreeswitch-dev freeswitch-mod-lua freeswitch-mod-v8 || log_error "No se pudo localizar FreeSwitch en los repositorios de Debian 12."
}

# 7. Compilación del Orquestador Neural (Go)
log_info "Compilando CUBERBOX Titan Core..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod tidy || true
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor Titan compilado y enlazado."

# 8. Firewall Hardening
log_info "Aplicando reglas de seguridad Titan..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw allow 5061/tcp
ufw allow 8021/tcp
ufw --force enable

log_success "NODO TITAN v5.1.7 DESPLEGADO EXITOSAMENTE."
echo -e "\n${BOLD}Repositorios usados:${NC} Debian 12 Official"
echo -e "${BOLD}IP Local:${NC} http://$(hostname -I | awk '{print $1}')\n"
