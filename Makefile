# Local dev. The site is static; this only serves it.
PORT ?= 8000
PID  := .serve.pid
URL  := http://127.0.0.1:$(PORT)

.PHONY: serve stop restart check

# Absolute asset paths (/assets/...) mean this must serve the repo root.
serve:
	@if [ -f $(PID) ] && kill -0 $$(cat $(PID)) 2>/dev/null; then \
		echo "already serving $(URL) (pid $$(cat $(PID)))"; \
	else \
		nohup python3 -m http.server $(PORT) --bind 127.0.0.1 >/dev/null 2>&1 & \
		echo $$! > $(PID); \
		sleep 0.4; \
		echo "serving $(URL)"; \
	fi

stop:
	@if [ -f $(PID) ] && kill -0 $$(cat $(PID)) 2>/dev/null; then \
		kill $$(cat $(PID)) && echo "stopped (pid $$(cat $(PID)))"; \
	else \
		echo "not running"; \
	fi; \
	rm -f $(PID)

restart: stop serve

check:
	@node scripts/verify-docs.js
