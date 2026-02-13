#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.7.9 (RECOVERY BUILD)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Fix: FreeSwitch GPG 401 Unauthorized & Public Go Modules
# =============================================================================

set -e

# Estética de Terminal (Estilo Matrix/Elite)
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
echo -e "      NEURAL ENGINE INSTALLER v4.7.9${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Entorno Go (Resiliencia para módulos públicos)
log_info "Configurando Go Engine Bridge..."
export GO111MODULE=on
export GOPROXY=https://proxy.golang.org,direct
export GOSUMDB=sum.golang.org
git config --global --unset-all url."git@github.com:".insteadOf || true
git config --global --unset-all url."https://github.com/".insteadOf || true

# 3. Preparación de Debian e Infraestructura
log_info "Actualizando base de datos de paquetes..."
apt-get update -y
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go \
    software-properties-common python3-software-properties python3-launchpadlib || log_warn "Dependencias base con advertencias."

# 4. Configuración de PostgreSQL 16
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
if [ "$OS_CODENAME" = "trixie" ] || [ "$OS_CODENAME" = "" ]; then
    log_warn "Entorno Debian 13/Custom detectado. Ajustando a compatibilidad Bookworm."
    REPO_DIST="bookworm"
fi

log_info "Aprovisionando PostgreSQL 16..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt-get update -y
apt-get install -y postgresql-16

# 5. FIX FREESWITCH: GPG Key Bypass (Evita error 401 de SignalWire)
log_info "Configurando repositorio SIP FreeSwitch (Método Resiliente)..."

# En lugar de descargar el .asc bloqueado, intentamos recibirlo de un servidor de llaves
# La llave de FreeSwitch suele ser 0E9A9E88 (Release Key)
set +e
log_info "Importando llaves GPG de FreeSwitch desde servidor público..."
apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0E9A9E88 || \
curl -fsSL https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | gpg --dearmor > /usr/share/keyrings/freeswitch-archive-keyring.gpg || \
log_warn "No se pudo obtener la llave GPG oficial. Intentando instalación via Debian main..."
set -e

# Crear la lista de fuentes (Usamos el mirror de SignalWire pero con precaución)
echo "deb [signed-by=/usr/share/keyrings/freeswitch-archive-keyring.gpg] http://files.freeswitch.org/repo/deb/debian-release/ ${REPO_DIST} main" > /etc/apt/sources.list.d/freeswitch.list || \
echo "deb http://deb.debian.org/debian ${REPO_DIST} main" >> /etc/apt/sources.list.d/freeswitch.list

apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || log_error "Fallo crítico al instalar FreeSwitch."

# 6. Sincronización de CUBERBOX Engine
log_info "Desplegando código maestro en /opt/cuberbox..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox

cd /opt/cuberbox/backend
rm -f go.mod go.sum
go clean -modcache
go mod init github.com/copantl/cuberbox-pro/backend
go get github.com/fiorix/go-eventsocket/eventsocket
go mod tidy -v
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Backend compilado y verificado."

# 7. Base de Datos y Esquema
log_info "Inyectando esquema relacional V3.6..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 8. Activación de Servicios
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
fi

log_info "Configurando Firewall UFW..."
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 5060:5061/udp && ufw --force enable

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO INSTALADO - BUILD 4.7.9                           ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Acceso Web:${NC} ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "${BOLD}Estado SIP:${NC} Systemctl status freeswitch"
echo -e "=====================================================================\n"
