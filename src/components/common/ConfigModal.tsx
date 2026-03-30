import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { Checkbox } from "./Checkbox";
import { RadioGroup } from "./RadioGroup";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import type { JsFormatConfig, JsMinifyConfig, JsCleanConfig } from "@/types/js";
import type { HtmlFormatConfig, HtmlMinifyConfig, HtmlCleanConfig } from "@/types/html";
import type { CssFormatConfig, CssMinifyConfig, CssCleanConfig } from "@/types/css";
import { INDENT_OPTIONS } from "@/types/format";
import {
  DEFAULT_JSON_FORMAT_CONFIG,
  DEFAULT_JSON_MINIFY_CONFIG,
  DEFAULT_JSON_CLEAN_CONFIG,
} from "@/types/json";
import {
  DEFAULT_JS_FORMAT_CONFIG,
  DEFAULT_JS_MINIFY_CONFIG,
  DEFAULT_JS_CLEAN_CONFIG,
} from "@/types/js";
import {
  DEFAULT_HTML_FORMAT_CONFIG,
  DEFAULT_HTML_MINIFY_CONFIG,
  DEFAULT_HTML_CLEAN_CONFIG,
} from "@/types/html";
import {
  DEFAULT_CSS_FORMAT_CONFIG,
  DEFAULT_CSS_MINIFY_CONFIG,
  DEFAULT_CSS_CLEAN_CONFIG,
} from "@/types/css";
import {
  saveJsonToolsConfig,
  removeJsonToolsConfig,
  saveJsToolsConfig,
  removeJsToolsConfig,
  saveHtmlToolsConfig,
  removeHtmlToolsConfig,
  saveCssToolsConfig,
  removeCssToolsConfig,
} from "@/services/storage";

interface JsonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "json";
  formatConfig: JsonFormatConfig;
  onFormatConfigChange: (config: JsonFormatConfig) => void;
  minifyConfig: JsonMinifyConfig;
  onMinifyConfigChange: (config: JsonMinifyConfig) => void;
  cleanConfig: JsonCleanConfig;
  onCleanConfigChange: (config: JsonCleanConfig) => void;
}

interface JsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "js";
  formatConfig: JsFormatConfig;
  onFormatConfigChange: (config: JsFormatConfig) => void;
  minifyConfig: JsMinifyConfig;
  onMinifyConfigChange: (config: JsMinifyConfig) => void;
  cleanConfig: JsCleanConfig;
  onCleanConfigChange: (config: JsCleanConfig) => void;
}

interface HtmlConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "html";
  formatConfig: HtmlFormatConfig;
  onFormatConfigChange: (config: HtmlFormatConfig) => void;
  minifyConfig: HtmlMinifyConfig;
  onMinifyConfigChange: (config: HtmlMinifyConfig) => void;
  cleanConfig: HtmlCleanConfig;
  onCleanConfigChange: (config: HtmlCleanConfig) => void;
}

interface CssConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "css";
  formatConfig: CssFormatConfig;
  onFormatConfigChange: (config: CssFormatConfig) => void;
  minifyConfig: CssMinifyConfig;
  onMinifyConfigChange: (config: CssMinifyConfig) => void;
  cleanConfig: CssCleanConfig;
  onCleanConfigChange: (config: CssCleanConfig) => void;
}

type ConfigModalProps =
  | JsonConfigModalProps
  | JsConfigModalProps
  | HtmlConfigModalProps
  | CssConfigModalProps;

const MODE_LABELS: Record<string, string> = {
  json: "JSON",
  js: "JavaScript",
  html: "HTML",
  css: "CSS",
};

