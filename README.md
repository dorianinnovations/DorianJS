# Dorian - An Experimental Emotional AI System

Dorian is a learning project exploring how digital systems can exhibit emotional behavior through cellular automata, real-time simulation, and emergent interactions. It's designed as a foundation for understanding how complex behaviors can arise from simple rules and feedback loops.

## What This Project Explores

### Core Concepts
- **Emergent Behavior**: How simple rules can create complex, unpredictable patterns
- **Emotional Simulation**: Mapping emotional states to visual and behavioral systems
- **Interactive Learning**: Real-time adaptation based on user interactions and environmental changes
- **Cellular Automata**: Using grid-based systems to model emotional spread and evolution

### Current Implementation
- **Web-based Simulation**: Real-time canvas visualization of emotional states
- **Emotional Engine**: 20+ emotional states with relationships and transformations
- **Interactive Interface**: Click to seed emotions, paint with different emotional states
- **Memory System**: Persistent emotional history and pattern recognition
- **Chat Integration**: Conversational interface with emotional context

## Project Structure

```
├── dorian.js              # Main simulation engine and UI management
├── emotions.js            # Emotional system definitions and relationships
├── worker.js              # Web worker for simulation calculations
├── gptIntegration.js      # AI chat integration
├── memory.js              # Memory and persistence system
├── botCreation.js         # Bot creation and management
├── dorianUniverse.js      # Universe simulation logic
├── index.html             # Main web interface
├── style.css              # Styling and visual effects
├── server.js              # Express server for API endpoints
└── package.json           # Node.js dependencies
```

## Key Features

### Emotional System
- **Primary Emotions**: Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation
- **Emergent Emotions**: Affectionate, Shocked, Contempt, Hopeful, Depressed, Delight, Anxiety, Aggression
- **Complex Emotions**: Euphoric, Melancholy, Vindictive, Panic
- **Emotional Relationships**: Amplification, suppression, and transformation rules

### Interactive Elements
- **Canvas Simulation**: Real-time visualization of emotional spread
- **Emotional Painting**: Apply different emotions to the simulation
- **Chat Interface**: Conversational AI with emotional context
- **Memory Tracking**: Persistent emotional history and patterns

### Technical Implementation
- **Web Workers**: Background processing for simulation calculations
- **Canvas API**: Real-time visual rendering
- **Express Server**: API endpoints for chat and data persistence
- **Modular Architecture**: Separated concerns for maintainability

## Getting Started

### Prerequisites
- Node.js (>=14.0.0)
- Modern web browser with Web Worker support

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   OPENROUTER_API_KEY=your-openrouter-key
   ALLOWED_ORIGINS=https://example.com,https://staging.example.com
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Learning Goals

This project serves as a learning platform for:

- **Complex Systems**: Understanding how simple rules create complex behavior
- **Emotional AI**: Exploring non-traditional approaches to AI emotional modeling
- **Interactive Design**: Creating engaging user experiences through simulation
- **Web Technologies**: Modern JavaScript, Canvas API, Web Workers
- **Emergent Behavior**: Studying how systems evolve beyond their initial design

## Current Status

This is an experimental learning project in active development. The core simulation engine is functional, but many features are still being explored and refined. The project serves as a foundation for understanding:

- How emotional states can be modeled computationally
- Ways to create engaging, emergent interactions
- Methods for visualizing abstract concepts
- Approaches to building responsive, adaptive systems

## Contributing

This project welcomes contributions from learners and researchers interested in:
- Emotional AI and affective computing
- Complex systems and emergence
- Interactive art and creative coding
- Experimental user interfaces

Please feel free to explore the code, experiment with modifications, and share your learnings.

## Technical Notes

- The simulation uses a cellular automata approach with emotional states
- Web Workers handle the computational load for smooth performance
- The emotional system includes relationships, transformations, and memory
- The interface combines real-time visualization with conversational AI

## Future Explorations

Areas for continued learning and development:
- Enhanced emotional complexity and relationships
- More sophisticated memory and learning systems
- Integration with external data sources
- Mobile and touch interface improvements
- Performance optimization for larger simulations

---

*This project is designed for learning and experimentation. It explores the boundaries between computation, emotion, and interaction in digital systems.*
 

