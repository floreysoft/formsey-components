import { customElement, html, property, query, queryAll, TemplateResult } from "lit-element";
import { ifDefined } from 'lit-html/directives/if-defined';
import { Components, getFormatter, getLibrary, Settings } from './Components';
import { createField, Field } from './Field';
import { FormDefinition } from './FieldDefinitions';
import { InvalidErrors, InvalidEvent } from './InvalidEvent';
import { LabeledField } from "./LabeledField";
import { Breakpoints, Layout } from "./ResponsiveLayout";
import { ValueChangedEvent } from './ValueChangedEvent';

export const SUPPORTED_BREAKPOINTS = ["xs", "s", "m", "l", "xl"]

export const DEFAULT_BREAKPOINTS: Breakpoints = {
  "xs": 320,
  "s": 568,
  "m": 768,
  "l": 1024,
  "xl": 1366
}
@customElement("formsey-form-field")
export class FormField<D extends FormDefinition, V extends any> extends LabeledField<D, V> {
  @property({ converter: Object })
  // @ts-ignore()
  set value(value: V) {
    this._value = value
    this.applyHiddenFields()
    this.removeDeletedFields()
    this.requestUpdate()
  }

  get value() {
    return this._value
  }

  @property({ converter: Object })
  // @ts-ignore()
  set definition(definition: D) {
    this._definition = definition;
    this.applyHiddenFields();
    this.removeDeletedFields()
    this.updateLayout()
    this.requestUpdate();
  }

  get definition() {
    return this._definition
  }

  protected _value: V
  protected _definition: D

  @queryAll(".fff")
  protected _fields: HTMLElement[]

  @property()
  protected layout: Layout

  protected size: string
  private resizeObserver: ResizeObserver

  @query(".ffg")
  private grid: HTMLElement

