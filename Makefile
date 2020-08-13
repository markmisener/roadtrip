SHELL := /bin/bash

.PHONY: install clean run-local test-local

venv:
	virtualenv --python=python3.8 dev-env

install: venv
	source dev-env/bin/activate; \
	pip install -r requirements.txt; \

clean:
	rm -r dev-env/

run-local: install
	source dev-env/bin/activate; \
	sh start.sh

test-local: install
		source dev-env/bin/activate; \
		coverage run -m unittest discover && coverage report
