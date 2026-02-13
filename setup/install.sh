#!/bin/bash

# =============================================================================
# CUBERBOX PRO - QUANTICA TITAN INSTALLER V5.4.0 (DEBIAN 12 + QUANTICA SW)
# Subdomain: quantica.signalwire.com
# =============================================================================

set -e

# Credenciales de Infraestructura (SignalWire PAT)
SW_TOKEN="PT5b9edec3ca49c15002eae76b499aa87e112d376db148e9ed"
SW_HOST="quantica.signalwire.com"

# Paleta de Colores Titan
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
echo -e "          QUANTICA TITAN ENGINE - v5.4.0 (DEBIAN 12)${NC}\n"

# 1. Validación de Entorno
if [[ $EUID -ne 0 ]]; then
   log_error "Este instalador de infraestructura requiere privilegios ROOT."
fi

# 2. Herramientas Core
log_info "Sincronizando herramientas de transporte y criptografía..."
apt-get update && apt-get upgrade -y
apt-get install -y wget curl gnupg2 software-properties-common apt-transport-https lsb-release git build-essential golang-go ufw

# 3. Autenticación de Repositorios Quantica (Lógica Anti-401)
log_info "Configurando pasarela de autenticación para $SW_HOST..."
mkdir -p /etc/apt/auth.conf.d/
echo "machine $SW_HOST login signalwire password $SW_TOKEN" > /etc/apt/auth.conf.d/freeswitch.conf
chmod 600 /etc/apt/auth.conf.d/freeswitch.conf

# 4. Firma Digital Media Plane Quantica
log_info "Importando firma GPG desde canal Quantica..."
curl -u signalwire:$SW_TOKEN -s https://$SW_HOST/repo/deb/debian-release/signalwire-freeswitch-repo.gpg > /tmp/sw.gpg
if [ ! -s /tmp/sw.gpg ]; then
    log_error "Token o URL de Quántica inválidos. No se pudo obtener la firma GPG."
fi
cat /tmp/sw.gpg | gpg --dearmor > /usr/share/keyrings/signalwire-freeswitch-repo.gpg
rm /tmp/sw.gpg

# 5. Inyección de Repositorios Quantica
log_info "Inyectando fuentes de FreeSwitch 1.10 (Quantica Spec)..."
OS_CODENAME=$(lsb_release -sc)
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://$SW_HOST/repo/deb/debian-release/ $OS_CODENAME main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://$SW_HOST/repo/deb/debian-release/ $OS_CODENAME main" >> /etc/apt/sources.list.d/freeswitch.list

# 6. Despliegue de Stack
log_info "Iniciando instalación desde infraestructura Quantica..."
apt-get update
apt-get install -y freeswitch-all postgresql-16

# 7. Preparación de Entorno de Medios
log_info "Configurando permisos de sistema de archivos..."
mkdir -p /opt/cuberbox/recordings
mkdir -p /var/log/freeswitch
chown -R www-data:www-data /opt/cuberbox/recordings
chmod -R 775 /opt/cuberbox/recordings

# 8. Compilación del Motor Go
log_info "Compilando CUBERBOX Neural Engine (v5.4.0)..."
if [ -d "/opt/cuberbox/backend" ]; then
    cd /opt/cuberbox/backend
    go build -v -o /usr/local/bin/cuberbox-core main.go
else
    log_info "Clonando repositorio maestro para compilación..."
    git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox || true
    cd /opt/cuberbox/backend && go build -v -o /usr/local/bin/cuberbox-core main.go || true
fi

# 9. Seguridad Perimetral
log_info "Blindando puertos SIP y WebRTC..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw allow 5061/tcp
ufw allow 7443/tcp
ufw allow 16384:32768/udp
ufw --force enable

# 10. Finalización
systemctl enable freeswitch
systemctl restart freeswitch
systemctl enable postgresql
systemctl restart postgresql

log_success "DESPLIEGUE QUANTICA TITAN v5.4.0 COMPLETADO."
echo -e "\n${BOLD}Infraestructura:${NC} $SW_HOST"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Estado Auth:${NC} Quantica Token Sincronizado\n"
