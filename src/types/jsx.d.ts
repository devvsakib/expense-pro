import React from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      head: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      link: React.DetailedHTMLProps<
        React.LinkHTMLAttributes<HTMLLinkElement>,
        HTMLLinkElement
      >
      meta: React.DetailedHTMLProps<
        React.MetaHTMLAttributes<HTMLMetaElement>,
        HTMLMetaElement
      >
    }
  }
}

export {}
