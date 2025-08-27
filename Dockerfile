# Base: Node 20 sobre Debian 11 (Bullseye)
FROM node:20-bullseye

# Evitar prompts interactivos
ENV DEBIAN_FRONTEND=noninteractive

# ---------- Paquetes de sistema ----------
# Java 17 es la opción más estable con Gradle/Android actualmente.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    unzip \
    ca-certificates \
    locales \
    sudo \
    python3 \
    python3-pip \
    build-essential \
    openjdk-17-jdk \
  && rm -rf /var/lib/apt/lists/*

# ---------- Android SDK ----------
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=${ANDROID_HOME}
# Java home (OpenJDK 17)
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
# PATH Android (cmdline-tools y platform-tools primero)
ENV PATH=${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}

# Instalar cmdline-tools (estructura correcta: cmdline-tools/latest)
# Nota: el ZIP con sufijo *_latest.zip es el canal oficial de Google.
RUN mkdir -p ${ANDROID_HOME} && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /tmp/commandlinetools.zip && \
    mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    unzip -q /tmp/commandlinetools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm -f /tmp/commandlinetools.zip

# Pre-crear archivo de config para evitar warnings de sdkmanager
RUN mkdir -p /root/.android && touch /root/.android/repositories.cfg

# Aceptar licencias e instalar componentes habituales (33 y 34 por compatibilidad)
RUN yes | sdkmanager --licenses && \
    sdkmanager \
      "platform-tools" \
      "platforms;android-33" "build-tools;33.0.0" \
      "platforms;android-34" "build-tools;34.0.0"

# ---------- Node toolchain global ----------
# Habilitar Corepack para Yarn/Pnpm y Expo CLI global
RUN corepack enable && npm i -g @expo/cli


RUN useradd -m -s /bin/bash developer && \
    usermod -aG sudo developer && \
    echo "developer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Directorio de trabajo estándar de Dev Containers
USER developer
WORKDIR /workspaces

# Evitar que npm pida telemetry, etc. (opcional)
ENV npm_config_fund=false
ENV npm_config_audit=false

# Comando por defecto
CMD [ "bash" ]