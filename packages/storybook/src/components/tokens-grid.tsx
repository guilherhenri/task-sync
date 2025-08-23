import '../styles/tokens-grid.css'

import { colors } from '@task-sync/design-tokens'

interface TokensGridProps {
  tokens: Record<string, string>
  hasRemValue?: boolean
  withIndicator?: boolean
}

function sortArrayByValue(arr: [string, string][]): [string, string][] {
  return arr.sort((a, b) => {
    const convertToRem = (value: string): number => {
      const numericValue = parseFloat(value.replace(/px|rem/, ''))

      if (value.includes('px') && numericValue !== 0) {
        return numericValue / 16
      }

      return numericValue
    }

    const valueA = convertToRem(a[1])
    const valueB = convertToRem(b[1])

    return valueA - valueB
  })
}

export function TokensGrid({
  tokens,
  hasRemValue = false,
  withIndicator = false,
}: TokensGridProps) {
  const tokensArray = Object.entries(tokens)
  const tokensSorted = sortArrayByValue(tokensArray)

  return (
    <table className="tokens-grid">
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
          {hasRemValue && <th>Pixels</th>}
        </tr>
      </thead>
      <tbody>
        {tokensSorted.map(([key, value], index) => (
          <tr key={`${index}-${value}`}>
            <td>{key}</td>
            <td>{value}</td>
            {hasRemValue && (
              <td>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ width: '2rem', textAlign: 'right' }}>
                    {key === 'px'
                      ? '1'
                      : Number(value.replace('rem', '').replace('px', '')) * 16}
                  </span>
                  {withIndicator && (
                    <div
                      style={{
                        width: value,
                        height: '1rem',
                        backgroundColor: colors.primary,
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
