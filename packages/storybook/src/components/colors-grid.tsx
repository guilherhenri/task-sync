import '../styles/colors-grid.css'

import { colors } from '@task-sync/design-tokens'
import { contrast } from 'colorizr'

export function ColorsGrid() {
  return Object.entries(colors).map(([key, color], index) => (
    <div
      key={`${index}-${color}`}
      className="colors-grid"
      style={{ backgroundColor: color }}
    >
      <div
        style={{
          color: contrast(color, '#fff') < 3.5 ? '#000' : '#fff',
        }}
      >
        <strong>${key}</strong>
        <span>{color}</span>
      </div>
    </div>
  ))
}
