BASE_CONTAINER_NAME=make_docker_nodejs
RUN_CONTAINER_NAME=make_run_docker_nodejs

all: docker-build docker-run

docker-build:
	docker build -t $(BASE_CONTAINER_NAME) .

docker-run:
	docker run -p 8080:8080 -p 3004:3004 -d -it --name=$(RUN_CONTAINER_NAME) -v $(shell pwd):/root/red_tetris $(BASE_CONTAINER_NAME):latest bash ./start.sh

start:
	docker start ${RUN_CONTAINER_NAME}

clean:
	docker stop $(RUN_CONTAINER_NAME)
	docker rm $(RUN_CONTAINER_NAME)

connect:
	docker exec -it $(RUN_CONTAINER_NAME) fish

.PHONY: docker-build docker-run clean

