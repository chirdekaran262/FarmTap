
# 🚜 SmartFarm - Equipment Rental App

SmartFarm is a full-stack application designed to streamline agricultural equipment rentals. Built with **Spring Boot** for the backend and **React Native** for the mobile frontend, it allows farmers to browse, book, and manage equipment while owners can list and monitor their assets.

---

## 🔧 Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Spring Boot (REST API)
- **Database:** MySQL / PostgreSQL (based on your config)
- **Authentication:** Token-based (JWT or session-based)
- **HTTP Client:** Axios (React Native), Spring RestTemplate

---

## 🚀 Features

### 👨‍🌾 For Farmers:
- Browse all available agricultural equipment.
- View details such as price per day, location, and owner.
- Book available equipment.
- See equipment availability status in real-time.

### 👨‍🔧 For Owners:
- Add new equipment with image, price, description, and location.
- View a list of their equipment.
- Change equipment availability.

### 🔐 Authentication:
- Role-based login (FARMER / OWNER).
- Session persistence.
- Secure API access with proper authorization.

### 🌐 API Endpoints (Spring Boot):
- `POST /auth/login`: Login endpoint for users.
- `GET /equipment`: Get all equipment listings.
- `POST /equipment`: Add new equipment (OWNER only).
- `POST /bookings`: Book an equipment (FARMER only).

---

## 📱 Screens in React Native App

- **Login Screen**
- **Equipment List**
- **Add Equipment (Owner only)**
- **Booking confirmation popup**
- **Logout functionality**
- **Pull to refresh on list**

---

## 🛠️ Setup Instructions

### Backend (Spring Boot)

1. Clone the repo:
   ```bash
   git clone https://github.com/chirdekaran262/FarmTap.git
   cd FarmTapApp
   ```

2. Configure `application.properties`:
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/farmtap
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   ```

3. Run:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend (React Native)

1. Clone the repo:
   ```bash
   git clone https://github.com/chirdekaran262/farmtap.git
   cd farmtap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Expo:
   ```bash
   npm start
   ```

4. Set API base URL in `services/api.js` to match your backend server.

---

## 📸 Screenshots


---

## 📄 License

MIT License

---

## 🙋‍♂️ Author

- **Karan Chirde** - [@chirdekaran262](https://github.com/chirdekaran262)
