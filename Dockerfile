FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Usar bash como shell por defecto en los RUN (para poder "sourcear" NVM)
SHELL ["/bin/bash", "-lc"]

# ------------------------------------------------------------
# Paquetes base + Java (requerido por sdkmanager)
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y \
  curl ca-certificates git bash build-essential python3 make g++ openssh-client \
  unzip wget \
  openjdk-17-jdk-headless \
  && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------
# Crear usuario normal (sin modificar UID/GID del host)
# ------------------------------------------------------------
ARG USERNAME=dev
RUN useradd -m -s /bin/bash ${USERNAME}

USER ${USERNAME}
ENV HOME=/home/${USERNAME}
WORKDIR /workspaces

# ------------------------------------------------------------
# NVM + Node 20 + npm global en ~/.npm-global (sin sudo, sin EACCES)
# ------------------------------------------------------------
ENV NVM_DIR=${HOME}/.nvm
RUN curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Importante: NO usar ENV NPM_CONFIG_PREFIX (NVM es incompatible durante nvm install)
RUN . "$NVM_DIR/nvm.sh" \
  && nvm install 20 \
  && nvm alias default 20 \
  && mkdir -p "$HOME/.npm-global" \
  && npm config set prefix "$HOME/.npm-global" \
  && corepack enable

# PATH para sesiones interactivas
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> "$HOME/.bashrc" \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' >> "$HOME/.bashrc" \
  && echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> "$HOME/.bashrc" \
  && echo 'export PATH="$NVM_DIR/versions/node/$(nvm version default)/bin:$PATH"' >> "$HOME/.bashrc"

# PATH también para ejecuciones no interactivas (postCreateCommand, etc.)
ENV PATH=$HOME/.npm-global/bin:$PATH

# ------------------------------------------------------------
# Android SDK (cmdline-tools + platform-tools/adb)
# ------------------------------------------------------------
ENV ANDROID_HOME=$HOME/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# Descargar e instalar command-line tools (sdkmanager, avdmanager, etc.)
RUN mkdir -p $ANDROID_HOME/cmdline-tools \
  && cd $ANDROID_HOME/cmdline-tools \
  && wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O tools.zip \
  && unzip tools.zip -d $ANDROID_HOME/cmdline-tools \
  && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
  && rm tools.zip

# Aceptar licencias e instalar ADB (platform-tools)
RUN yes | sdkmanager --licenses \
  && sdkmanager "platform-tools"

# (Opcional) Si vas a compilar nativo, instala plataformas y build-tools:
# RUN sdkmanager "platforms;android-34" "build-tools;34.0.0"

# ------------------------------------------------------------
# Listo: node/npm/adb en PATH y usuario no-root
# ------------------------------------------------------------
