FROM archlinux/base:latest

RUN pacman --noconfirm -Syyu

RUN pacman --noconfirm -S fish nodejs net-tools npm tmux

RUN npm install -g npx

#VOLUME ["/home/tor/git/red_tetris_boilerplate", "/root/red_tetris"]
#ADD . /root/red_tetris

WORKDIR /root/red_tetris/
# RUN npm install
# RUN npx webpack webpack.config.js

#CMD ["/usr/bin/npm", "run", "srv-dev"]

EXPOSE 3004 3004
EXPOSE 8080 8080

#CMD ["/bin/bash", "-c", "/root/red_tetris/start.sh"]
