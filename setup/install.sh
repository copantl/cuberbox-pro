#!/bin/bash

# =============================================================================
# CUBERBOX PRO - MASTER CLUSTER INSTALLER V4.7.0 (ULTRA-STABLE)
# Compatible: Debian 12 (Bookworm) / Debian 13 (Trixie)
# Repo: https://github.com/copantl/cuberbox-pro
# =============================================================================

set -e

# Configuración de Colores
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
echo -e "      NEURAL ENGINE INSTALLER v4.7.0${NC}\n"

# 1. Verificación de Root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como ROOT (sudo su)."
fi

# 2. Reparación de software-properties-common y dependencias base
log_info "Actualizando repositorios base..."
apt-get update -y

log_info "Instalando dependencias de infraestructura y gestión de paquetes..."
# En Debian 13, a veces el paquete se llama python3-software-properties
apt-get install -y lsb-release gpg curl wget git build-essential ufw certbot nginx golang-go \
    software-properties-common python3-software-properties python3-launchpadlib || log_warn "Ciertas dependencias fallaron, intentando bypass..."

# 3. Gestión de Repositorios Externos (PostgreSQL 16)
OS_CODENAME=$(lsb_release -cs)
REPO_DIST=$OS_CODENAME
if [ "$OS_CODENAME" = "trixie" ]; then
    log_warn "Debian 13 detectado. Aplicando capa de compatibilidad 'bookworm'."
    REPO_DIST="bookworm"
fi

log_info "Configurando PostgreSQL Global Repository..."
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${REPO_DIST}-pgdg main" > /etc/apt/sources.list.d/pgdg.list

apt-get update -y
apt-get install -y postgresql-16

# 4. Clonación del Repositorio (Fix para credenciales Git)
log_info "Sincronizando CUBERBOX Pro desde GitHub..."
rm -rf /opt/cuberbox

# Habilitamos prompts por si el repo es privado y el usuario necesita ingresar datos
export GIT_TERMINAL_PROMPT=1

# Intento de clonación. Si falla por permisos, pedirá credenciales.
if ! git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox; then
    log_error "No se pudo clonar el repositorio. Verifique que la URL es pública o que tiene permisos."
fi
log_success "Código fuente sincronizado en /opt/cuberbox"

# 5. Compilación del Backend (Go Engine)
log_info "Preparando entorno Go y compilando binarios..."
cd /opt/cuberbox/backend

if [ ! -f go.mod ]; then
    log_info "Inicializando módulo Go (backend)..."
    go mod init github.com/copantl/cuberbox-pro/backend
fi

go mod tidy
go build -o /usr/local/bin/cuberbox-engine main.go
log_success "Engine compilado exitosamente."

# 6. Instalación de FreeSwitch (Media Plane)
log_info "Configurando FreeSwitch v1.10..."
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | gpg --dearmor > /usr/share/keyrings/freeswitch-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/freeswitch-archive-keyring.gpg] http://files.freeswitch.org/repo/deb/debian-release/ ${REPO_DIST} main" > /etc/apt/sources.list.d/freeswitch.list
apt-get update -y
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc

# 7. Inyección de Base de Datos
log_info "Configurando Plano de Datos SQL..."
sudo -u postgres psql -c "CREATE USER cuber_admin WITH PASSWORD 'CB_Elite_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_admin;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql
log_success "Base de datos provisionada."

# 8. Registro de Servicio SystemD
if [ -f /opt/cuberbox/setup/cuberbox-engine.service ]; then
    cp /opt/cuberbox/setup/cuberbox-engine.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now cuberbox-engine
    log_success "Servicio cuberbox-engine activado."
fi

echo -e "\n${GREEN}${BOLD}=====================================================================${NC}"
echo -e "${GREEN}      INSTALACIÓN EXITOSA - CUBERBOX ELITE v4.7.0                    ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${BOLD}Acceso Directo:${NC} ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "${BOLD}Repositorio:${NC} https://github.com/copantl/cuberbox-pro"
echo -e "=====================================================================\n"
