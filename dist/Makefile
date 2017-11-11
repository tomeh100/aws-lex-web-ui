all: copy-bundle build-botloader lex-web-ui-mobile-hub.zip
.PHONY: all

# build the application bundle
WEB_UI_DIR := ../lex-web-ui
WEB_UI_SRC_FILES := $(shell git ls-files $(WEB_UI_DIR)/src)
WEB_UI_BUNDLE_DIR := $(WEB_UI_DIR)/dist/bundle
LIBRARY_SRC_FILES := $(wildcard $(WEB_UI_BUNDLE_DIR)/lex-web-ui.*)
LIBRARY_SRC_FILES += $(wildcard $(WEB_UI_BUNDLE_DIR)/*-worker.*)
LIBRARY_FILES := $(patsubst $(WEB_UI_BUNDLE_DIR)/%,%,$(LIBRARY_SRC_FILES))

# build the application bundle
$(LIBRARY_SRC_FILES): $(WEB_UI_SRC_FILES)
	@echo "[INFO] Building from dir [$(WEB_UI_DIR)]"
	cd $(WEB_UI_DIR) && npm run build-dist

# copy library files to dist dir
$(LIBRARY_FILES): $(LIBRARY_SRC_FILES)
	@echo "[INFO] Copying library files"
	cp $(?) .

copy-bundle: $(LIBRARY_SRC_FILES) $(LIBRARY_FILES)

# copy webiste bot loader files from source to dist dir
SRC_DIR := ../src
WEBSITE_SRC_DIR := $(SRC_DIR)/website
BOTLOADER_IFRAME_SRC_BASE_NAME := chatbot-ui-iframe-loader
BOTLOADER_IFRAME_SRC_JS_FILE := $(WEBSITE_SRC_DIR)/$(BOTLOADER_IFRAME_SRC_BASE_NAME).js
BOTLOADER_IFRAME_TARGET_JS_FILE := $(BOTLOADER_IFRAME_SRC_BASE_NAME).js
BOTLOADER_IFRAME_SRC_CSS_FILE := $(WEBSITE_SRC_DIR)/$(BOTLOADER_IFRAME_SRC_BASE_NAME).css
BOTLOADER_IFRAME_TARGET_CSS_FILE := $(BOTLOADER_IFRAME_SRC_BASE_NAME).css

$(BOTLOADER_IFRAME_TARGET_CSS_FILE): $(BOTLOADER_IFRAME_SRC_CSS_FILE)
	@echo "[INFO] processing iframe bot loader css file"
	npx postcss $(<) --map --use autoprefixer -o $(@)

$(BOTLOADER_IFRAME_TARGET_JS_FILE): $(BOTLOADER_IFRAME_SRC_JS_FILE)
	@echo "[INFO] processing iframe bot loader js file"
	npx eslint $(<)
	npx babel $(<) --source-maps true -o $(@)

BOTLOADER_SRC_BASE_NAME := chatbot-ui-loader
BOTLOADER_SRC_JS_FILE := $(WEBSITE_SRC_DIR)/$(BOTLOADER_SRC_BASE_NAME).js
BOTLOADER_TARGET_JS_FILE := $(BOTLOADER_SRC_BASE_NAME).js
BOTLOADER_SRC_CSS_FILE := $(WEBSITE_SRC_DIR)/$(BOTLOADER_SRC_BASE_NAME).css
BOTLOADER_TARGET_CSS_FILE := $(BOTLOADER_SRC_BASE_NAME).css

$(BOTLOADER_TARGET_CSS_FILE): $(BOTLOADER_SRC_CSS_FILE)
	@echo "[INFO] processing bot loader css file"
	npx postcss $(<) --map --use autoprefixer -o $(@)

$(BOTLOADER_TARGET_JS_FILE): $(BOTLOADER_SRC_JS_FILE)
	@echo "[INFO] processing bot loader js file"
	npx eslint $(<)
	npx babel $(<) --source-maps true -o $(@)

build-botloader: $(BOTLOADER_IFRAME_TARGET_CSS_FILE) $(BOTLOADER_IFRAME_TARGET_JS_FILE) \
	$(BOTLOADER_TARGET_CSS_FILE) $(BOTLOADER_TARGET_JS_FILE)

# create mobile hub zip file
MH_ZIP_FILES := $(wildcard $(WEBSITE_SRC_DIR)/*)
SRC_CONFIG_DIR := $(SRC_DIR)/config
MH_ZIP_FILES += $(wildcard $(SRC_CONFIG_DIR)/*.json)
MH_ZIP_FILES += $(SRC_CONFIG_DIR)/mobile-hub-project.yml
lex-web-ui-mobile-hub.zip: $(MH_ZIP_FILES) $(LIBRARY_FILES) $(MH_PROJECT_FILE)
	@echo "[INFO] Building Mobile Hub project [$(@)] with files: [$(^)]"
	@zip -u -j lex-web-ui-mobile-hub.zip $(^)

clean:
	-rm -f ./*.{css,js,json,html,map,yml,zip}
.PHONY: clean
