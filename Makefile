run-nested-session:
	dbus-run-session -- gnome-shell --devkit --wayland

format:
	npx prettier@3.7.4 -w .

install: package
	gnome-extensions install improved-workspace-indicator@michaelaquilina.github.io.zip --force

package:
	rm -f *.zip
	zip -r improved-workspace-indicator@michaelaquilina.github.io.zip . --exclude=*.compiled --exclude=README.md --exclude=.gitignore --exclude=screenshot.png --exclude=.git/\* --exclude=.circleci/\* --exclude=Makefile
