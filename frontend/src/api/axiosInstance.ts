import axios from 'axios'
import toast from 'react-hot-toast'

export const api = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },  
})


api.interceptors.request.use(
    (config) => {
        try {
            const persistedState = localStorage.getItem('medical-reservation-auth');
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                const token = parsed.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Błąd pobierania tokenu z localStorage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response)=> response,
    (error)=>{
        if(!error.response){
            toast.error("Błąd sieci: Serwer nie odpowiada."); 
        }
        return Promise.reject(error);
    }
);