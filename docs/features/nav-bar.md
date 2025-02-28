# Navigation Bar Configuration

## Features
- 🌞🌙 Light/Dark mode toggle
- ✅ Account & Authentication
- 🔍 Event Discovery (Links to Search Page)
- 🎤 Manage (Visible Only If User Has Created an Event)
- 🔑 Login/Sign Up (Updates to Sign Out if Logged In)
- 👤 Profile (Links to User Profile)

## Navbar Structure

```html
<nav>
  <ul>
    <li><a href="/search">Search Events</a></li>
    <li><a href="/my-events">My Events</a></li>
    <li><a href="/settings">Account Settings</a></li>
    <li><a href="#" id="toggle-theme">🌞/🌙</a></li>
    <li id="profile-link" style="display: none;"><a href="/profile">Profile</a></li>
    <li id="manage-link" style="display: none;"><a href="/manage">Manage</a></li>
    <li id="login-signup">
      <a href="/login">Login</a> / <a href="/signup">Sign Up</a>
    </li>
    <li id="logout" style="display: none;"><a href="/logout">Sign Out</a></li>
  </ul>
</nav>

<script>
  // Replace with actual user authentication logic
  const userIsLoggedIn = false; // Example: Set this dynamically based on auth status
  const userHasCreatedEvent = true; // Example: Check if the user has created an event

  if (userIsLoggedIn) {
    document.getElementById('login-signup').style.display = 'none';
    document.getElementById('logout').style.display = 'block';
    document.getElementById('profile-link').style.display = 'block';
  }

  if (userHasCreatedEvent) {
    document.getElementById('manage-link').style.display = 'block';
  }
</script>