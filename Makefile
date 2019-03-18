BASE_CONTAINER_NAME=make_docker_nodejs
RUN_CONTAINER_NAME=make_run_docker_nodejs

all: docker-build docker-run

docker-build:
	docker build -t $(BASE_CONTAINER_NAME) .

docker-run:
	docker run -d -it --name=$(RUN_CONTAINER_NAME) -v $(shell pwd):/root/red_tetris $(BASE_CONTAINER_NAME):latest bash ./start.sh

clean:
	docker rm $(RUN_CONTAINER_NAME)

connect:
	docker exec -it $(RUN_CONTAINER_NAME) fish

.PHONY: docker-build docker-run clean
	
