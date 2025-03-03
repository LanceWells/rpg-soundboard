import { icons } from '../../../../node_modules/@iconify-json/game-icons/'
import { iconToSVG, parseIconSet, validateIconSet } from '@iconify/utils'

/**
 * Represents an individual "icon". This confers the icon's name as well as its SVG element.
 */
export type IconBody = {
  /**
   * The name of the icon to render.
   */
  name: string

  /**
   * The svg body of the icon to render. This is in plain html format, and will require some
   * additional handling to render as an individual icon.
   */
  body: string
}

/**
 * A helper class for use with the searching and looking up svg icons provided by
 * https://game-icons.net/.
 *
 * Generally used in a singleton pattern.
 */
class SoundboardIcons {
  private _iconLookup: Map<string, string[]>
  private _iconRef: Map<string, string>

  /**
   * Creates a new instance of a {@link SoundboardIcons}.
   */
  constructor() {
    const iconRef = new Map<string, string>()

    // The goal is to first evaluate the total icon set in order to create iterable objects.
    // https://iconify.design/docs/libraries/utils/parse-icon-set.html
    validateIconSet(icons)
    parseIconSet(icons, (iconName, iconData) => {
      if (!iconData) {
        console.error(`could not parse ${iconName}`)
        return
      }

      const renderData = iconToSVG(iconData, {
        height: '96',
        width: '96'
      })

      const svgAttributes: Record<string, string> = {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        ...renderData.attributes
      }

      const svgAttributesStr = Object.keys(svgAttributes)
        .map(
          (attr) =>
            // No need to check attributes for special characters, such as quotes,
            // they cannot contain anything that needs escaping.
            `${attr}="${svgAttributes[attr as keyof typeof svgAttributes]}"`
        )
        .join(' ')

      // Generate SVG
      const svg = `<svg ${svgAttributesStr}>${renderData.body}</svg>`

      iconRef.set(iconName, svg)
    })

    // Then create a lookup map based on the icon's title. This is largely used when searching for
    // relevant icons.
    const iconLookup = new Map<string, string[]>()
    const iconEntries = [...iconRef.keys()]

    iconEntries.forEach((k) => {
      // The names for each icon are hyphen delimited, and will often include numeric indices. For
      // example, "abstract-01" or "assassin-pouch". The goal is to be able to search off of the
      // words, regardless of where they appear in the string.
      const iconPhrases = k.split('-')
      const iconWords = iconPhrases.map((i) => i.replaceAll(/[0-9]/g, '')).filter((i) => i !== '')

      iconWords.forEach((i) => {
        if (!iconLookup.has(i)) {
          iconLookup.set(i, [])
        }

        iconLookup.get(i)!.push(k)
      })
    })

    this._iconRef = iconRef
    this._iconLookup = iconLookup
  }

  /**
   * Finds icons that generally match the provided search string.
   *
   * At time of writing, the algorithm compares {@link search} against the start of each word in any
   * icon's title. For example, "tra" will matching "Tire Tracks", "Trampoline", "Trap Mask", etc.
   *
   * @param search The search pharse that should be used to discover icons.
   * @returns A set of icons that match the provided criteria.
   */
  SearchIcons(search: string): IconBody[] {
    if (search === '') {
      return []
    }

    const searchPhrases = search
      .split(/\s+/)
      .map((s) => s.toLowerCase())
      .filter((s) => s !== '')

    const lookupKeys = [...this._iconLookup.keys()]
    const matchingKeys = lookupKeys.filter((lookupKey) =>
      searchPhrases.some((searchPhrase) => lookupKey.startsWith(searchPhrase))
    )

    const matchingIcons = matchingKeys.flatMap((key) => this._iconLookup.get(key) ?? [])
    const iconBodies = matchingIcons
      .map<IconBody>((i) => ({
        name: i,
        body: this._iconRef.get(i) ?? ''
      }))
      .filter((i) => i.body !== '')

    return iconBodies
  }

  /**
   * Gets a particular icon by its specific identifier.
   * @param iconName The icon name that should be used to look up a particular icon's information.
   * @returns The icon, if one was found; otherwise undefined.
   */
  GetIcon(iconName: string): IconBody | undefined {
    const icon = this._iconRef.get(iconName)
    if (!icon) {
      return undefined
    }

    return {
      body: icon,
      name: iconName
    }
  }
}

export const soundboardIcons = new SoundboardIcons()
