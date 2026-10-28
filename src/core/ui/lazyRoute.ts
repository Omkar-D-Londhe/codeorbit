import React, { type ComponentType } from 'react'

export function lazyRoute<P extends object = object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  _name?: string
): ComponentType<P> {
  return React.lazy(factory)
}
