import { useState } from 'react'
import './App.css'

const API_URL = 'https://ner-api.lemonbay-b25f13cd.eastus.azurecontainerapps.io/ner'

function App() {
  const [text, setText] = useState('')
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      setError('Please enter some text')
      return
    }

    setLoading(true)
    setError(null)
    setEntities([])

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setEntities(data.entities || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getEntityColor = (entityType) => {
    const colors = {
      'PERSON': '#4CAF50',
      'ORG': '#2196F3',
      'GPE': '#FF9800',
      'LOC': '#9C27B0',
      'DATE': '#F44336',
      'TIME': '#E91E63',
      'MONEY': '#00BCD4',
      'PERCENT': '#FFC107',
      'FACILITY': '#8BC34A',
      'PRODUCT': '#CDDC39',
    }
    return colors[entityType] || '#607D8B'
  }

  const highlightEntities = () => {
    if (!text || entities.length === 0) {
      return text
    }

    const sortedEntities = [...entities].sort((a, b) => a.start - b.start)
    const parts = []
    let lastIndex = 0

    sortedEntities.forEach((entity, index) => {
      if (entity.start > lastIndex) {
        parts.push({ text: text.slice(lastIndex, entity.start), isEntity: false })
      }
      parts.push({
        text: entity.text,
        isEntity: true,
        type: entity.label,
        key: index,
      })
      lastIndex = entity.end
    })

    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isEntity: false })
    }

    return parts.map((part, index) => {
      if (part.isEntity) {
        return (
          <span
            key={`entity-${index}`}
            className="entity"
            style={{
              backgroundColor: getEntityColor(part.type),
              padding: '2px 4px',
              borderRadius: '3px',
              margin: '0 2px',
              display: 'inline-block',
            }}
            title={part.type}
          >
            {part.text}
          </span>
        )
      }
      return <span key={`text-${index}`}>{part.text}</span>
    })
  }

  return (
    <div className="app">
      <header>
        <h1>Named Entity Recognition (NER) API Tester</h1>
        <p className="subtitle">Test the NER API deployed on Azure Container Apps</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze for named entities (e.g., 'Apple Inc. is a company in California founded by Steve Jobs in 1976.')"
            rows="6"
            className="text-input"
          />
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {entities.length > 0 && (
          <div className="results">
            <h2>Results</h2>
            <div className="highlighted-text">
              {highlightEntities()}
            </div>

            <h3>Detected Entities</h3>
            <div className="entities-list">
              {entities.map((entity, index) => (
                <div key={index} className="entity-item">
                  <span
                    className="entity-badge"
                    style={{ backgroundColor: getEntityColor(entity.label) }}
                  >
                    {entity.label}
                  </span>
                  <span className="entity-text">{entity.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && entities.length === 0 && text && (
          <div className="info-message">
            No entities detected in the text.
          </div>
        )}
      </main>

      <footer>
        <p>
          API Endpoint: <code>{API_URL}</code>
        </p>
      </footer>
    </div>
  )
}

export default App
