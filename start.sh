#!/bin/bash

tmux new-session -d -s nodejs-srv npm run srv-dev
tmux new-session -d -s nodejs-client npm run client-dev
fish