  constructor() {
    super()
    this.resizeObserver = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
        this.resize(entry.contentRect.width)
      }
    });
  }

  renderField() {
    let templates: TemplateResult[] = []
    let hidden: TemplateResult[] = []
    const formatter = getFormatter(this.layout?.formatter)
    if (this.definition.fields) {
      for (let field of this.definition.fields) {
        let value: any
        if (field.hasOwnProperty('fields') && !field.name) {
          // Anonymous nested form, so let's copy all form fields
          value = {}
          this.applyNestedFields(value, <FormDefinition>field)
        } else {
          value = this.value && field.name ? this.value[field.name] : undefined
        }
        let fieldTemplate = html`${createField(this.components, this.settings, field, value, this.path(), this.errors, (event: ValueChangedEvent<any>) => this.changed(event), (event: InvalidEvent) => this.invalid(event))}`
        if (field.type == "hidden") {
          hidden.push(fieldTemplate)
        } else {
          templates.push(html`<div class='fff' style="${ifDefined(formatter?.fieldStyle(this.layout, field))}">${fieldTemplate}</div>`)
        }
      }
    }
    return html`<section style="${ifDefined(this.definition?.layout?.style)}"><div class="ffg" style="${ifDefined(formatter?.containerStyle(this.layout, this.definition))}" @gridSizeChanged="${this.gridSizeChanged}">${templates}</div>${hidden}</section>`
  }

  gridSizeChanged(e: CustomEvent) {
    e.stopPropagation()
    this.dispatchEvent(new CustomEvent('gridSizeChanged', { bubbles: true, composed: true, detail: { id: this.domPath() + "." + e.detail.id, size: e.detail.size } }))
  }

  firstUpdated() {
    this.resizeObserver.observe(this.grid)
  }

  updated() {
    let counter = 0;
    for (let field of this._fields) {
      let child = field.firstElementChild as any
      if (child && typeof child['setIndex'] == "function") {
        child.setIndex(counter)
        counter++
      }
    }
  }

  public focusField(path: string): boolean {
    for (let field of this._fields) {
      let child = field.firstElementChild as Field<any, any>
      if (child && typeof child['focusField'] == "function" && path?.startsWith(child.path())) {
        return (<any>child).focusField(path)
      }
    }
    return false
  }

  public clearCustomValidity() {
    super.clearCustomValidity()
    for (let field of this._fields) {
      let child = field.firstElementChild as Field<any, any>
      child.clearCustomValidity()
    }
  }

  public setCustomValidity(customErrors: InvalidErrors) {
    super.setCustomValidity(customErrors)
    for (let field of this._fields) {
      let child = field.firstElementChild as Field<any, any>
      child.clearCustomValidity()
      child.setCustomValidity(customErrors)
    }
  }

  public validate(report: boolean, path?: string) {
    let validity = true;
    for (let field of this._fields) {
      let child = field.firstElementChild as Field<any, any>
      let valid: boolean
      if (report) {
        valid = child.reportValidity();
      } else {
        valid = child.checkValidity();
      }
      if (!valid) {
        validity = false;
      }
    }
    return validity;
  }

  protected resize(availableWidth: number) {
    // If available with larger than larges breakpoint, default to the largest
    let detectedSize = SUPPORTED_BREAKPOINTS[SUPPORTED_BREAKPOINTS.length - 1]
    for (let size of SUPPORTED_BREAKPOINTS) {
      let breakpoint = this.definition?.layout?.breakpoints?.[size]
      if (typeof breakpoint === "undefined") {
        breakpoint = DEFAULT_BREAKPOINTS[size]
      }
      if (breakpoint > availableWidth) {
        detectedSize = size
        break
      }
    }
    if (this.size != detectedSize) {
      // console.log("Grid size in form=" + this.definition.name + " changed from '" + this.gridSize + "' to '" + size + "'")
      this.size = detectedSize
      this.updateLayout()
      this.dispatchEvent(new CustomEvent('gridSizeChanged', { bubbles: true, composed: true, detail: { id: this.domPath(), size: detectedSize } }))
    }
  }

  protected updateLayout() {
    let layout
    for (let size of SUPPORTED_BREAKPOINTS) {
      layout = this.definition?.layout?.sizes?.[size] || layout
      if (this.size == size) {
        this.layout = layout || this.layout
        break;
      }
    }
  }

  protected changed(e: ValueChangedEvent<any>) {
    e.stopPropagation()
    if (e.detail?.name) {
      if (!this.definition.name) {
        // If this is an unnamed form, just pass event to parent
        this.dispatchEvent(new ValueChangedEvent(e.type as "input" | "change" | "inputChange", e.detail.name, e.detail.value));
      } else {
        let name = e.detail.name.substring(this.path().length + 1).split('.')[0]
        if (!this.value) {
          this.value = {} as V
        }
        this.value[name] = e.detail.value;
        this.dispatchEvent(new ValueChangedEvent(e.type as "input" | "change" | "inputChange", this.path(), this.value));
      }
    }
  }

  protected removeDeletedFields() {
    if (this._definition && this._definition.fields && this._value) {
      // Remove values from fields that have been removed from the definition
      let newValue = {}
      for (let field of this._definition.fields) {
        if (typeof field.name != "undefined" && typeof this.value[field.name] != "undefined") {
          newValue[field.name] = this.value[field.name]
        }
        if (field.hasOwnProperty('fields') && !field.name) {
          this.addUnnamedNestedFormFields(newValue, field as FormDefinition)
        }
      }
      this.addMemberValueIfPresent("type", newValue)
      this.addMemberValueIfPresent("layout", newValue)
      this._value = newValue as V
    }
  }

  protected addUnnamedNestedFormFields(newValue: Object, formField: FormDefinition) {
    for (let field of formField.fields) {
      if (typeof field.name != "undefined" && typeof this.value[field.name] != "undefined") {
        newValue[field.name] = this.value[field.name]
      }
      if (field.hasOwnProperty('fields') && !field.name) {
        this.addUnnamedNestedFormFields(newValue, field as FormDefinition)
      }
    }
  }

  protected addMemberValueIfPresent(name: string, newValue: Object) {
    if (typeof this.value[name] != "undefined") {
      newValue[name] = this.value[name]
    }
  }

  protected applyHiddenFields() {
    if (this._definition && this._definition.fields && this._value) {
      for (let field of this._definition.fields) {
        if (field.type == "hidden") {
          if (field.name && field.default) {
            this._value[field.name] = field.default;
          }
        }
      }
    }
  }

  protected applyNestedFields(value: Object, field: FormDefinition) {
    for (let nestedField of field.fields) {
      if (nestedField) {
        value[nestedField.name] = this.value[nestedField.name]
        if (nestedField.hasOwnProperty('fields') && !nestedField.name) {
          this.applyNestedFields(value, <FormDefinition>nestedField)
        }
      }
    }
  }

  private domPath() {
    const container = this.closestElement(".fff", this)
    if (container && container.parentElement) {
      const index = [...Array.from(container.parentElement.children)].indexOf(container)
      return index
    } else {
      return 0
    }
  }

  private closestElement(selector: string, base: Element = this) {
    function __closestFrom(el: Element | Window | Document): Element {
      if (!el || el === document || el === window) return null;
      if ((el as any).assignedSlot) el = (el as any).assignedSlot;
      let found = (el as Element).closest(selector);
      return found
        ? found
        : __closestFrom(((el as Element).getRootNode() as ShadowRoot).host);
    }
    return __closestFrom(base);
  }
}
getLibrary("native").registerComponent("form", {
  importPath: "@formsey/fields-core/FormField",
  factory: (components: Components, settings: Settings, definition: FormDefinition, value: Object, parentPath: string, errors: InvalidErrors, changeHandler: any, invalidHandler: any, id?: string) => {
    return html`<formsey-form-field id="${ifDefined(id)}" .components=${components} .settings=${settings} .definition=${definition} .value=${value} .parentPath=${parentPath} .errors=${errors} @change="${changeHandler}" @input="${changeHandler}" @inputChange="${changeHandler}" @invalid=${invalidHandler}></formsey-form-field>`
  }
})