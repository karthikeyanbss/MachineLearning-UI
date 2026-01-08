# NER API UI

A React UI to test the Named Entity Recognition (NER) API deployed on Azure Container Apps.

## Overview

This application provides a user-friendly interface to test the NER API that identifies and extracts named entities (such as persons, organizations, locations, dates, etc.) from text.

**API Endpoint:** https://ner-api.lemonbay-b25f13cd.eastus.azurecontainerapps.io/ner

**Backend Repository:** https://github.com/karthikeyanbss/MachineLearning

## Features

- **Text Input**: Enter any text to analyze for named entities
- **Real-time Analysis**: Send text to the NER API and get instant results
- **Entity Highlighting**: Visual highlighting of detected entities in the original text
- **Color-coded Labels**: Different colors for different entity types (PERSON, ORG, GPE, LOC, DATE, etc.)
- **Entity List**: Detailed list of all detected entities with their types
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Automatic theme switching based on system preferences

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/karthikeyanbss/MachineLearning-UI.git
cd MachineLearning-UI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in the terminal)

## Usage

1. Enter or paste text into the text area
2. Click "Analyze Text" to send the text to the NER API
3. View the results:
   - Highlighted entities in the original text
   - List of detected entities with their types

### Example Text

Try this sample text:
```
Apple Inc. is a technology company headquartered in Cupertino, California. It was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. Today, Apple is valued at over $2 trillion.
```

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## API Format

The NER API expects a POST request with JSON body:
```json
{
  "text": "Your text here"
}
```

And returns:
```json
{
  "entities": [
    {
      "text": "entity text",
      "label": "ENTITY_TYPE",
      "start": 0,
      "end": 11
    }
  ]
}
```

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **JavaScript (ES6+)** - Programming language
- **CSS3** - Styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.
