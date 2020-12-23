import { Components, getLibrary, Settings } from '@formsey/core/Components';
import { FieldDefinition, NestedFormDefinition } from '@formsey/core/FieldDefinitions';
import { InvalidErrors } from '@formsey/core/InvalidEvent';
import { customElement, html } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined';
import { createField } from './Field';
import { InvalidEvent } from './InvalidEvent';
import { NestedFormField } from "./NestedFormField";
import { ValueChangedEvent } from './ValueChangedEvent';

@customElement("formsey-toolbar")
export class Toolbar extends NestedFormField<NestedFormDefinition> {
  render() {
    return html`${this.definition.label ? html`<label class="lfl">${this.definition.label}</label>` : undefined}
    <div class="tb">${createField(this.components, this.settings, this.definition.form, this.value, this.parentPath, this.errors, (event: ValueChangedEvent<any>) => this.changed(event), (event: InvalidEvent) => this.invalid(event))}</div>
    ${this.definition.helpText ? html`<label class="lfht">${this.definition.helpText}</label>` : undefined}`;
  }
}
getLibrary("native").registerComponent("toolbar", {
  importPath: "@formsey/core/Toolbar",
  factory: (components: Components, settings: Settings, definition: FieldDefinition, value: Object, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-toolbar id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-toolbar>`
  }
})