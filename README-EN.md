# Iftar Vakti Pro

Stay updated with iftar, sahur, and prayer times through a modern, elegant, and premium PWA application. Developed by [systemconf](http://systemconf.online), this project merges traditional Islamic aesthetics with cutting-edge web technology.

---

[Türkçe Versiyon (README.md)](README.md) | [Live Demo](https://iftarvaktipro.systemconf.online)

---

![Banner](public/kapak.png)

![Version](https://img.shields.io/badge/Version-v1.1.0-d4af37?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)
[![Website](https://img.shields.io/badge/Web-iftarvaktipro.systemconf.online-064e3b?style=for-the-badge)](https://iftarvaktipro.systemconf.online)

## Key Features

### Sacred Heritage Design
The application features a unique design language called "Sacred Heritage." Emerald green and gold tones are blended with arabesque geometric patterns to provide a serene and spiritual user experience.

### Smart Location Services
- **Automatic Geolocation**: Detects your location upon launch to fetch the most accurate prayer times.
- **Manual City Selection**: Support for all 81 cities in Turkey as a fallback or manual preference.

### Advanced Ramadan Calendar (Imsakiye)
- Full 30-day Ramadan schedule.
- Automatic highlighting of the current day.
- Fully localized in Turkish.

### Notifications & Reminders
- **Iftar & Sahur**: Instant notifications as the time approaches and when it arrives.
- **PWA Support**: Install the app on your mobile device via "Add to Home Screen" for a native app feel.
- **Premium Splash Screen**: An elegant welcome experience with high-quality cover art and smooth animations.

## Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)
- **PWA**: Integrated via `next-pwa` for offline support and background notifications.

## Installation & Setup

To run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/system-conf/iftarvaktipro.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` in your browser.

## Screenshots

![App Preview](public/image.png)

## PWA Assets

| Icon (512x512) | Icon (192x192) | Apple Touch |
| :---: | :---: | :---: |
| ![512](public/icon-512.png) | ![192](public/icon-192.png) | ![Apple](public/apple-touch-icon.png) |

## Contribution

This project is open-source and welcomes community contributions.
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

Developed by [systemconf](http://systemconf.online)
