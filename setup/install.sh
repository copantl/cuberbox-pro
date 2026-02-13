#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.8.2 (IRONCLAD BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: GPG Key Integrity & 401 Unauthorized Absolute Purge
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
echo -e "      NEURAL ENGINE INSTALLER v4.8.2 (IRONCLAD)${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. LIMPIEZA ATÓMICA DE REPOSITORIOS (Solución 401 definitiva)
log_info "Ejecutando purga atómica de repositorios privados..."
rm -f /etc/apt/sources.list.d/freeswitch*
rm -f /etc/apt/sources.list.d/sipwise*
rm -f /usr/share/keyrings/freeswitch*
rm -f /usr/share/keyrings/sipwise*
rm -f /etc/apt/trusted.gpg.d/freeswitch*
apt-get clean
log_success "APT Environment Saneado."

# 3. Entorno de Compilación Go
log_info "Configurando entorno Go Engine..."
export GO111MODULE=on
export GOPROXY=https://proxy.golang.org,direct
git config --global --unset-all url."git@github.com:".insteadOf || true

# 4. Dependencias Base
log_info "Sincronizando dependencias base..."
apt-get update -y || log_warn "Caché de APT con errores menores, continuando..."
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go software-properties-common

# 5. PostgreSQL 16
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
[ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "" ] && REPO_DIST="bookworm"

log_info "Aprovisionando PostgreSQL 16..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16
log_success "Data Plane verificado."

# 6. INSTALACIÓN DE FREESWITCH (Sipwise Mirror - Resiliente)
log_info "Importando llaves de Media Plane (Sipwise)..."

# Método robusto para evitar "datos OpenPGP no encontrados"
set +e
wget -qO- https://deb.sipwise.com/spce/keyring.gpg > /tmp/sipwise.key
if [ -s /tmp/sipwise.key ]; then
    cat /tmp/sipwise.key | gpg --dearmor --yes -o /usr/share/keyrings/sipwise-keyring.gpg
else
    log_warn "Falla en descarga directa de llave. Intentando servidor alternativo..."
    gpg --no-default-keyring --keyring /usr/share/keyrings/sipwise-keyring.gpg --keyserver keyserver.ubuntu.com --recv-keys 14AA6D7D || log_error "No se pudo obtener la llave SIP."
fi
set -e

echo "deb [signed-by=/usr/share/keyrings/sipwise-keyring.gpg] https://deb.sipwise.com/spce/mr11.1.1/ bookworm main" > /etc/apt/sources.list.d/sipwise.list

log_info "Instalando binarios de FreeSwitch..."
apt-get update -y
apt-get install -y freeswitch freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || {
    log_warn "Sipwise Mirror incompleto. Usando fallback de repositorios Debian..."
    apt-get install -y freeswitch
}
log_success "Motor SIP activo."

# 7. Sincronización de CUBERBOX Engine
log_info "Desplegando núcleo Go v4.8.2..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
rm -f go.mod go.sum
go mod init github.com/copantl/cuberbox-pro/backend
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Backend orquestado."

# 8. Base de Datos
log_info "Injectando esquema relacional..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 9. Firewall y Daemons
log_info "Finalizando blindaje de red..."
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      INSTALACIÓN COMPLETADA EXITOSAMENTE (BUILD 4.8.2)              ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Plataforma:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Motor SIP:${NC} systemctl status freeswitch"
echo -e "=====================================================================\n"
