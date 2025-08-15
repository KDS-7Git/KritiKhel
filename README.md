# Games Website

This project is a simple web application that displays a list of games that can be played directly in the browser. The website is designed to be mobile-friendly and allows users to select a game from the list, which opens a dedicated window for that game.

## Project Structure

```
games-website
├── public
│   └── index.html          # Main HTML document
├── src
│   ├── components
│   │   ├── GameList.js     # Component for displaying the list of games
│   │   └── GameWindow.js    # Component for displaying the selected game
│   ├── games
│   │   ├── game1.js        # Logic and rendering for Game 1
│   │   ├── game2.js        # Logic and rendering for Game 2
│   │   ├── game3.js        # Logic and rendering for Game 3
│   │   ├── game4.js        # Logic and rendering for Game 4
│   │   ├── game5.js        # Logic and rendering for Game 5
│   │   └── game6.js        # Logic and rendering for Game 6
│   ├── App.js              # Main application component
│   └── styles
│       └── main.css        # CSS styles for the website
├── package.json             # npm configuration file
└── README.md                # Project documentation
```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd games-website
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- The main page displays a list of games.
- Click on a game title to open the game window and start playing.
- Each game is implemented in its own JavaScript file within the `src/games` directory.

