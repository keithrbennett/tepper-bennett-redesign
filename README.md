# Tepper & Bennett - Masters of American Song

A modern, responsive website showcasing the musical legacy of Sid Tepper and Roy C. Bennett, one of America's most prolific songwriting duos known for their collaborations with Elvis Presley, Frank Sinatra, The Beatles, and many other legendary artists.

## 🎵 About the Project

This website serves as a digital tribute to the songwriting partnership of Sid Tepper and Roy C. Bennett. The site showcases their catalog of songs, including 42 songs recorded by Elvis Presley, and provides basic resources for music supervisors and fans.

### Key Features

- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Interactive Song Database**: Searchable and sortable song catalog 
- **Elvis Presley Collection**: Dedicated section showcasing the duo's 42 songs recorded by Elvis
- **Genre Information**: Brief descriptions of musical categories with representative song examples
- **Dynamic Data Loading**: YAML-based data architecture for easy maintenance
- **Collapsible Sections**: Smooth UI with expandable content sections
- **Rights Administration Information**: Contact details for licensing inquiries

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JavaScript (ES6+)**: Interactive functionality and data processing
- **List.js**: Library for searchable and sortable tables
- **js-yaml**: YAML parsing library for data processing

### Data Architecture
- **YAML**: Structured data format for songs, performers, and metadata
- **JSON**: Conversion utilities for data processing
- **CDN-hosted Libraries**: External dependencies for performance

### Build Tools
- **Node.js**: Package management and build scripts
- **Tailwind CSS CLI**: Development server and CSS compilation
- **Git**: Version control

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tb-redesign
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Serve the application**
   ```bash
   # Using Python (recommended for full functionality)
   python -m http.server 8000
   
   # Or using any other web server
   npx serve .
   ```

The application will be available at `http://localhost:8000`

## 📊 Data Management

### Data Structure

The site uses YAML files for data organization:

- **Songs**: Stored in separate files for Elvis and non-Elvis songs
- **Performers**: Basic artist information with codes
- **Organizations**: Rights administrators and contact details
- **Song Plays**: Mapping of songs to performers with YouTube links
- **Rights Administration**: Mapping of songs to their rights administrators

### Adding New Songs

1. **Add song data** to either `elvis-songs.yml` or `non-elvis-songs.yml`:
   ```yaml
   - code: song-unique-code
     name: Song Title
     genres:
       - genre1
       - genre2
     movie: movie-title (optional)
   ```

2. **Add performer information** to `performers.yml` if new performer:
   ```yaml
   - code: performer-code
     name: Performer Name
   ```

3. **Update song-plays.yml** with performance data:
   ```yaml
   - song_code: song-unique-code
     performer_codes: performer-code
     youtube_key: youtube-video-id (optional)
   ```

## 🔧 Configuration

### Global Settings (`js/config.js`)

Key configuration options:
- **Debug Mode**: Toggle development logging
- **Data Directory**: Path to YAML data files
- **Pagination**: Desktop and mobile settings
- **Search**: Character requirements and debounce timing
- **Animation**: Duration settings for UI transitions
- **UI Elements**: Scroll-to-top visibility offset

### Performance Features

The site includes basic performance optimizations:
- **Lazy Loading**: JavaScript executes after DOM is ready
- **Debounced Search**: Reduces rapid API calls during typing
- **Pagination**: Basic data rendering for datasets
- **Responsive Images**: Optimized for different screen sizes
- **Minimal Dependencies**: Only essential libraries loaded

## 🎨 Design System

### Color Palette
- **Navy Blue** (`#1A305E`): Primary brand color
- **Gold** (`#B8860B`): Secondary accent color
- **White** (`#FFFFFF`): Text and background
- **Gray**: Neutral tones for UI elements

### Typography
- **Playfair Display**: Serif font for headings and titles
- **Montserrat**: Sans-serif font for body text and navigation

### Components
- **Collapsible Sections**: Basic expandable content areas
- **Data Tables**: Simple sortable and searchable song listings
- **Navigation**: Fixed sidebar with responsive behavior
- **Stats Cards**: Basic statistics display
- **Contact Information**: Simple inquiry contact details

## 🚦 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Required Features
- ES6 JavaScript support
- Fetch API
- CSS Grid and Flexbox
- LocalStorage for UI state

## 🔒 Security Considerations

- **No Server-Side Processing**: Static site deployment
- **External Dependencies**: CDN-hosted libraries with integrity checks
- **Basic Data Handling**: Client-side data processing
- **HTTPS Recommended**: Secure serving of content

## 📱 Responsive Design

The site uses a mobile-first approach with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Basic mobile considerations:
- **Pagination**: Fewer items per page on mobile
- **Navigation**: Responsive layout adjustments
- **Tables**: Horizontal scrolling on small screens
- **Touch Targets**: Reasonably sized interactive elements

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Use English for all code comments and documentation
- Keep changes focused and atomic
- Test across different screen sizes
- Validate YAML data files

## 📄 License

This project is licensed under the MIT License as specified in the LICENSE.txt file. 

## 📞 Contact

- **Email**: info@tepper-bennett.com
- **Website**: https://www.tepper-bennett.com

---

**Note**: This website is a non-monetized tribute intended to showcase the Tepper and Bennett 
musical legacy and assist music supervisors in selecting songs for productions. 
All information is provided in good faith, though errors or omissions may exist. 
Please verify rights administration information directly with the organizations listed.