export function ConfigModal(props: ConfigModalProps) {
  const { t } = useTranslation();
  const mode = props.mode ?? "json";
  const modeLabel = MODE_LABELS[mode];

  // Narrowed accessors for mode-specific UI sections
  const jsonProps = mode === "json" ? (props as JsonConfigModalProps) : null;
  const htmlProps = mode === "html" ? (props as HtmlConfigModalProps) : null;
  const jsProps = mode === "js" ? (props as JsConfigModalProps) : null;
  const cssProps = mode === "css" ? (props as CssConfigModalProps) : null;
  const jsCssProps =
    mode === "js" || mode === "css" ? (props as JsConfigModalProps | CssConfigModalProps) : null;

  // Helpers for fields shared by all config variants.
  // Narrow by mode so each branch calls the correctly-typed setter.
  const updateFormat = (patch: Record<string, unknown>) => {
    const updated = { ...props.formatConfig, ...patch };
    if (props.mode === "js") props.onFormatConfigChange(updated as JsFormatConfig);
    else if (props.mode === "html") props.onFormatConfigChange(updated as HtmlFormatConfig);
    else if (props.mode === "css") props.onFormatConfigChange(updated as CssFormatConfig);
    else props.onFormatConfigChange(updated as JsonFormatConfig);
  };
  const updateMinify = (patch: Record<string, unknown>) => {
    const updated = { ...props.minifyConfig, ...patch };
    if (props.mode === "js") props.onMinifyConfigChange(updated as JsMinifyConfig);
    else if (props.mode === "html") props.onMinifyConfigChange(updated as HtmlMinifyConfig);
    else if (props.mode === "css") props.onMinifyConfigChange(updated as CssMinifyConfig);
    else props.onMinifyConfigChange(updated as JsonMinifyConfig);
  };

  const handleReset = () => {
    if (props.mode === "js") {
      props.onFormatConfigChange(DEFAULT_JS_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_JS_MINIFY_CONFIG);
      props.onCleanConfigChange(DEFAULT_JS_CLEAN_CONFIG);
      removeJsToolsConfig();
    } else if (props.mode === "html") {
      props.onFormatConfigChange(DEFAULT_HTML_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_HTML_MINIFY_CONFIG);
      props.onCleanConfigChange(DEFAULT_HTML_CLEAN_CONFIG);
      removeHtmlToolsConfig();
    } else if (props.mode === "css") {
      props.onFormatConfigChange(DEFAULT_CSS_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_CSS_MINIFY_CONFIG);
      props.onCleanConfigChange(DEFAULT_CSS_CLEAN_CONFIG);
      removeCssToolsConfig();
    } else {
      props.onFormatConfigChange(DEFAULT_JSON_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_JSON_MINIFY_CONFIG);
      props.onCleanConfigChange(DEFAULT_JSON_CLEAN_CONFIG);
      removeJsonToolsConfig();
    }
  };

  const handleClose = () => {
    if (props.mode === "js") {
      saveJsToolsConfig({
        format: props.formatConfig,
        minify: props.minifyConfig,
        clean: props.cleanConfig,
      });
    } else if (props.mode === "html") {
      saveHtmlToolsConfig({
        format: props.formatConfig,
        minify: props.minifyConfig,
        clean: props.cleanConfig,
      });
    } else if (props.mode === "css") {
      saveCssToolsConfig({
        format: props.formatConfig,
        minify: props.minifyConfig,
        clean: props.cleanConfig,
      });
    } else {
      saveJsonToolsConfig({
        format: props.formatConfig,
        minify: props.minifyConfig,
        clean: props.cleanConfig,
      });
    }
    props.onClose();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      title={`${t("modal.configTitle")} ${modeLabel}`}
      icon="cog"
      iconColor="yellow-400"
      maxWidth="max-w-3xl"
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleReset}>
            <i className="fas fa-undo"></i> {t("common.reset")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Formatear */}
        <Card
          title={`${t("config.format")} ${modeLabel}`}
          icon="indent"
          className="bg-blue-500/10 border-blue-500/20"
          headerClassName="text-blue-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">{t("config.indent")}</label>
              <ToggleButtonGroup
                options={INDENT_OPTIONS}
                value={props.formatConfig.indentSize}
                onChange={(indentSize) => updateFormat({ indentSize })}
              />
            </div>

            {jsonProps && (
              <div>
                <label className="block text-gray-300 mb-1">{t("config.sortKeys")}</label>
                <Checkbox
                  checked={jsonProps.formatConfig.sortKeys}
                  onChange={(checked) => updateFormat({ sortKeys: checked })}
                  label={t("config.enableSort")}
                  color="blue"
                />
              </div>
            )}

            {htmlProps && (
              <div>
                <label className="block text-gray-300 mb-1">{t("config.embeddedFormat")}</label>
                <div className="space-y-2">
                  <Checkbox
                    checked={htmlProps.formatConfig.formatCss}
                    onChange={(checked) => updateFormat({ formatCss: checked })}
                    label={t("config.formatCss")}
                    color="blue"
                  />
                  <Checkbox
                    checked={htmlProps.formatConfig.formatJs}
                    onChange={(checked) => updateFormat({ formatJs: checked })}
                    label={t("config.formatJs")}
                    color="blue"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-1">{t("config.autoCopy")}</label>
              <Checkbox
                checked={props.formatConfig.autoCopy}
                onChange={(checked) => updateFormat({ autoCopy: checked })}
                label={t("config.enableAutoCopy")}
                color="blue"
              />
            </div>
          </div>
        </Card>

        {/* Minificar */}
        <Card
          title={`${t("config.minify")} ${modeLabel}`}
          icon="compress"
          className="bg-purple-500/10 border-purple-500/20"
          headerClassName="text-purple-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">{t("config.minifyOptions")}</label>
              <div className="space-y-2">
                {jsCssProps && (
                  <>
                    <Checkbox
                      checked={jsCssProps.minifyConfig.removeComments}
                      onChange={(checked) => updateMinify({ removeComments: checked })}
                      label={t("config.removeComments")}
                      color="purple"
                    />
                    <Checkbox
                      checked={jsCssProps.minifyConfig.removeSpaces}
                      onChange={(checked) => updateMinify({ removeSpaces: checked })}
                      label={t("config.removeSpaces")}
                      color="purple"
                    />
                  </>
                )}

                {htmlProps && (
                  <>
                    <Checkbox
                      checked={htmlProps.minifyConfig.removeComments}
                      onChange={(checked) => updateMinify({ removeComments: checked })}
                      label={t("config.removeComments")}
                      color="purple"
                    />
                    <Checkbox
                      checked={htmlProps.minifyConfig.collapseWhitespace}
                      onChange={(checked) => updateMinify({ collapseWhitespace: checked })}
                      label={t("config.collapseWhitespace")}
                      color="purple"
                    />
                    <Checkbox
                      checked={htmlProps.minifyConfig.minifyCss}
                      onChange={(checked) => updateMinify({ minifyCss: checked })}
                      label={t("config.minifyCss")}
                      color="purple"
                    />
                    <Checkbox
                      checked={htmlProps.minifyConfig.minifyJs}
                      onChange={(checked) => updateMinify({ minifyJs: checked })}
                      label={t("config.minifyJs")}
                      color="purple"
                    />
                  </>
                )}

                {jsonProps && (
                  <>
                    <Checkbox
                      checked={jsonProps.minifyConfig.removeSpaces}
                      onChange={(checked) => updateMinify({ removeSpaces: checked })}
                      label={t("config.removeAllSpaces")}
                      color="purple"
                    />
                    <Checkbox
                      checked={jsonProps.minifyConfig.sortKeys}
                      onChange={(checked) => updateMinify({ sortKeys: checked })}
                      label={t("config.sortKeys")}
                      color="purple"
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">{t("config.autoCopyMinify")}</label>
              <Checkbox
                checked={props.minifyConfig.autoCopy}
                onChange={(checked) => updateMinify({ autoCopy: checked })}
                label={t("config.enableAutoCopy")}
                color="purple"
              />
            </div>
          </div>
        </Card>

        {/* Limpiar vacíos - JSON */}
        {jsonProps && (
          <Card
            title={t("config.clean")}
            icon="broom"
            className="bg-orange-500/10 border-orange-500/20"
            headerClassName="text-orange-400"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 mb-2">{t("config.valuesToRemove")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeNull}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeNull: checked,
                      })
                    }
                    label={t("config.null")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeUndefined}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeUndefined: checked,
                      })
                    }
                    label={t("config.undefined")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeEmptyString}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeEmptyString: checked,
                      })
                    }
                    label={t("config.emptyString")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeEmptyArray}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeEmptyArray: checked,
                      })
                    }
                    label={t("config.emptyArray")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeEmptyObject}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeEmptyObject: checked,
                      })
                    }
                    label={t("config.emptyObject")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">{t("config.outputFormat")}</label>
                <RadioGroup
                  name="cleanOutputMode"
                  value={jsonProps.cleanConfig.outputFormat}
                  options={[
                    { value: "format", label: t("config.format") },
                    { value: "minify", label: t("config.minify") },
                  ]}
                  onChange={(value) =>
                    jsonProps.onCleanConfigChange({ ...jsonProps.cleanConfig, outputFormat: value })
                  }
                  color="orange"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{t("config.autoCopyMinify")}</label>
                <Checkbox
                  checked={jsonProps.cleanConfig.autoCopy}
                  onChange={(checked) =>
                    jsonProps.onCleanConfigChange({ ...jsonProps.cleanConfig, autoCopy: checked })
                  }
                  label={t("config.enableAutoCopy")}
                  color="orange"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Limpiar vacíos - JS */}
        {jsProps && (
          <Card
            title={t("config.clean")}
            icon="broom"
            className="bg-orange-500/10 border-orange-500/20"
            headerClassName="text-orange-400"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 mb-2">{t("config.valuesToRemove")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <Checkbox
                    checked={jsProps.cleanConfig.removeEmptyString}
                    onChange={(checked) =>
                      jsProps.onCleanConfigChange({
                        ...jsProps.cleanConfig,
                        removeEmptyString: checked,
                      })
                    }
                    label={t("config.emptyString")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsProps.cleanConfig.removeEmptyArray}
                    onChange={(checked) =>
                      jsProps.onCleanConfigChange({
                        ...jsProps.cleanConfig,
                        removeEmptyArray: checked,
                      })
                    }
                    label={t("config.emptyArray")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsProps.cleanConfig.removeEmptyObject}
                    onChange={(checked) =>
                      jsProps.onCleanConfigChange({
                        ...jsProps.cleanConfig,
                        removeEmptyObject: checked,
                      })
                    }
                    label={t("config.emptyObject")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsProps.cleanConfig.removeEmptyFunction}
                    onChange={(checked) =>
                      jsProps.onCleanConfigChange({
                        ...jsProps.cleanConfig,
                        removeEmptyFunction: checked,
                      })
                    }
                    label={t("config.emptyFunction")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{t("config.autoCopyMinify")}</label>
                <Checkbox
                  checked={jsProps.cleanConfig.autoCopy}
                  onChange={(checked) =>
                    jsProps.onCleanConfigChange({ ...jsProps.cleanConfig, autoCopy: checked })
                  }
                  label={t("config.enableAutoCopy")}
                  color="orange"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Limpiar vacíos - CSS */}
        {cssProps && (
          <Card
            title={t("config.clean")}
            icon="broom"
            className="bg-orange-500/10 border-orange-500/20"
            headerClassName="text-orange-400"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 mb-2">{t("config.rulesToRemove")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <Checkbox
                    checked={cssProps.cleanConfig.removeEmptyRules}
                    onChange={(checked) =>
                      cssProps.onCleanConfigChange({
                        ...cssProps.cleanConfig,
                        removeEmptyRules: checked,
                      })
                    }
                    label={t("config.emptyRules")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={cssProps.cleanConfig.removeRulesWithOnlyComments}
                    onChange={(checked) =>
                      cssProps.onCleanConfigChange({
                        ...cssProps.cleanConfig,
                        removeRulesWithOnlyComments: checked,
                      })
                    }
                    label={t("config.rulesWithOnlyComments")}
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{t("config.autoCopyMinify")}</label>
                <Checkbox
                  checked={cssProps.cleanConfig.autoCopy}
                  onChange={(checked) =>
                    cssProps.onCleanConfigChange({ ...cssProps.cleanConfig, autoCopy: checked })
                  }
                  label={t("config.enableAutoCopy")}
                  color="orange"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Limpiar vacíos - HTML */}
        {htmlProps && (
          <Card
            title={t("config.clean")}
            icon="broom"
            className="bg-orange-500/10 border-orange-500/20"
            headerClassName="text-orange-400"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 mb-2">{t("config.tagsToRemove")}</label>
                <Checkbox
                  checked={htmlProps.cleanConfig.removeEmptyTags}
                  onChange={(checked) =>
                    htmlProps.onCleanConfigChange({
                      ...htmlProps.cleanConfig,
                      removeEmptyTags: checked,
                    })
                  }
                  label={t("config.emptyTags")}
                  color="orange"
                  containerClassName="p-2 bg-white/5 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{t("config.autoCopyMinify")}</label>
                <Checkbox
                  checked={htmlProps.cleanConfig.autoCopy}
                  onChange={(checked) =>
                    htmlProps.onCleanConfigChange({ ...htmlProps.cleanConfig, autoCopy: checked })
                  }
                  label={t("config.enableAutoCopy")}
                  color="orange"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}
