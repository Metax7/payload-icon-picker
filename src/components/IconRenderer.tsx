import type { DOMNode } from 'html-react-parser'

import HTMLReactParser, { attributesToProps, domToReact, Element } from 'html-react-parser'
import React from 'react'

const parse = HTMLReactParser as unknown as typeof HTMLReactParser.default

interface IconRendererProps extends React.SVGProps<SVGSVGElement> {
  color?: string
  size?: number | string
  svgString: string
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  className,
  color,
  size,
  svgString,
  ...restProps
}) => {
  if (!svgString) {
    return null
  }

  return (
    <>
      {parse(svgString, {
        replace: (domNode) => {
          if (domNode instanceof Element && domNode.name === 'svg') {
            const props = attributesToProps(domNode.attribs)

            return React.createElement(
              'svg',
              {
                ...props,
                className: [props.className, className].filter(Boolean).join(' '),
                ...(size && { height: size, width: size }),
                ...(color && {
                  fill:
                    props.fill === 'currentColor' || (props.fill && props.fill !== 'none')
                      ? color
                      : props.fill,
                  stroke: props.stroke && props.stroke !== 'none' ? color : props.stroke,
                }),
                ...restProps,
              },
              domToReact(domNode.children as DOMNode[]),
            )
          }
        },
      })}
    </>
  )
}

export default IconRenderer
