import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const myStyle = {
    backgroundImage: 'url(/img9.jpg)',
    backgroundColor: 'red',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    id: '',
    name: '',
    type: '',
    location: '',
    rating: '',
    top_food: ''
  });
  const [editing, setEditing] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); 
  const [isRegistering, setIsRegistering] = useState(false); 

  useEffect(() => {
    if (token) {
      fetchRestaurants();
    }
  }, [token]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:8001/restaurants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant({
      ...newRestaurant,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(
          `http://localhost:8001/updateRestaurant/${editing}`,
          newRestaurant,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setEditing(null);
      } else {
        await axios.post(
          'http://localhost:8001/insertRestaurants',
          newRestaurant,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      setNewRestaurant({
        id: '',
        name: '',
        type: '',
        location: '',
        rating: '',
        top_food: ''
      });
      fetchRestaurants();
    } catch (error) {
      console.error('Error saving restaurant:', error);
    }
  };

  // Moved handleDelete outside handleSubmit
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8001/deleteRestaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  const handleEdit = (restaurant) => {
    setNewRestaurant(restaurant);
    setEditing(restaurant.id);
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8001/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      fetchRestaurants(); 
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRestaurants([]);
  };

  const handleRegister = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8001/register', { username, password });
      if (response.data.success) {
        alert('Registration successful! Please log in.');
        setIsRegistering(false); 
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div style={myStyle}>
      <div className="app-container">
        <h1 className="app-title">Restaurant Manager</h1>

        {!token ? (
          <div className="auth-form-container">
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isRegistering) {
                  handleRegister(e.target.username.value, e.target.password.value);
                } else {
                  handleLogin(e.target.username.value, e.target.password.value);
                }
              }}
            >
              <input type="text" name="username" placeholder="Username" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" className="submit-button">
                {isRegistering ? 'Register' : 'Login'}
              </button>
            </form>

            <div className="toggle-auth">
              <button
                className="toggle-button"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={handleLogout} className="logout-button">Logout</button>

            <form onSubmit={handleSubmit} className="restaurant-form">
              <input
                type="number"
                name="id"
                placeholder="ID"
                value={newRestaurant.id}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="name"
                placeholder="Restaurant Name"
                value={newRestaurant.name}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="type"
                placeholder="Type"
                value={newRestaurant.type}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newRestaurant.location}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="number"
                name="rating"
                placeholder="Rating"
                value={newRestaurant.rating}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="text"
                name="top_food"
                placeholder="Top Food"
                value={newRestaurant.top_food}
                onChange={handleChange}
                required
                className="input-field"
              />
              <button type="submit" className="submit-button">
                {editing ? 'Update' : 'Add'} Restaurant
              </button>
            </form>

            <h2 className="restaurant-list-title">Restaurant List</h2>
            <ul className="restaurant-list">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id} className="restaurant-item">
                  <p className="restaurant-name">
                    <strong>{restaurant.name}</strong> ({restaurant.type})
                  </p>
                  <p className="restaurant-details">Location: {restaurant.location}</p>
                  <p className="restaurant-details">Rating: {restaurant.rating}</p>
                  <p className="restaurant-details">Top Food: {restaurant.top_food}</p>
                  <div className="button-group">
                    <button onClick={() => handleEdit(restaurant)} className="edit-button">Edit</button>
                    <button onClick={() => handleDelete(restaurant.id)} className="delete-button">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
