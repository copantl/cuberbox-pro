#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.1 (NEXUS RECOVERY)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: Full SignalWire 401 Bypass & GPG Keyrings modern standards
# =============================================================================

set -e

# Estética de Terminal
BOLD='\033[1m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
function log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

clear
echo -e "${BOLD}${CYAN}"
echo "   ____________   __________  ____  _  __"
echo "  / ____/ / / / __ ) / ____/ __ \/ __ )| |/ /"
echo " / /   / / / / __  |/ __/ / /_/ / __  ||   / "
echo "/ /___/ /_/ / /_/ / /___/ _, _/ /_/ / /   |  "
echo "\____/\____/_____/_____/_/ |_/_____/_/|_|  "
echo -e "      NEURAL ENGINE INSTALLER v4.8.1 (NEXUS)${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. PURGA DE REPOSITORIOS BLOQUEADOS (CRÍTICO para evitar error 401)
log_info "Saneando listas de paquetes obsoletas..."
rm -f /etc/apt/sources.list.d/freeswitch.list
rm -f /etc/apt/sources.list.d/freeswitch-archive-keyring.list
rm -f /usr/share/keyrings/freeswitch-archive-keyring.gpg
log_success "Entorno de APT limpio."

# 3. Entorno de Compilación Go
log_info "Configurando entorno Go Engine..."
export GO111MODULE=on
export GOPROXY=https://proxy.golang.org,direct
git config --global --unset-all url."git@github.com:".insteadOf || true

# 4. Preparación de Dependencias Base
log_info "Actualizando repositorios base de Debian..."
apt-get update -y
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go software-properties-common || log_warn "Algunas dependencias menores fallaron."

# 5. PostgreSQL 16 (Data Plane)
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
[ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "" ] && REPO_DIST="bookworm"

log_info "Instalando PostgreSQL 16..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16
log_success "Base de Datos lista."

# 6. INSTALACIÓN DE FREESWITCH (Sipwise Gateway - No requiere Token/PAT)
log_info "Configurando Media Plane via Sipwise Public Mirror..."
curl -s https://deb.sipwise.com/spce/keyring.gpg | gpg --dearmor > /usr/share/keyrings/sipwise-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/sipwise-keyring.gpg] https://deb.sipwise.com/spce/mr11.1.1/ bookworm main" > /etc/apt/sources.list.d/sipwise.list

apt-get update -y
apt-get install -y freeswitch freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Sipwise Mirror no disponible para esta arquitectura. Usando fallback nativo..."
    apt-get install -y freeswitch
}
log_success "Motor SIP instalado."

# 7. Sincronización de CUBERBOX Engine (Go Core)
log_info "Clonando núcleo estructural CUBERBOX Pro..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
rm -f go.mod go.sum
go mod init github.com/copantl/cuberbox-pro/backend
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
log_info "Compilando binario de alto rendimiento..."
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Orquestador compilado exitosamente."

# 8. Base de Datos e Integridad
log_info "Cargando esquemas de datos..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 9. Seguridad y Daemons
log_info "Finalizando blindaje de red (UFW)..."
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      INSTALACIÓN COMPLETADA EXITOSAMENTE (BUILD 4.8.1)              ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Plataforma:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Motor SIP:${NC} systemctl status freeswitch"
echo -e "=====================================================================\n"
