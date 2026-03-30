# Delta for Clean Feature (JS, HTML, CSS Playgrounds)

## ADDED Requirements

### Requirement: JS Playground Clean Feature

The JS playground MUST support a "Clean" action that removes empty code constructs from JavaScript input.

#### Scenario: Clean empty objects and arrays

- GIVEN input `"const x = {}; const y = [];"`
- WHEN clean is executed with `removeEmptyObject: true` and `removeEmptyArray: true`
- THEN output MUST be `""`

#### Scenario: Clean empty functions

- GIVEN input `"function empty() {}"`
- WHEN clean is executed with `removeEmptyFunction: true`
- THEN output MUST be `""`

#### Scenario: Preserve non-empty code

- GIVEN input `"const x = { a: 1 }; const y = [1, 2, 3];"`
- WHEN clean is executed with all options enabled
- THEN output MUST contain `x` and `y` with their values

#### Scenario: Error on invalid JS

- GIVEN input `"const x = {"`
- WHEN clean is executed
- THEN error message MUST be displayed and output MUST remain unchanged

---

### Requirement: CSS Playground Clean Feature

The CSS playground MUST support a "Clean" action that removes empty CSS rules.

#### Scenario: Clean empty rules

- GIVEN input `"div {} p { color: red; }"`
- WHEN clean is executed with `removeEmptyRules: true`
- THEN output MUST be `"p { color: red; }"`

#### Scenario: Clean rules with only comments

- GIVEN input `"div { /* comment only */ }"`
- WHEN clean is executed with `removeEmptyRules: true`
- THEN output MUST be `""`

#### Scenario: Preserve valid rules

- GIVEN input `".class { color: blue; }"`
- WHEN clean is executed
- THEN output MUST be `".class { color: blue; }"`

---

### Requirement: HTML Playground Clean Feature

The HTML playground MUST support a "Clean" action that removes empty HTML tags.

#### Scenario: Clean empty divs

- GIVEN input `"<div></div><span>text</span>"`
- WHEN clean is executed with `removeEmptyTags: true`
- THEN output MUST be `"<span>text</span>"`

#### Scenario: Preserve script and style tags

- GIVEN input `"<script></script><style></style><div>content</div>"`
- WHEN clean is executed with `removeEmptyTags: true`
- THEN output MUST contain all three tags with their content

#### Scenario: Preserve pre and textarea

- GIVEN input `"<pre></pre><textarea></textarea><div>text</div>"`
- WHEN clean is executed with `removeEmptyTags: true`
- THEN output MUST contain all elements

---

### Requirement: Clean Configuration UI

The config modal for JS, HTML, and CSS playgrounds MUST include a "Clean" section when the clean feature is enabled.

#### Scenario: Clean section visibility

- GIVEN JS, HTML, or CSS playground with clean feature
- WHEN config modal is opened
- THEN "Limpiar" section MUST be visible with toggle options

#### Scenario: Clean options persistence

- GIVEN clean options are configured
- WHEN playground is reloaded
- THEN clean options MUST be restored from localStorage

---

### Requirement: Clean Toolbar Integration

The toolbar MUST include a "Clean" button when the playground supports the clean feature.

#### Scenario: Clean button presence

- GIVEN playground with clean feature enabled
- WHEN toolbar is rendered
- THEN "Limpiar" button MUST be visible and clickable

#### Scenario: Clean button disabled during processing

- GIVEN clean operation is in progress
- WHEN user clicks "Limpiar" button
- THEN button MUST be disabled and show loading state

---

## MODIFIED Requirements

### Requirement: PlaygroundEngineWithClean

The `PlaygroundEngineWithClean` interface MUST now support JS, HTML, and CSS playgrounds in addition to JSON.

(Previously: Only JSON playground supported clean config)

#### Scenario: JS engine with clean

- GIVEN JS playground engine with `cleanConfig` defined
- WHEN GenericPlayground renders
- THEN clean toolbar and config modal MUST be available

#### Scenario: HTML engine with clean

- GIVEN HTML playground engine with `cleanConfig` defined
- WHEN GenericPlayground renders
- THEN clean toolbar and config modal MUST be available

#### Scenario: CSS engine with clean

- GIVEN CSS playground engine with `cleanConfig` defined
- WHEN GenericPlayground renders
- THEN clean toolbar and config modal MUST be available

---

### Requirement: PlaygroundFeatures

The `clean` feature flag MUST be available for all playgrounds, not just JSON.

(Previously: Clean was documented as JSON-only feature)

#### Scenario: Feature array includes clean

- GIVEN playground engine defines `features: ["clean"]`
- WHEN GenericPlayground checks for clean support
- THEN `hasClean` MUST evaluate to true

---

## REMOVED Requirements

### Requirement: JSON-only Clean (REMOVED)

The clean feature is no longer exclusive to JSON playground.

(Reason: Feature is being generalized to all playgrounds)

---

## Implementation Notes

| Playground | Clean Options                                                                       | Input Processing                                                          |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| JS         | `removeEmptyObject`, `removeEmptyArray`, `removeEmptyFunction`, `removeEmptyString` | Regex-based or lightweight parser                                         |
| CSS        | `removeEmptyRules`, `removeRulesWithOnlyComments`                                   | Regex for `{ }` patterns                                                  |
| HTML       | `removeEmptyTags`, `preserveSemanticTags`                                           | DOM parser or regex, exclude `<pre>`, `<textarea>`, `<script>`, `<style>` |

---

## Acceptance Criteria Summary

| Criterion                        | Test Method      |
| -------------------------------- | ---------------- |
| Clean removes empty code in JS   | Unit test + E2E  |
| Clean removes empty rules in CSS | Unit test + E2E  |
| Clean removes empty tags in HTML | Unit test + E2E  |
| Config modal shows clean options | Integration test |
| Toolbar shows clean button       | Integration test |
| Clean options persist            | Integration test |
| Error handling works             | Unit test        |
| Processing state shown           | Integration test |
