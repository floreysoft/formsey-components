import { area, createField, Field, FormDefinition, register, ValueChangedEvent } from './index';
import { html, property, query, queryAll, TemplateResult } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import ResizeObserver from 'resize-observer-polyfill';
import { Breakpoints, NestedFormDefinition } from './FieldDefinitions';
import { InvalidErrors, InvalidEvent } from './InvalidEvent';

export const SUPPORTED_BREAKPOINTS = ["xs", "s", "m", "l", "xl"]

export const DEFAULT_BREAKPOINTS: Breakpoints = {
  "xs": 320,
  "s": 568,
  "m": 768,
  "l": 1024,
  "xl": 1366
}

const DEFAULT_LAYOUT = "grid-template-columns:1fr;grid-gap:5px 5px"

export class FormField extends Field<FormDefinition, Object> {
  @property({ converter: Object })
  set value(value: Object) {
    this._value = value
    this.applyHiddenFields()
    this.removeDeletedFields()
    this.requestUpdate()
  }

  get value() {
    return this._value;
  }

  @property({ converter: Object })
  set definition(definition: FormDefinition) {
    this._definition = definition;
    this.applyHiddenFields();
    this.removeDeletedFields()
    this.updateGridLayout()
    this.requestUpdate();
  }

  get definition() {
    return this._definition
  }

  @property()
  private gridLayout: string = DEFAULT_LAYOUT

  protected _value: Object = {}
  protected _definition: FormDefinition

  @queryAll(".fff")
  protected _fields: HTMLElement[]

  private resizeObserver: ResizeObserver
  private gridSize: string

  @query(".ffg")
  private grid: HTMLElement

  constructor() {
    super()
    this.resizeObserver = new ResizeObserver((entries, observer) => {
      for (const entry of entries) {
        this.layout(entry.contentRect.width)
      }
    });
  }

