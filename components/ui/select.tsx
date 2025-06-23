import * as React from "react"

export function Select({ children, onValueChange }) {
  return <select onChange={e => onValueChange(e.target.value)} className="border rounded p-2 w-full">{children}</select>
}

export function SelectTrigger({ children }) {
  return <>{children}</>
}

export function SelectContent({ children }) {
  return <>{children}</>
}

export function SelectItem({ children, value }) {
  return <option value={value}>{children}</option>
}

export function SelectValue({ placeholder }) {
  return <option disabled selected>{placeholder}</option>
}
