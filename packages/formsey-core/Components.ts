import { TemplateResult } from 'lit-element';
import { FieldDefinition, FormDefinition } from './FieldDefinitions';
import { InvalidErrors } from './InvalidEvent';
import { Layout } from './Layouts';

let customElementRegistry = window.customElements;
// @ts-ignore
if (!customElementRegistry.oldDefine) {
  // @ts-ignore
  customElementRegistry.oldDefine = customElementRegistry.define
  customElementRegistry.define = function (tag, cstr) {
    try {
      // @ts-ignore
      return customElementRegistry.oldDefine(tag, cstr)
    } catch (exception) {
      console.error(`Error while registering web component: ${tag}`, exception)
    }
  }
}

export interface Resources<D extends FieldDefinition, V> {
  id?: string
  components: Components
  definition: D
  context: any
  settings?: Settings
  value?: V
  parentPath: string
  errors?: InvalidErrors
  changeHandler?: any
  clickHandler?: any
  invalidHandler?: any
}

export interface Component {
  importPath: string | string[],
  factory: (resources: Resources<FieldDefinition, any>) => TemplateResult
  module?: string,
  focusable?: boolean
}

export interface Components {
  [index: string]: Component
}

export type Settings = Object

export class Library {
  components: Components = {}
  icon?: TemplateResult
  displayName?: string
  settingsEditor?: FormDefinition
  onSettingsChanged?: (settings: Settings) => Settings

  registerComponent(type: string, component: Component) {
    this.components[type] = { focusable: true, ...component }
  }
}

export interface Libraries {
  [index: string]: Library
}

export interface Editor extends FieldDefinition {
  title: string
  icon: TemplateResult
  interaction?: string
  summary?: (definition: FieldDefinition) => TemplateResult
  prepareFieldsForLayout?: (context: any) => FieldDefinition[]
}

export interface FormEditor extends Editor, FormDefinition { }

export interface Renderer {
  type: string
  editor: FormEditor
}

export interface LayoutEditor extends Editor {
  fields?: FieldDefinition[]
  isMatching(layout: Layout): boolean
}

export interface Editors {
  [index: string]: Editor
}

export interface Category {
  name: string
  displayName: string
  types: string[];
  icon?: TemplateResult
}

export type Categories = Category[]

export interface Icons {
  [index: string]: TemplateResult
}

export interface Formatter {
  containerStyle(layout: Layout, ...context: any): string
  fieldStyle(layout: Layout, ...context: any): string
}

export type Formatters = { [index: string]: Formatter }

export function getUniqueElementId(): string {
  let counter = (window as any)['__formseyElementId'] as number
  if (typeof counter === "undefined") {
    counter = 0;
  }
  counter++;
  (window as any)['__formseyElementId'] = counter
  return "__fel-" + counter
}

export function getLibraries(): Libraries {
  return getRegistry("libraries")
}

export function getLibrary(name: string): Library {
  const libraries = getLibraries()
  let library = libraries[name]
  if (typeof library === "undefined") {
    library = new Library()
    libraries[name] = library
  }
  return library
}

export function getDefaultLibrary(): string | undefined {
  let libraries = getLibraries()
  if (typeof libraries != "undefined") {
    let avaliableLibraries = Object.keys(libraries)
    if (avaliableLibraries.length == 0) {
      return undefined;
    } else {
      return avaliableLibraries[0]
    }
  }
  return undefined
}

function getRegistry(name: string, init?: any): any {
  let registries = (window as any)['__formsey']
  if (typeof registries === "undefined") {
    registries = {} as Object
    (window as any)['__formsey'] = registries
    console.log("Create registry")
  }
  let registry = registries[name]
  if (typeof registries[name] === "undefined") {
    registry = init || {}
    registries[name] = registry
  }
  return registry
}

function get<T>(registry: string, name: string): T {
  return getRegistry(registry)[name]
}

function register<T>(registry: string, name: string, item: T) {
  getRegistry(registry)[name] = item
}

export function getEditors(): Editors {
  return getRegistry("editors")
}

export function getEditor(name: string, context?: any): Editor | undefined {
  const editor = get("editors", name)
  if (typeof editor == "function") {
    return editor(context)
  }
  return editor as Editor
}

export function registerEditor(name: string, editor: Editor | ((context: any) => Editor)) {
  register("editors", name, editor)
}

export function getRenderers(): { [key: string]: Renderer | undefined } {
  return getRegistry("renderers")
}

export function getRenderer(name: string): Renderer | undefined {
  return get("renderers", name)
}

export function registerRenderer(name: string, renderer: Renderer) {
  register("renderers", name, renderer)
}

export function getCategories(): Categories {
  return getRegistry("categories", [])
}

export function getCategory(name: string): Category | null {
  for (let category of getCategories()) {
    if (category.name == name) {
      return category
    }
  }
  return null
}

export function addCategory(category: Category) {
  getCategories().push(category)
}

export function getIcons(): Icons {
  return getRegistry("icons")
}

export function getIcon(name: string): TemplateResult | undefined {
  return get("icons", name)
}

export function registerIcon(name: string, template: TemplateResult) {
  register("icons", name, template)
}

export function getFormatters(): Formatters {
  return getRegistry("formatters", {})
}

export function getFormatter(name: string): Formatter | undefined {
  return get("formatters", name)
}

export function registerFormatter(name: string, formatter: Formatter) {
  register("formatters", name, formatter)
}

export function getMessages(): { [key: string]: any } {
  return getRegistry("messages")
}

export function translate(key: string, data: any): TemplateResult | undefined {
  return get("messages", key)
}

export function registerMessages(locale: string, messages: { [key: string]: any }) {
  register("messages", locale, messages)
}

export function area(field: FieldDefinition, fields: FieldDefinition[]): string {
  let area = field.name || ""
  if (area == "") {
    let typeCounter = 0
    area = field.type || ""
    fields.forEach(formField => {
      if (field === formField) {
        area += typeCounter
      }
      if (formField.type === field.type) {
        typeCounter++
      }
    })
  }
  return area
}