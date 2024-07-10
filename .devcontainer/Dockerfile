# FROM quay.io/toolbx-images/debian-toolbox:latest
FROM debian:latest

RUN apt update
# Essentials
RUN apt install -y sudo git vim curl
# Required for flatpak
RUN apt install -y xdg-desktop-portal xdg-desktop-portal-gtk xdg-user-dirs flatpak flatpak-builder
# Test gui apps
RUN apt install -y gedit x11-apps

# Env variables used to create a user and group
ENV USER=mab
ENV GROUP=$USER

# Create user
RUN useradd -m -s /bin/bash $USER -p "$(openssl passwd -1 $USER)"
# Add user to goups
RUN usermod -a -G sudo $USER

# Set the sudo rights for the group sudo
# RUN echo "Defaults:%sudo !targetpw" > /etc/sudoers.d/sudo
RUN echo "%sudo ALL = (root) ALL" >> /etc/sudoers.d/sudo
RUN chmod 0440 /etc/sudoers.d/sudo

# Install starship
RUN curl -sS https://starship.rs/install.sh | sh -s -- -y

# Copy dot and other files from the res folder to the users home dir
COPY ./devcontainer/res/.bash_aliases /home/$USER
RUN mkdir /home/$USER/.config
COPY ./devcontainer/res/starship.toml /home/$USER/.config
RUN echo 'eval "$(starship init bash)"' >> /home/$USER/.bashrc
RUN chown -R $USER:$GROUP /home/$USER


# Set user context for following commands
USER $USER

# Create xdg user directories
RUN xdg-user-dirs-update

# Add flathub as flatpak repo
RUN flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Entrypoint
ENTRYPOINT ["/bin/bash"]
