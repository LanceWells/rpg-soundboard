import { Parser } from 'html-to-react'

export type IconPreviewProps = {
  icon: string
}

export function IconPreview(props: IconPreviewProps) {
  const { icon } = props

  const reactNode = Parser().parse(icon)

  return reactNode
}
