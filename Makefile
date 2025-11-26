IMAGE_NAME=gradvault-test

.PHONY: build-test test

build-test:
	docker build -t $(IMAGE_NAME) .

test: build-test
	docker run --rm $(IMAGE_NAME)
