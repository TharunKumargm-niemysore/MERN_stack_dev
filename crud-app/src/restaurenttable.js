import { useState, useEffect } from 'react';
import axios from 'axios';

const RestaurantTable = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [editRecord, setEditRecord] = useState(null);
    const [form, setForm] = useState({ id: 0, name: '', type: '', location: '', rating: 0, top_food: '' });

    // Fetch data from API.
    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get("http://localhost:8001/getAllRestaurants");
            console.log(response.data);
            setRestaurants(response.data);
        } catch (error) {
            console.error("Error fetching restaurants..", error);
        }
    };

    return (
        <div>
            <h2>Restaurant List</h2>
            <table border={1} cellPadding={10}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Restaurant Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Rating</th>
                        <th>Top Food</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {restaurants.map((restaurant) => (
                        <tr key={restaurant.id}>
                            <td>{restaurant.id}</td>
                            <td>{restaurant.name}</td>
                            <td>{restaurant.type}</td>
                            <td>{restaurant.location}</td>
                            <td>{restaurant.rating}</td>
                            <td>{restaurant.top_food}</td>
                            <td>
                                {/* Add action buttons here if needed */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RestaurantTable;
