# Macao LRT Web App 🚊

A modern web application providing comprehensive information about the Macao Light Rail Transit (LRT) system. Built with React, Vite, and Tailwind CSS.

## ✨ Features

- 🗺️ **Interactive Station Map** - View all LRT stations with integrated AMap (高德地图)
- 🚉 **Station Information** - Detailed information for each station including facilities and services
- 🛤️ **Route Planning** - Plan your journey between stations with real-time route suggestions
- 💰 **Fare Calculator** - Calculate fares between any two stations
- 🌐 **Multi-language Support** - Available in multiple languages
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/lrt-web-app.git
cd lrt-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 📦 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **AMap API** - Map integration (高德地图)

## 📁 Project Structure

```
lrt-web-app/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable React components
│   ├── contexts/    # React contexts (e.g., LanguageContext)
│   ├── lib/         # Utility functions
│   ├── pages/       # Page components
│   │   ├── Home.jsx
│   │   ├── StationList.jsx
│   │   ├── StationDetails.jsx
│   │   ├── RoutePlanning.jsx
│   │   └── FareQuery.jsx
│   ├── App.jsx      # Main app component
│   └── main.jsx     # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🌐 Pages

- **Home** - Overview and quick access to main features
- **Stations** - List of all LRT stations
- **Station Details** - Detailed information for individual stations
- **Route Planning** - Journey planner with route suggestions
- **Fare Query** - Calculate fares between stations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Map data provided by AMap (高德地图)
- Icons by Lucide

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ for Macao LRT passengers
