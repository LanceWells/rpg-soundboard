import { icons } from '@iconify-json/game-icons/'
import { IconSet } from '@iconify/tools'
import { IconSetIconEntry } from '@iconify/tools/lib/icon-set/types'
import { validateIconSet } from '@iconify/utils'

/**
 * https://iconify.design/docs/libraries/tools/import/json.html
 */
const jsonIconSet = validateIconSet(icons)
export const iconSet = new IconSet(jsonIconSet)

class SoundboardIcons {
  private _iconLookup: Map<string, IconSetIconEntry[]>

  constructor() {
    const jsonIconSet = validateIconSet(icons)
    const iconSet = new IconSet(jsonIconSet)

    const iconLookup = new Map<string, IconSetIconEntry[]>()

    const iconEntries = Object.entries(iconSet.entries) as [string, IconSetIconEntry][]
    iconEntries.forEach(([k, v]) => {
      // The names for each icon are hyphen delimited, and will often include numeric indices. For
      // example, "abstract-01" or "assassin-pouch". The goal is to be able to search off of the
      // words, regardless of where they appear in the string.
      const iconPhrases = k.split('-')
      const iconWords = iconPhrases.map((i) => i.replaceAll(/[0-9]/, '')).filter((i) => i !== '')

      iconWords.forEach((i) => {
        if (!iconLookup.has(i)) {
          iconLookup.set(i, [])
        }

        iconLookup.get(i)!.push(v)
      })
    })

    this._iconLookup = iconLookup
  }

  SearchIcons(search: string): IconSetIconEntry[] {
    const searchPhrases = search.split(/\s+/)
    const lookupKeys = [...this._iconLookup.keys()]
    const matchingKeys = lookupKeys.filter((lookupKey) =>
      searchPhrases.some((searchPhrase) => lookupKey.startsWith(searchPhrase))
    )

    const matchingIcons = matchingKeys.flatMap((key) => this._iconLookup.get(key) ?? [])
    return matchingIcons
  }
}

export const soundboardIcons = new SoundboardIcons()
