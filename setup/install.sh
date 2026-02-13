#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.6.5 (STABLE)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Repo: https://github.com/copantl/cuberbox-pro
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
echo -e "      NEURAL ENGINE INSTALLER v4.6.5${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Pre-vuelo del Sistema
OS_CODENAME=$(lsb_release -cs)
log_info "Detectado Debian ${OS_CODENAME}. Preparando dependencias..."
apt update && apt upgrade -y
apt install -y curl wget git gnupg2 software-properties-common lsb-release build-essential ufw certbot nginx golang-go

# 3. PostgreSQL 16 (Data Plane)
log_info "Configurando PostgreSQL 16..."
# En Debian 13, usamos el repo de sid/testing si es necesario, pero PGDG es preferible
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update && apt install -y postgresql-16
log_success "PostgreSQL 16 instalado."

# 4. Clonación del Repositorio Core
log_info "Sincronizando código fuente desde GitHub..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
log_success "Repositorio clonado en /opt/cuberbox"

# 5. Compilación del Backend (Go Neural Engine)
log_info "Construyendo binarios de orquestación..."
cd /opt/cuberbox/backend

# REPARACIÓN DE GO: Inicializar módulo si no existe
if [ ! -f go.mod ]; then
    log_info "Inicializando Go Module..."
    go mod init github.com/copantl/cuberbox-pro/backend
fi

log_info "Descargando dependencias de Go..."
go mod tidy
log_info "Compilando CUBERBOX Engine..."
go build -o /usr/local/bin/cuberbox-engine main.go
log_success "Backend compilado con éxito."

# 6. FreeSwitch 1.10 (Media Plane)
log_info "Configurando FreeSwitch (SignalWire Repo)..."
# Nota: Para Debian 13, a veces se requiere forzar el repo de bullseye/bookworm si no hay release oficial aún
FS_REPO_DIST="bookworm" # Estable por defecto para compatibilidad
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | apt-key add -
echo "deb http://files.freeswitch.org/repo/deb/debian-release/ ${FS_REPO_DIST} main" > /etc/apt/sources.list.d/freeswitch.list
apt update && apt install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc

# 7. Seguridad perimetral
log_info "Aplicando blindaje de red (UFW)..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp
ufw allow 7443/tcp
ufw --force enable
log_success "Firewall configurado."

# 8. Base de Datos & Esquema
log_info "Inyectando esquema de datos Q4..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || log_warn "Usuario ya existe."
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || log_warn "Base de datos ya existe."
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql
log_success "Esquema V4 inyectado."

# 9. Persistencia de Servicios
log_info "Registrando Daemons de sistema..."
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable cuberbox-engine
    log_success "Servicio registrado."
else
    log_warn "Archivo .service no encontrado. Creación manual requerida."
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO DESPLEGADO EXITOSAMENTE (DEBIAN 12/13)            ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Siguientes pasos:${NC}"
echo -e "1. Accede vía IP: ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "2. Completa el Wizard visual para activar tu API KEY de Gemini."
echo -e "3. Repositorio Oficial: https://github.com/copantl/cuberbox-pro"
echo -e "=====================================================================\n"