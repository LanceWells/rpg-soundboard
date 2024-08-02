import { icons } from '../../../../node_modules/@iconify-json/game-icons/'
import { iconToSVG, parseIconSet, validateIconSet } from '@iconify/utils'

export type IconBody = {
  name: string
  body: string
}

class SoundboardIcons {
  private _iconLookup: Map<string, string[]>
  private _iconRef: Map<string, string>

  constructor() {
    const iconRef = new Map<string, string>()

    // https://iconify.design/docs/libraries/utils/parse-icon-set.html
    validateIconSet(icons)
    parseIconSet(icons, (iconName, iconData) => {
      if (!iconData) {
        console.error(`could not parse ${iconName}`)
        return
      }

      const renderData = iconToSVG(iconData, {
        height: '64',
        width: '64'
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
}

export const soundboardIcons = new SoundboardIcons()
