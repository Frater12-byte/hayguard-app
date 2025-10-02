// Add these routes to your existing Routes section in App.js:

<Route path="/my-farm" element={<MyFarm />} />
<Route path="/my-profile" element={<MyProfile />} />

// Add these imports at the top of App.js:
import MyFarm from './components/Farm/MyFarm';
import MyProfile from './components/Profile/MyProfile';
