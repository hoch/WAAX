# variables
hdr = "[WAAX]"

all: starting dependencies complete

reset: clean dependencies complete

starting:
	@echo "$(hdr) Starting Installation at..."
	@pwd

dependencies:
	@echo "$(hdr) Getting Node packages..."
	@npm install
	@echo "$(hdr) Getting Bower components..."
	@bower install

complete:
	@echo "$(hdr) Installation completed."

clean:
	@echo "$(hdr) Cleaning up packages..."
	@rm -rf node_modules/
	@rm -rf bower_components/

testcore:
	@echo "$(hdr) Testing..."
	npm test