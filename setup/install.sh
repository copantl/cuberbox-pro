#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.0 (NO-TOKEN BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: SignalWire 401 Unauthorized Bypass (Using Sipwise Public Mirror)
# =============================================================================

set -e

# Estética de Terminal Elite
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
echo -e "      NEURAL ENGINE INSTALLER v4.8.0${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Limpieza de Repositorios Bloqueados (CRÍTICO)
log_info "Limpiando repositorios privados (Bypass 401)..."
rm -f /etc/apt/sources.list.d/freeswitch.list
rm -f /usr/share/keyrings/freeswitch-archive-keyring.gpg

# 3. Entorno de Compilación Go
log_info "Configurando entorno Go resiliente..."
export GO111MODULE=on
export GOPROXY=https://proxy.golang.org,direct
git config --global --unset-all url."git@github.com:".insteadOf || true

# 4. Preparación de Dependencias Base
log_info "Sincronizando base de datos de paquetes..."
apt-get update -y || log_warn "Algunos repositorios fallaron, procediendo con limpieza..."
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go software-properties-common || log_error "Falla en dependencias core."

# 5. PostgreSQL 16
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
if [ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "" ]; then
    REPO_DIST="bookworm"
fi

log_info "Configurando PostgreSQL 16..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 6. INSTALACIÓN DE FREESWITCH (Sipwise Public Mirror - No requiere Token)
log_info "Instalando FreeSwitch 1.10 via Sipwise Public Gateway..."
# Importar llave Sipwise
curl -s https://deb.sipwise.com/spce/keyring.gpg | gpg --dearmor > /usr/share/keyrings/sipwise-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/sipwise-keyring.gpg] https://deb.sipwise.com/spce/mr11.1.1/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sipwise.list

apt-get update -y
apt-get install -y freeswitch freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Sipwise Mirror falló. Intentando fallback nativo Debian..."
    apt-get install -y freeswitch
}

# 7. Compilación del Backend CUBERBOX
log_info "Compilando orquestador Go Engine..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
rm -f go.mod go.sum
go mod init github.com/copantl/cuberbox-pro/backend
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
go build -o /usr/local/bin/cuberbox-engine main.go
log_success "Backend orquestado."

# 8. Base de Datos
log_info "Provisionando esquema SQL..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 9. Firewall y SystemD
log_info "Finalizando configuración de red..."
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.8.0 (STABLE)                  ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}SIP Status:${NC} systemctl status freeswitch"
echo -e "=====================================================================\n"
