
#!/bin/bash

# =============================================================================
# CUBERBOX PRO - NEURAL ENGINE CLUSTER INSTALLER V4.0
# Compatible con Debian 12 (Bookworm) y Debian 13 (Trixie)
# =============================================================================

set -e

# Estética de Terminal
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear
echo -e "${PURPLE}=====================================================================${NC}"
echo -e "${PURPLE}          CUBERBOX PRO - INSTALADOR DE CLÚSTER NEURONAL              ${NC}"
echo -e "${PURPLE}=====================================================================${NC}"

# 1. Privilegios y Pre-vuelo
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Error: Se requiere acceso Root para configurar el stack SIP.${NC}"
  exit 1
fi

OS_VERSION=$(lsb_release -cs)
echo -e "${GREEN}[OK] Preparando entorno para Debian ${OS_VERSION}${NC}"

# 2. Dependencias de Compilación y Go
echo -e "${YELLOW}Instalando entorno de ejecución Go 1.22+ y herramientas C...${NC}"
apt update && apt upgrade -y
apt install -y git curl wget build-essential golang-go gnupg2 lsb-release certbot nginx ufw

# 3. Instalación de PostgreSQL 16 (Data Plane)
echo -e "${YELLOW}Configurando Repositorios PGDG para PostgreSQL 16...${NC}"
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt ${OS_VERSION}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update && apt install -y postgresql-16

# 4. Compilación del Neural Bridge (Go Orquestrator)
echo -e "${YELLOW}Compilando CUBERBOX Neural Orquestrator (Control Plane)...${NC}"
mkdir -p /opt/cuberbox/bin
cd /opt/cuberbox/backend
go mod tidy
go build -o /opt/cuberbox/bin/cuberbox-engine main.go
chmod +x /opt/cuberbox/bin/cuberbox-engine

# 5. Instalación de FreeSwitch 1.10 (Media Plane)
echo -e "${YELLOW}Configurando Stack de Telefonía FreeSwitch...${NC}"
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | apt-key add -
echo "deb http://files.freeswitch.org/repo/deb/debian-release/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/freeswitch.list
apt update
apt install -y freeswitch-all freeswitch-mod-rtc freeswitch-mod-v8 freeswitch-mod-tts-commandline freeswitch-mod-lua

# 6. Despliegue de Lógica Lua y Hooks
echo -e "${YELLOW}Inyectando hooks de telemetría en el dialplan...${NC}"
cp /opt/cuberbox/setup/cuberbox_router.lua /usr/share/freeswitch/scripts/
chown freeswitch:freeswitch /usr/share/freeswitch/scripts/cuberbox_router.lua

# 7. Configuración de Servicio SystemD para Go Bridge
echo -e "${YELLOW}Configurando persistencia del motor neuronal...${NC}"
cat <<EOT > /etc/systemd/system/cuberbox-engine.service
[Unit]
Description=Cuberbox Neural Bridge Service
After=network.target postgresql.service freeswitch.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/cuberbox
EnvironmentFile=/etc/cuberbox/engine.env
ExecStart=/opt/cuberbox/bin/cuberbox-engine
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOT

# 8. Firewall L7 Hardening
echo -e "${YELLOW}Aplicando políticas de blindaje de red...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060:5061/tcp
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp
ufw allow 7443/tcp
ufw --force enable

# 9. Inicialización de DB
echo -e "${YELLOW}Inyectando esquema de base de datos...${NC}"
sudo -u postgres psql -c "CREATE USER cuber_master WITH PASSWORD 'CB_Secret_2025';" || true
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_master;" || true
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql

# 10. Finalización
systemctl daemon-reload
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}      CUBERBOX PRO CLUSTER DEPLOYED SUCCESSFULLY ON DEBIAN          ${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "Nodos activos detectados. Configura tu API_KEY en /etc/cuberbox/engine.env"
echo -e "y ejecuta: systemctl enable --now cuberbox-engine"
echo -e "${BLUE}=====================================================================${NC}"
