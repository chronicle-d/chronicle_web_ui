import * as React from "react"

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
