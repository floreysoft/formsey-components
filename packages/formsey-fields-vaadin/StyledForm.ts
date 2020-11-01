import { Components, getLibrary, Settings } from '@formsey/core/Components';
import { createField } from '@formsey/core/Field';
import { FieldDefinition } from '@formsey/core/FieldDefinitions';
import { Form } from '@formsey/core/Form';
import { FormField } from '@formsey/core/FormField';
import { InvalidErrors, InvalidEvent } from '@formsey/core/InvalidEvent';
import { ValueChangedEvent } from '@formsey/core/ValueChangedEvent';
import { css, customElement, html, query } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined';
import { FORM_STYLES } from './styles';

@customElement("formsey-styled-form-vaadin")
export class StyledForm extends Form {
  @query(".themed")
  themed: HTMLElement

  static get styles() {
    return [...super.styles, FORM_STYLES, css`
      .themed {
        color: var(--lumo-body-text-color);
        background-color: var(--lumo-base-color);
      }
    `]
  }

  @query('#form')
  form: FormField

  render() {
    let field = undefined
    if (this.definition) {
      field = createField(this.components, this.settings, this.definition, this.value, this.definition?.name, this.errors, (event: ValueChangedEvent<any>) => this.changed(event), (event: InvalidEvent) => this.invalid(event), 'form');
    }
    const form = html`
    <custom-style>
      <style include="lumo-color lumo-typography"></style>
    </custom-style>
    <slot name="top"></slot><form novalidate @submit="${this.submit}" action="${ifDefined(this.action)}" method="${ifDefined(this.method)}" target="${ifDefined(this.target)}">${field}<slot></slot></form>`
    return this.settings ? html`<div class="themed" theme="${ifDefined(this.settings['theme'])}">${form}</div>` : form
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this.attachShadow({ mode: 'open' });
  }

  updated() {
    if (this.settings) {
      const theme = this.settings['theme']
      document.querySelector('html').setAttribute('theme', theme)
      const properties = this.settings[theme]
      if (properties) {
        this.themed.setAttribute("style", "")
        Object.entries(properties).forEach(([key, value]) => {
          this.themed.style.setProperty(key, value as string);
        })
      }
    }
  }

  protected changed(e: ValueChangedEvent<any>) {
    this.dispatchEvent(new ValueChangedEvent(e.type as "change" | "input" | "inputChange", e.detail.name, e.detail.value));
  }

  protected invalid(e: InvalidEvent) {
    e.stopPropagation()
    this.dispatchEvent(new InvalidEvent(e.errors));
  }
}

getLibrary("vaadin").registerComponent("styledForm", {
  importPath: "@formsey/fields-vaadin/StyledForm",
  factory: (components: Components, settings: Settings, definition: FieldDefinition, value: Object, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-styled-form-vaadin id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-styled-form-vaadin>`
  }
})