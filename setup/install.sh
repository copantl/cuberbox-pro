#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN CLUSTER INSTALLER V5.1.8 (PURE DEBIAN 12)
# Target: Debian 12 (Bookworm) 
# Policy: Strict Debian Official Repositories
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
echo -e "          TITAN CLUSTER ENGINE - v5.1.8 (PURE DEBIAN)${NC}\n"

# 1. Verificación de privilegios
if [[ $EUID -ne 0 ]]; then
   log_error "Se requiere privilegios ROOT para provisionar el nodo Debian."
fi

# 2. Configuración de Espejos Oficiales Debian 12
log_info "Optimizando depósitos oficiales de Debian 12..."
# Aseguramos que contrib y non-free estén activos para dependencias de red/media
sed -i 's/main$/main contrib non-free non-free-firmware/g' /etc/apt/sources.list || true

# 3. Preparación de Keyrings (Método moderno Debian 12)
log_info "Sincronizando almacén de firmas digitales (Titan Trust)..."
mkdir -p /usr/share/keyrings

# PostgreSQL (Oficial para Debian)
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor --yes -o /usr/share/keyrings/postgresql-archive-keyring.gpg

# SignalWire/FreeSwitch (Repositorio específico para Debian 12)
# Nota: Se eliminó cualquier referencia a keyserver.ubuntu.com
curl -fsSL https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg | gpg --dearmor --yes -o /usr/share/keyrings/signalwire-freeswitch-keyring.gpg

# 4. Inyección de Repositorios específicos para Debian
log_info "Configurando canales de software..."
echo "deb [signed-by=/usr/share/keyrings/postgresql-archive-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-keyring.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ $(lsb_release -cs) main" > /etc/apt/sources.list.d/freeswitch.list

# 5. Instalación de componentes de infraestructura
log_info "Actualizando índices de paquetes nativos..."
apt-get update -y

log_info "Desplegando stack tecnológico (Postgres 15 + Core Tools)..."
apt-get install -y ca-certificates curl gnupg2 wget lsb-release coreutils git build-essential ufw golang-go postgresql-15

log_info "Instalando motor de medios FreeSwitch (Debian Stack)..."
apt-get install -y freeswitch-all freeswitch-mod-lua freeswitch-mod-v8 freeswitch-mod-rtc || log_error "Falla en la descarga del motor de medios. Verifique conexión a repositorios SignalWire para Debian."

# 6. Compilación del Orquestador Titan (Go)
log_info "Compilando núcleo binario Titan..."
rm -rf /opt/cuberbox
git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox
cd /opt/cuberbox/backend
export GOPROXY=https://proxy.golang.org,direct
go mod tidy || true
go build -v -o /usr/local/bin/cuberbox-engine main.go
log_success "Motor binario listo."

# 7. Configuración de Seguridad Perimetral
log_info "Endureciendo firewall nativo..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw allow 8021/tcp
ufw --force enable

log_success "PROCESO FINALIZADO EXITOSAMENTE EN DEBIAN 12."
echo -e "\n${BOLD}Arquitectura:${NC} Titan Cluster Node v5.1.8"
echo -e "${BOLD}Acceso Web:${NC} http://$(hostname -I | awk '{print $1}')\n"
