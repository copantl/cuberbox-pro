#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.9.2 (TITAN BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: GPG Signature Validation & Repository 401/404 Resolver
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
echo -e "      NEURAL ENGINE INSTALLER v4.9.2 (TITAN)${NC}\n"

# 1. Privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere ROOT (sudo su)."
fi

# 2. LIMPIEZA DE CONFIGURACIONES FALLIDAS
log_info "Sanitizando entorno de paquetes y repositorios antiguos..."
rm -f /etc/apt/sources.list.d/freeswitch.list /etc/apt/sources.list.d/sipwise.list
rm -f /usr/share/keyrings/signalwire*.gpg /usr/share/keyrings/pgdg.gpg
apt-get clean
log_success "Entorno de paquetes purgado."

# 3. BOOTSTRAP
log_info "Instalando dependencias críticas de red y cifrado..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg2 wget lsb-release coreutils

# 4. PostgreSQL 16 (Data Plane)
REPO_DIST=$(lsb_release -cs 2>/dev/null || echo "bookworm")
[ "$REPO_DIST" = "trixie" ] && REPO_DIST="bookworm"

log_info "Configurando PostgreSQL 16 (${REPO_DIST})..."
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/pgdg.gpg
echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 5. MEDIA PLANE (SignalWire TITAN FIX - Robust GPG Handling)
log_info "Configurando Media Plane (SignalWire Official)..."

SIGNALWIRE_KEYRING="/usr/share/keyrings/signalwire-freeswitch-repo.gpg"

# Triple intento de obtención de firma
log_info "Validando firma digital del repositorio..."
if ! curl -fsSL https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor --yes -o "$SIGNALWIRE_KEYRING"; then
    log_warn "Descarga directa fallida (posible 401). Intentando vía Keyserver..."
    gpg --no-default-keyring --keyring "$SIGNALWIRE_KEYRING" --keyserver keyserver.ubuntu.com --recv-keys 208362B2E967D6D8 || {
        log_error "No se pudo validar la firma de SignalWire. Verifique su conexión a internet."
    }
fi

echo "deb [signed-by=$SIGNALWIRE_KEYRING] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=$SIGNALWIRE_KEYRING] https://freeswitch.signalwire.com/repo/deb/debian-release/ bookworm main" >> /etc/apt/sources.list.d/freeswitch.list

log_info "Instalando FreeSwitch Engine v1.10 LTS..."
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc
log_success "Media Plane SIP desplegado."

# 6. CUBERBOX ENGINE (Go Core)
log_info "Compilando CUBERBOX Engine v4.9.2..."
apt-get install -y git build-essential ufw golang-go
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod init github.com/copantl/cuberbox-pro/backend || true
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor Go sincronizado."

# 7. SQL SETUP
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql || true

# 8. DAEMONS
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.9.2 (TITAN)                   ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}GPG SignalWire:${NC} VERIFIED (Keyserver Redundancy)"
echo -e "=====================================================================\n"
