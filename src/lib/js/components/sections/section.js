import i18n from '@draggable/i18n'
import Sortable from 'sortablejs'
import dom from '../../common/dom.js'
import { ROW_CLASSNAME, SECTION_CLASSNAME } from '../../constants.js'
import Component from '../component.js'

const DEFAULT_DATA = () =>
  Object.freeze({
    config: {
      title: '', // Section title
      collapsible: false, // Can be collapsed
      expanded: true, // Default state if collapsible
    },
    children: [],
    className: [SECTION_CLASSNAME],
  })

/**
 * Editor Section
 */
export default class Section extends Component {
  constructor(sectionData) {
    super('section', { ...DEFAULT_DATA(), ...sectionData })
    const children = this.createChildWrap()

    this.dom = dom.create({
      tag: 'div',
      className: [SECTION_CLASSNAME, 'empty'],
      dataset: {
        hoverTag: i18n.get('section'),
        editingHoverTag: i18n.get('editing.section'),
      },
      id: this.id,
      content: [this.getComponentTag(), this.getActionButtons(), this.editWindow, children],
    })

    Sortable.create(children, {
      animation: 150,
      fallbackClass: 'row-moving',
      forceFallback: true,
      group: {
        name: 'section',
        pull: true,
        put: ['section', 'row', 'controls'],
      },
      sort: true,
      disabled: false,
      onRemove: this.onRemove.bind(this),
      onEnd: this.onEnd.bind(this),
      onAdd: this.onAdd.bind(this),
      onSort: this.onSort.bind(this),
      draggable: `.${ROW_CLASSNAME}`,
      handle: '.item-move',
    })
  }

  /**
   * Edit window for Section
   */
  get editWindow() {
    const titleInput = {
      tag: 'input',
      attrs: {
        type: 'text',
        placeholder: i18n.get('section.title.placeholder') || 'Section Title',
        value: this.get('config.title') || '',
      },
      config: { label: i18n.get('section.title') || 'Title' },
      action: {
        input: ({ target }) => {
          this.set('config.title', target.value)
          this.updateTitle()
        },
      },
    }

    const collapsibleCheckbox = {
      tag: 'input',
      attrs: {
        type: 'checkbox',
        checked: this.get('config.collapsible') || false,
      },
      config: { label: i18n.get('section.collapsible') || 'Collapsible' },
      action: {
        change: ({ target }) => {
          this.set('config.collapsible', target.checked)
        },
      },
    }

    const editWindow = dom.create({
      className: `${this.name}-edit group-config`,
      content: [dom.formGroup([titleInput]), dom.formGroup([collapsibleCheckbox])],
    })

    return editWindow
  }

  /**
   * Update section title display
   */
  updateTitle() {
    const title = this.get('config.title')
    let titleElement = this.dom.querySelector('.section-title')

    if (title) {
      if (!titleElement) {
        titleElement = dom.create({
          tag: 'h3',
          className: 'section-title',
          content: title,
        })
        this.dom.insertBefore(titleElement, this.dom.querySelector('.child-wrap'))
      } else {
        titleElement.textContent = title
      }
    } else if (titleElement) {
      titleElement.remove()
    }
  }

  /**
   * Process config changes
   */
  processConfig() {
    this.updateTitle()
  }
}
