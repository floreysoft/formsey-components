import { Ace } from '@floreysoft/ace';
import { InputFieldDefinition, LabeledField } from '@formsey/core';
import { getLibrary, Resources } from '@formsey/core/Registry';
import { ValueChangedEvent } from '@formsey/core/ValueChangedEvent';
import { html } from "lit";
import { customElement, property, query } from "lit/decorators";
import { ifDefined } from 'lit/directives/if-defined';


export interface SourceCodeFieldDefinition extends InputFieldDefinition {
  theme?: string
  mode?: string
  gutter?: boolean
  height?: number
}
@customElement("formsey-sourcecode")
export class SourceCodeField extends LabeledField<SourceCodeFieldDefinition, string> {
  @property({ type: String })
  value: string

  @query("fs-ace")
  editor: Ace

  protected renderField() {
    return html`
    <style>
      fs-ace {
        flex-grow: 1;
        --fs-token-invisible: var(--formsey-palette-1);
        --fs-token-language:  var(--formsey-palette-1);
        --fs-token-keyword: var(--formsey-palette-1);
        --fs-token-string: var(--formsey-palette-1);
        --fs-token-library: var(--formsey-palette-2);
        --fs-token-invalid: var(--formsey-palette-2);
        --fs-token-operator: var(--formsey-palette-2);
        --fs-token-function: var(--formsey-palette-2);
        --fs-token-type: var(--formsey-palette-2);
        --fs-token-comment: var(--formsey-palette-3);
        --fs-token-tag: var(--formsey-palette-3);
        --fs-token-numeric: var(--formsey-palette-3);
        --fs-token-variable: var(--formsey-palette-4);
        --fs-marker-step: var(--formsey-palette-4);
        --fs-marker-stack: var(--formsey-palette-4);
        --fs-marker-selection: var(--formsey-shade);
        --fs-marker-selected-word: var(--formsey-shade);
        --fs-token-constant: var(--formsey-text);
        --fs-text-color: var(--formsey-color);
    }
    </style>
    <fs-ace class="input" style="min-height:${ifDefined(this.definition.height)}" .value=${this.value} ?gutter="${this.definition.gutter}" mode="${ifDefined(this.definition.mode)}" theme="${ifDefined(this.definition.theme)}" ?readonly="${this.definition.readonly}" @change=${this.changed} @focus="${this.focused}" @blur="${this.blurred}"></fs-ace>`;
  }

  focusField() {
    if (this.editor) {
      this.editor.focus()
    }
  }

  protected changed(e: any) {
    e.stopPropagation()
    this.value = e.detail.value;
    if (this.definition.name) {
      this.dispatchEvent(new ValueChangedEvent("input", this.path(), this.value));
    }
  }
}

getLibrary("native").registerComponent("sourceCode", {
  importPath: "@formsey/fields-native-extended/SourceCodeField",
  template: ({ library, context, settings, definition, value, parentPath, errors, changeHandler, invalidHandler, id }: Resources<SourceCodeFieldDefinition, string>) => {
    return html`<formsey-sourcecode id="${ifDefined(id)}" .library=${library} .settings=${settings} .definition=${definition} .context=${context} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-sourcecode>`
  }
})