  render() {
    let templates: TemplateResult[] = []
    let style = "padding:10px"
    if (this.definition.layout) {
      style = this.definition.layout.style
    }
    if (this.definition.fields) {
      for (let field of this.definition.fields) {
        let fieldErrors = new InvalidErrors()
        let value: any
        if (field.hasOwnProperty('form') && !field.name) {
          // Anonymous nested form, so let's copy all form fields
          value = {}
          this.applyNestedFields(value, <NestedFormDefinition>field)
          this.applyNestedErrors(this.errors, fieldErrors, <NestedFormDefinition>field)
        } else {
          value = this.value && field.name ? this.value[field.name] : undefined
          this.addFieldErrors(this.errors, fieldErrors, field.name)
        }
        let fieldTemplate = html`${createField(this.components, field, value, this.path(), fieldErrors, (event: ValueChangedEvent<any>) => this.changed(event), (event: InvalidEvent) => this.invalid(event))}`
        if (this.gridLayout.indexOf('grid-template-areas') >= 0) {
          templates.push(html`<div class='fff' style="grid-area:_${area(field, this.definition.fields)}">${fieldTemplate}</div>`)
        } else {
          templates.push(html`<div class='fff'>${fieldTemplate}</div>`)
        }
      }
    }
    let header: TemplateResult[] = []
    if (this.definition.label) {
      header.push(html`<div class="fft">${this.definition.label}</div>`)
    }
    if (this.definition.helpText) {
      header.push(html`<div class="ffd">${this.definition.helpText}</div>`)
    }
    return html`<section style="${ifDefined(style)}">${header}<div class="ffg" style="${this.gridLayout}" @gridSizeChanged="${this.gridSizeChanged}">${templates}</div></section>`
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
      if (typeof child['setIndex'] == "function") {
        child.setIndex(counter)
        counter++
      }
    }
  }

  public focusField(path: string) {
    for (let field of this._fields) {
      let child = field.firstElementChild as Field<any, any>
      if (child && typeof child['focusField'] == "function" && path.startsWith(child.path())) {
        (<any>child).focusField(path)
      }
    }
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
      let fieldDefinition = child.definition
      let fieldErrors = new InvalidErrors()
      if (fieldDefinition.hasOwnProperty('form') && !fieldDefinition.name) {
        this.applyNestedErrors(customErrors, fieldErrors, <NestedFormDefinition>fieldDefinition)
      } else {
        this.addFieldErrors(customErrors, fieldErrors, fieldDefinition.name)
      }
      child.setCustomValidity(fieldErrors)
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

  protected layout(availableWidth: number) {
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
    if (this.gridSize != detectedSize) {
      // console.log("Grid size in form=" + this.definition.name + " changed from '" + this.gridSize + "' to '" + size + "'")
      this.gridSize = detectedSize
      this.updateGridLayout()
      this.dispatchEvent(new CustomEvent('gridSizeChanged', { bubbles: true, composed: true, detail: { id: this.domPath(), size: detectedSize } }))
    }
  }

  protected updateGridLayout() {
    let gridLayout = DEFAULT_LAYOUT
    for (let size of SUPPORTED_BREAKPOINTS) {
      gridLayout = this.definition?.layout?.grids?.[size] ? this.definition.layout.grids[size] : gridLayout
      if (this.gridSize == size) {
        this.gridLayout = gridLayout ? gridLayout : this.gridLayout
        break;
      }
    }
  }

  protected changed(e: ValueChangedEvent<any>) {
    e.stopPropagation()
    if (e.detail?.name) {
      if ( !this.definition.name ) {
        // If this is an unnamed form, just pass event to parent
        this.dispatchEvent(new ValueChangedEvent(e.type as "input" | "change", e.detail.name, e.detail.value));
      } else {
        let name = e.detail.name.substring(this.path().length+1).split('.')[0]
        if (!this.value) {
          this.value = {}
        }
        this.value[name] = e.detail.value;
        this.dispatchEvent(new ValueChangedEvent(e.type as "input" | "change", this.path(), this.value));
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
        if (field.hasOwnProperty('form') && !field.name) {
          this.addUnnamedNestedFormFields(newValue, field as NestedFormDefinition)
        }
      }
      this.addMemberValueIfPresent("type", newValue)
      this.addMemberValueIfPresent("layout", newValue)
      this._value = newValue
    }
  }

  protected addUnnamedNestedFormFields(newValue: Object, nestedFormField: NestedFormDefinition) {
    for (let field of nestedFormField.form.fields) {
      if (typeof field.name != "undefined" && typeof this.value[field.name] != "undefined") {
        newValue[field.name] = this.value[field.name]
      }
      if (field.hasOwnProperty('form') && !field.name) {
        this.addUnnamedNestedFormFields(newValue, field as NestedFormDefinition)
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

  protected applyNestedFields(value: Object, field: NestedFormDefinition) {
    for (let nestedField of field.form.fields) {
      if (nestedField) {
        value[nestedField.name] = this.value[nestedField.name]
        if (nestedField.hasOwnProperty('form') && !nestedField.name) {
          this.applyNestedFields(value, <NestedFormDefinition>nestedField)
        }
      }
    }
  }

  protected applyNestedErrors(errors: InvalidErrors, fieldErrors: InvalidErrors, field: NestedFormDefinition) {
    for (let nestedField of field.form.fields) {
      if (nestedField) {
        this.addFieldErrors(errors, fieldErrors, nestedField.name)
        if (nestedField.hasOwnProperty('form') && !nestedField.name) {
          this.applyNestedErrors(errors, fieldErrors, <NestedFormDefinition>nestedField)
        }
      }
    }
  }

  protected invalid(e: InvalidEvent) {
    e.stopPropagation()
    e.errors.forEach((error, path) => {
      this.errors.set(this.definition.name ? this.definition.name + "." + path : path, error)
    })
    this.dispatchEvent(new InvalidEvent(this.errors))
  }

  private addFieldErrors(errors : InvalidErrors, fieldErrors: InvalidErrors, field: string) {
    if (errors) {
      errors.forEach((error, path) => {
        if (this.definition.name && (path == this.definition.name + "." + field || path.startsWith(this.definition.name + "." + field + ".") || path.startsWith(this.definition.name + "." + field + "["))) {
          fieldErrors.set(path.substring((this.definition.name + ".").length), error)
        } else if (path.startsWith(field + "[")) {
          fieldErrors.set(path, error)
        } else if (path == field || path.startsWith(field + ".")) {
          fieldErrors.set(path, error)
        }
      })
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
      if ((el as Slotable).assignedSlot) el = (el as Slotable).assignedSlot;
      let found = (el as Element).closest(selector);
      return found
        ? found
        : __closestFrom(((el as Element).getRootNode() as ShadowRoot).host);
    }
    return __closestFrom(base);
  }
}
register("formsey-form-field", FormField, ["native", "vaadin"], "form", "@formsey/fields-native/FormField")