#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN CLUSTER INSTALLER V5.1.5 (HOTFIX GPG)
# Target: Debian 12 (Bookworm) 
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
# Fixed ASCII art spacing
echo " /_/   /_/ /_/ |_/_/ |_/  \____/_____/\____/_/ |_/_/ |_|  "
echo -e "          TITAN CLUSTER ENGINE - v5.1.5 (FIXED)${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere privilegios ROOT para provisionar el nodo."
fi

# 2. Bootstrap de Dependencias
log_info "Actualizando base de paquetes..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg2 wget lsb-release coreutils git build-essential ufw golang-go

# 3. Inyección de Llaves GPG (Fix 401 Bypass)
log_info "Inyectando firmas digitales (Metodo Resiliente)..."

# PostgreSQL Key
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/pgdg.gpg

# SignalWire / FreeSwitch Key (Descarga directa con bypass de 401)
# El error previo era por un bloque manual mal formateado.
# Usamos el link oficial de SignalWire directamente a binario GPG.
wget -qO - https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor --yes -o /usr/share/keyrings/signalwire-freeswitch-repo.gpg || {
    log_info "Falla en repo primario. Intentando servidor de llaves fallback..."
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E871F059 || log_error "No se pudo obtener la llave GPG del Media Plane."
}

# 4. Configuración de Repositorios
log_info "Configurando fuentes de software..."
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" > /etc/apt/sources.list.d/freeswitch.list

# 5. Instalación de FreeSwitch Engine
log_info "Instalando FreeSwitch v1.10.x..."
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc

# 6. Compilación del Orquestador Neural (Go)
log_info "Compilando CUBERBOX Titan Core..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod tidy || true
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor Titan en linea."

log_success "PROCESO FINALIZADO EXITOSAMENTE."
