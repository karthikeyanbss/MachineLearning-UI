import { useState } from 'react'
import './App.css'

const API_URL = 'https://ner-api.lemonbay-b25f13cd.eastus.azurecontainerapps.io/extract'
const API_BATCH_URL = 'https://ner-api.lemonbay-b25f13cd.eastus.azurecontainerapps.io/extract/batch'

// Demo data for testing when API is not available
const DEMO_TEXT = "Apple Inc. is a technology company headquartered in Cupertino, California. It was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. Today, Apple is valued at over $2 trillion."

const DEMO_ENTITIES = [
  { text: "Apple Inc.", label: "ORG", start: 0, end: 10 },
  { text: "Cupertino", label: "GPE", start: 54, end: 63 },
  { text: "California", label: "GPE", start: 65, end: 75 },
  { text: "Steve Jobs", label: "PERSON", start: 95, end: 105 },
  { text: "Steve Wozniak", label: "PERSON", start: 107, end: 120 },
  { text: "Ronald Wayne", label: "PERSON", start: 126, end: 138 },
  { text: "1976", label: "DATE", start: 142, end: 146 },
  { text: "$2 trillion", label: "MONEY", start: 178, end: 189 }
]

function App() {
  const [text, setText] = useState('')
  const [entities, setEntities] = useState([])
  const [results, setResults] = useState([]) // for batch responses
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [demoMode, setDemoMode] = useState(false)

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
      if (demoMode) {
        // Use demo data
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        setEntities(DEMO_ENTITIES)
        setResults([])
      } else {
        const isBatch = text.includes('\n')
        if (isBatch) {
          // Prepare texts array from multiple lines
          const texts = text.split(/\r?\n/).map(t => t.trim()).filter(Boolean)
          const response = await fetch(API_BATCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts }),
          })
          if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`)
          const data = await response.json()
          // The API returns results without the original text string. Attach the sent texts
          const merged = (data.results || []).map((r, idx) => ({ ...r, text: texts[idx] || '' }))
          setResults(merged)
          setEntities([])
        } else {
          // Single-line request
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          })
          if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`)
          const data = await response.json()
          setEntities(data.entities || [])
          setResults([])
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadDemoText = () => {
    setText(DEMO_TEXT)
    setError(null)
    setEntities([])
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

  const highlightTextWithEntities = (sourceText, sourceEntities) => {
    if (!sourceText || !sourceEntities || sourceEntities.length === 0) return sourceText
    const sorted = [...sourceEntities].sort((a, b) => a.start - b.start)
    const parts = []
    let last = 0
    sorted.forEach((entity, i) => {
      if (entity.start > last) parts.push({ text: sourceText.slice(last, entity.start), isEntity: false })
      parts.push({ text: entity.text, isEntity: true, type: entity.label, key: i })
      last = entity.end
    })
    if (last < sourceText.length) parts.push({ text: sourceText.slice(last), isEntity: false })

    return parts.map((part, idx) => part.isEntity ? (
      <span
        key={`entity-${idx}`}
        className="entity"
        style={{ backgroundColor: getEntityColor(part.type), padding: '2px 4px', borderRadius: '3px', margin: '0 2px', display: 'inline-block' }}
        title={part.type}
      >{part.text}</span>
    ) : (
      <span key={`text-${idx}`}>{part.text}</span>
    ))
  }

  const renderBatchResults = () => {
    if (!results || results.length === 0) return null
    return (
      <div className="batch-results">
        <h2>Batch Results ({results.length} texts)</h2>
        {results.map((res, i) => (
          <div key={i} className="batch-item">
            <h4>Text {i + 1} ({res.entity_count || 0} entities)</h4>
            <div className="highlighted-text">{highlightTextWithEntities(res.text || '', res.entities || [])}</div>
            <div className="entities-list">
              {(res.entities || []).map((entity, idx) => (
                <div key={idx} className="entity-item">
                  <span className="entity-badge" style={{ backgroundColor: getEntityColor(entity.label) }}>{entity.label}</span>
                  <span className="entity-text">{entity.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>Named Entity Recognition (NER) API Tester</h1>
        <p className="subtitle">Test the NER API deployed on Azure Container Apps</p>
      </header>

      <main>
        <div className="mode-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            <span className="toggle-text">Demo Mode</span>
            {demoMode && <span className="demo-badge">Using demo data</span>}
          </label>
          {demoMode && (
            <button
              type="button"
              onClick={loadDemoText}
              className="demo-text-button"
            >
              Load Demo Text
            </button>
          )}
        </div>

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
              {highlightTextWithEntities(text, entities)}
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

        {results.length > 0 && renderBatchResults()}

        {!loading && !error && entities.length === 0 && results.length === 0 && text && (
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
